import { apiBadRequest, apiForbidden, apiOk, apiServerError, apiUnauthorized } from "@/lib/api";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { createAssignmentMcqSchema } from "@/lib/validation/schemas";

interface AssignmentMcqItem {
  id: string;
  question: string;
  options: {
    A: string;
    B: string;
    C: string;
    D: string;
  };
  correctOption: "A" | "B" | "C" | "D";
  points: number;
  createdAt: string;
  createdBy: string | null;
}

function mapAssignmentMcq(row: Record<string, unknown>): AssignmentMcqItem {
  const correctOption = String(row.correct_option ?? "A");
  return {
    id: String(row.id ?? ""),
    question: String(row.question ?? ""),
    options: {
      A: String(row.option_a ?? ""),
      B: String(row.option_b ?? ""),
      C: String(row.option_c ?? ""),
      D: String(row.option_d ?? ""),
    },
    correctOption: (["A", "B", "C", "D"].includes(correctOption) ? correctOption : "A") as AssignmentMcqItem["correctOption"],
    points: Number(row.points ?? 0),
    createdAt: String(row.created_at ?? new Date().toISOString()),
    createdBy: row.created_by ? String(row.created_by) : null,
  };
}

function isMissingTableError(error: unknown) {
  const dbError = error as { code?: string; message?: string } | null;
  return dbError?.code === "42P01" || dbError?.message?.toLowerCase().includes("assignment_mcqs");
}

function missingTableMessage() {
  return "Assignment MCQ storage is not set up in the database yet. Apply the latest Supabase schema update.";
}

async function getAssignmentMcqContext() {
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
  const context = await getAssignmentMcqContext();
  if (context.error || !context.supabase || !context.profile) {
    return context.error ?? apiUnauthorized();
  }

  const { data, error } = await context.supabase
    .from("assignment_mcqs")
    .select("*")
    .eq("school_id", String(context.profile.school_id))
    .order("created_at", { ascending: false });

  if (error) {
    if (isMissingTableError(error)) {
      return apiServerError(missingTableMessage());
    }
    return apiServerError("Unable to fetch assignment MCQs.");
  }

  return apiOk((data ?? []).map((row) => mapAssignmentMcq(row as Record<string, unknown>)));
}

export async function POST(request: Request) {
  const context = await getAssignmentMcqContext();
  if (context.error || !context.supabase || !context.profile) {
    return context.error ?? apiUnauthorized();
  }

  if (!["teacher", "admin", "instructional_coach"].includes(String(context.profile.role ?? ""))) {
    return apiForbidden("Only teachers and school staff can manage assignment MCQs.");
  }

  const body = await request.json();
  const parsed = createAssignmentMcqSchema.safeParse(body);

  if (!parsed.success) {
    return apiBadRequest(parsed.error.issues[0]?.message ?? "Invalid MCQ payload.");
  }

  const { data, error } = await context.supabase
    .from("assignment_mcqs")
    .insert({
      school_id: context.profile.school_id,
      created_by: context.profile.id,
      question: parsed.data.question,
      option_a: parsed.data.optionA,
      option_b: parsed.data.optionB,
      option_c: parsed.data.optionC,
      option_d: parsed.data.optionD,
      correct_option: parsed.data.correctOption,
      points: parsed.data.points,
    })
    .select("*")
    .single();

  if (error || !data) {
    if (isMissingTableError(error)) {
      return apiServerError(missingTableMessage());
    }
    return apiServerError("Unable to create assignment MCQ.");
  }

  return apiOk(mapAssignmentMcq(data as Record<string, unknown>));
}
