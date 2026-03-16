import { apiBadRequest, apiForbidden, apiOk, apiServerError, apiUnauthorized } from "@/lib/api";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { createAssignmentMcqAttemptSchema } from "@/lib/validation/schemas";

interface AssignmentMcqAttemptItem {
  id: string;
  mcqId: string;
  schoolId: string;
  studentId: string;
  selectedOption: "A" | "B" | "C" | "D";
  isCorrect: boolean;
  pointsEarned: number;
  createdAt: string;
}

function mapAttempt(row: Record<string, unknown>): AssignmentMcqAttemptItem {
  const selectedOption = String(row.selected_option ?? "A");

  return {
    id: String(row.id ?? ""),
    mcqId: String(row.mcq_id ?? ""),
    schoolId: String(row.school_id ?? ""),
    studentId: String(row.student_id ?? ""),
    selectedOption: (["A", "B", "C", "D"].includes(selectedOption) ? selectedOption : "A") as AssignmentMcqAttemptItem["selectedOption"],
    isCorrect: Boolean(row.is_correct),
    pointsEarned: Number(row.points_earned ?? 0),
    createdAt: String(row.created_at ?? new Date().toISOString()),
  };
}

function isMissingTableError(error: unknown) {
  const dbError = error as { code?: string; message?: string } | null;
  return dbError?.code === "42P01" || dbError?.message?.toLowerCase().includes("assignment_mcq_attempts");
}

function missingTableMessage() {
  return "Assignment MCQ attempts are not set up in the database yet. Apply the latest Supabase schema update.";
}

async function getAttemptContext() {
  const supabase = await createServerSupabaseClient();
  if (!supabase) {
    return { error: apiUnauthorized("Supabase is not configured."), supabase: null, profile: null };
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: apiUnauthorized(), supabase, profile: null };
  }

  const { data: profile, error } = await supabase
    .from("users")
    .select("id, school_id, role")
    .eq("id", user.id)
    .maybeSingle();

  if (error) {
    return { error: apiServerError("Unable to load the current user profile."), supabase, profile: null };
  }

  if (!profile?.school_id) {
    return { error: apiForbidden("This account is not linked to a school workspace yet."), supabase, profile: null };
  }

  return { error: null, supabase, profile };
}

export async function GET() {
  const context = await getAttemptContext();
  if (context.error || !context.supabase || !context.profile) {
    return context.error ?? apiUnauthorized();
  }

  const role = String(context.profile.role ?? "");
  let query = context.supabase
    .from("assignment_mcq_attempts")
    .select("*")
    .eq("school_id", String(context.profile.school_id));

  if (role === "student") {
    query = query.eq("student_id", String(context.profile.id));
  }

  const { data, error } = await query.order("created_at", { ascending: false });
  if (error) {
    if (isMissingTableError(error)) {
      return apiServerError(missingTableMessage());
    }
    return apiServerError("Unable to fetch assignment MCQ attempts.");
  }

  return apiOk((data ?? []).map((row) => mapAttempt(row as Record<string, unknown>)));
}

export async function POST(request: Request) {
  const context = await getAttemptContext();
  if (context.error || !context.supabase || !context.profile) {
    return context.error ?? apiUnauthorized();
  }

  if (String(context.profile.role ?? "") !== "student") {
    return apiForbidden("Only students can submit assignment MCQ attempts.");
  }

  const body = await request.json();
  const parsed = createAssignmentMcqAttemptSchema.safeParse(body);
  if (!parsed.success) {
    return apiBadRequest(parsed.error.issues[0]?.message ?? "Invalid assignment MCQ attempt payload.");
  }

  const { data: mcq, error: mcqError } = await context.supabase
    .from("assignment_mcqs")
    .select("id, school_id, correct_option, points")
    .eq("id", parsed.data.mcqId)
    .eq("school_id", String(context.profile.school_id))
    .maybeSingle();

  if (mcqError || !mcq) {
    if (isMissingTableError(mcqError)) {
      return apiServerError(missingTableMessage());
    }
    return apiBadRequest("The selected MCQ does not exist in this school.");
  }

  const correctOption = String(mcq.correct_option ?? "A");
  const isCorrect = parsed.data.selectedOption === correctOption;
  const pointsEarned = isCorrect ? Number(mcq.points ?? 0) : 0;

  const { data, error } = await context.supabase
    .from("assignment_mcq_attempts")
    .upsert(
      {
        mcq_id: parsed.data.mcqId,
        school_id: context.profile.school_id,
        student_id: context.profile.id,
        selected_option: parsed.data.selectedOption,
        is_correct: isCorrect,
        points_earned: pointsEarned,
        created_at: new Date().toISOString(),
      },
      { onConflict: "mcq_id,student_id" },
    )
    .select("*")
    .single();

  if (error || !data) {
    if (isMissingTableError(error)) {
      return apiServerError(missingTableMessage());
    }
    return apiServerError("Unable to save assignment MCQ attempt.");
  }

  return apiOk(mapAttempt(data as Record<string, unknown>));
}
