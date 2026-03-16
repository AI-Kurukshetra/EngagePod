import {
  apiBadRequest,
  apiForbidden,
  apiNotFound,
  apiOk,
  apiServerError,
  apiUnauthorized,
} from "@/lib/api";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import {
  createLibraryFolderSchema,
  deleteLibraryFolderSchema,
  updateLibraryFolderSchema,
} from "@/lib/validation/schemas";
import type { LibraryFolder } from "@/types/domain";

function mapFolder(row: Record<string, unknown>): LibraryFolder {
  return {
    id: String(row.id),
    schoolId: String(row.school_id ?? ""),
    name: String(row.name ?? ""),
    createdBy: row.created_by ? String(row.created_by) : null,
    createdAt: String(row.created_at ?? new Date().toISOString()),
    updatedAt: String(row.updated_at ?? row.created_at ?? new Date().toISOString()),
  };
}

async function getFolderContext() {
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

  const userMetadata = (user.user_metadata ?? {}) as Record<string, unknown>;
  const schoolName = typeof userMetadata.school_name === "string" ? userMetadata.school_name.trim() : "";
  const district = typeof userMetadata.district === "string" ? userMetadata.district.trim() : "";
  const metadataRole = typeof userMetadata.role === "string" ? userMetadata.role : "";

  if (schoolName) {
    let schoolQuery = supabase.from("schools").select("id").eq("name", schoolName);
    if (district) {
      schoolQuery = schoolQuery.eq("district", district);
    }

    const { data: school, error: schoolError } = await schoolQuery.maybeSingle();

    if (!schoolError && school?.id) {
      return {
        error: null,
        supabase,
        profile: {
          id: user.id,
          school_id: school.id,
          role: metadataRole || "teacher",
        },
      };
    }
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
  const context = await getFolderContext();
  if (context.error || !context.supabase || !context.profile) {
    return context.error ?? apiUnauthorized();
  }

  const { data, error } = await context.supabase
    .from("library_folders")
    .select("*")
    .eq("school_id", String(context.profile.school_id))
    .order("updated_at", { ascending: false });

  if (error) {
    return apiServerError("Unable to fetch library folders.");
  }

  return apiOk((data ?? []).map((row) => mapFolder(row as Record<string, unknown>)));
}

export async function POST(request: Request) {
  const context = await getFolderContext();
  if (context.error || !context.supabase || !context.profile) {
    return context.error ?? apiUnauthorized();
  }

  const body = await request.json();
  const parsed = createLibraryFolderSchema.safeParse(body);

  if (!parsed.success) {
    return apiBadRequest(parsed.error.issues[0]?.message ?? "Invalid folder payload.");
  }

  const { data, error } = await context.supabase
    .from("library_folders")
    .insert({
      school_id: context.profile.school_id,
      created_by: context.profile.id,
      name: parsed.data.name,
    })
    .select("*")
    .single();

  if (error || !data) {
    return apiServerError("Unable to create the folder.");
  }

  return apiOk(mapFolder(data as Record<string, unknown>));
}

export async function PATCH(request: Request) {
  const context = await getFolderContext();
  if (context.error || !context.supabase || !context.profile) {
    return context.error ?? apiUnauthorized();
  }

  const body = await request.json();
  const parsed = updateLibraryFolderSchema.safeParse(body);

  if (!parsed.success) {
    return apiBadRequest(parsed.error.issues[0]?.message ?? "Invalid folder payload.");
  }

  const { data: existingFolder } = await context.supabase
    .from("library_folders")
    .select("id")
    .eq("id", parsed.data.id)
    .eq("school_id", String(context.profile.school_id))
    .maybeSingle();

  if (!existingFolder) {
    return apiNotFound("Folder not found.");
  }

  const { data, error } = await context.supabase
    .from("library_folders")
    .update({
      name: parsed.data.name,
      updated_at: new Date().toISOString(),
    })
    .eq("id", parsed.data.id)
    .eq("school_id", String(context.profile.school_id))
    .select("*")
    .single();

  if (error || !data) {
    return apiServerError("Unable to update the folder.");
  }

  return apiOk(mapFolder(data as Record<string, unknown>));
}

export async function DELETE(request: Request) {
  const context = await getFolderContext();
  if (context.error || !context.supabase || !context.profile) {
    return context.error ?? apiUnauthorized();
  }

  const { searchParams } = new URL(request.url);
  const parsed = deleteLibraryFolderSchema.safeParse({ id: searchParams.get("id") ?? "" });

  if (!parsed.success) {
    return apiBadRequest(parsed.error.issues[0]?.message ?? "Invalid folder payload.");
  }

  const { data: existingFolder } = await context.supabase
    .from("library_folders")
    .select("id")
    .eq("id", parsed.data.id)
    .eq("school_id", String(context.profile.school_id))
    .maybeSingle();

  if (!existingFolder) {
    return apiNotFound("Folder not found.");
  }

  const { error } = await context.supabase
    .from("library_folders")
    .delete()
    .eq("id", parsed.data.id)
    .eq("school_id", String(context.profile.school_id));

  if (error) {
    return apiServerError("Unable to delete the folder.");
  }

  return apiOk({ id: parsed.data.id });
}
