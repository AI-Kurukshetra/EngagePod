import { apiBadRequest, apiForbidden, apiNotFound, apiOk, apiServerError, apiUnauthorized } from "@/lib/api";
import { getDashboardSnapshot } from "@/lib/platform-data";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { createAdminContentSchema, deleteAdminContentSchema, updateAdminContentSchema } from "@/lib/validation/schemas";

export async function GET() {
  const snapshot = await getDashboardSnapshot();
  return apiOk(snapshot.content);
}

async function getAdminContentContext() {
  const supabase = await createServerSupabaseClient();
  if (!supabase) {
    return { error: apiUnauthorized("Supabase is not configured."), supabase: null, schoolId: null, user: null };
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: apiUnauthorized(), supabase, schoolId: null, user: null };
  }

  const schoolName = typeof user.user_metadata.school_name === "string" ? user.user_metadata.school_name.trim() : "";
  const district = typeof user.user_metadata.district === "string" ? user.user_metadata.district.trim() : "";
  const metadataRole = typeof user.user_metadata.role === "string" ? user.user_metadata.role : "";

  let schoolId: string | null = null;
  let role = metadataRole || "teacher";

  if (schoolName) {
    let schoolQuery = supabase.from("schools").select("id").eq("name", schoolName);
    if (district) {
      schoolQuery = schoolQuery.eq("district", district);
    }

    const { data: school } = await schoolQuery.maybeSingle();
    schoolId = school?.id ? String(school.id) : null;
  }

  const { data: profile, error: profileError } = await supabase
    .from("users")
    .select("id, school_id, role, full_name")
    .eq("id", user.id)
    .maybeSingle();

  if (profileError) {
    return { error: apiServerError("Unable to load the current admin profile."), supabase, schoolId: null, user };
  }

  if (profile?.school_id) {
    schoolId = String(profile.school_id);
  }
  if (profile?.role) {
    role = String(profile.role);
  }

  if (!schoolId) {
    return { error: apiForbidden("This account is not linked to a school workspace yet."), supabase, schoolId: null, user };
  }

  if (role !== "admin") {
    return { error: apiForbidden("Only admin users can manage library content."), supabase, schoolId: null, user };
  }

  return { error: null, supabase, schoolId, user };
}

export async function POST(request: Request) {
  const context = await getAdminContentContext();
  if (context.error || !context.supabase || !context.schoolId || !context.user) {
    return context.error ?? apiUnauthorized();
  }

  const body = await request.json();
  const parsed = createAdminContentSchema.safeParse(body);

  if (!parsed.success) {
    return apiBadRequest(parsed.error.issues[0]?.message ?? "Invalid content payload.");
  }

  const { data, error } = await context.supabase
    .from("content_library")
    .insert({
      school_id: context.schoolId,
      created_by: context.user.id,
      title: parsed.data.title,
      description: parsed.data.description,
      type: "resource",
      subject: "General",
      grade_band: "All Grades",
      file_name: parsed.data.fileName,
      file_url: parsed.data.fileDataUrl,
      downloads: 0,
    })
    .select("*")
    .single();

  if (error || !data) {
    return apiServerError("Unable to create library content.");
  }

  return apiOk(data);
}

export async function PATCH(request: Request) {
  const context = await getAdminContentContext();
  if (context.error || !context.supabase || !context.schoolId) {
    return context.error ?? apiUnauthorized();
  }

  const body = await request.json();
  const parsed = updateAdminContentSchema.safeParse(body);

  if (!parsed.success) {
    return apiBadRequest(parsed.error.issues[0]?.message ?? "Invalid content payload.");
  }

  const { data: existingContent } = await context.supabase
    .from("content_library")
    .select("id")
    .eq("id", parsed.data.id)
    .eq("school_id", context.schoolId)
    .maybeSingle();

  if (!existingContent?.id) {
    return apiNotFound("Library content not found.");
  }

  const updatePayload: Record<string, unknown> = {
    title: parsed.data.title,
    description: parsed.data.description,
  };

  if (parsed.data.fileName && parsed.data.fileDataUrl) {
    updatePayload.file_name = parsed.data.fileName;
    updatePayload.file_url = parsed.data.fileDataUrl;
  }

  const { data, error } = await context.supabase
    .from("content_library")
    .update(updatePayload)
    .eq("id", parsed.data.id)
    .eq("school_id", context.schoolId)
    .select("*")
    .single();

  if (error || !data) {
    return apiServerError("Unable to update library content.");
  }

  return apiOk(data);
}

export async function DELETE(request: Request) {
  const context = await getAdminContentContext();
  if (context.error || !context.supabase || !context.schoolId) {
    return context.error ?? apiUnauthorized();
  }

  const { searchParams } = new URL(request.url);
  const parsed = deleteAdminContentSchema.safeParse({ id: searchParams.get("id") ?? "" });

  if (!parsed.success) {
    return apiBadRequest(parsed.error.issues[0]?.message ?? "Invalid content payload.");
  }

  const { data: existingContent } = await context.supabase
    .from("content_library")
    .select("id")
    .eq("id", parsed.data.id)
    .eq("school_id", context.schoolId)
    .maybeSingle();

  if (!existingContent?.id) {
    return apiNotFound("Library content not found.");
  }

  const { error } = await context.supabase
    .from("content_library")
    .delete()
    .eq("id", parsed.data.id)
    .eq("school_id", context.schoolId);

  if (error) {
    return apiServerError("Unable to delete library content.");
  }

  return apiOk({ id: parsed.data.id });
}
