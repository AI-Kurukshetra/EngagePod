import { apiBadRequest, apiForbidden, apiNotFound, apiOk, apiServerError, apiUnauthorized } from "@/lib/api";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { createLibraryFolderItemSchema } from "@/lib/validation/schemas";

function getFolderItemErrorMessage(error: unknown) {
  const errorCode = typeof error === "object" && error !== null && "code" in error ? String(error.code) : "";

  if (errorCode === "42P01" || errorCode === "PGRST205") {
    return "Library folder links are not set up in the database yet. Apply the latest Supabase schema update.";
  }

  if (errorCode === "42501") {
    return "This workspace does not have permission to add libraries into folders yet.";
  }

  return "Unable to save this library in the selected folder.";
}

async function getFolderItemContext() {
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

export async function POST(request: Request) {
  const context = await getFolderItemContext();
  if (context.error || !context.supabase || !context.profile) {
    return context.error ?? apiUnauthorized();
  }

  const body = await request.json();
  const parsed = createLibraryFolderItemSchema.safeParse(body);

  if (!parsed.success) {
    return apiBadRequest(parsed.error.issues[0]?.message ?? "Invalid folder item payload.");
  }

  const { data: folder } = await context.supabase
    .from("library_folders")
    .select("id")
    .eq("id", parsed.data.folderId)
    .eq("school_id", String(context.profile.school_id))
    .maybeSingle();

  if (!folder?.id) {
    return apiNotFound("Folder not found.");
  }

  const { data: content } = await context.supabase
    .from("content_library")
    .select("id")
    .eq("id", parsed.data.contentId)
    .eq("school_id", String(context.profile.school_id))
    .maybeSingle();

  if (!content?.id) {
    return apiNotFound("Library content not found.");
  }

  const { data: existingItem, error: existingItemError } = await context.supabase
    .from("library_folder_items")
    .select("id, folder_id, content_id")
    .eq("folder_id", parsed.data.folderId)
    .eq("content_id", parsed.data.contentId)
    .maybeSingle();

  if (existingItemError) {
    return apiServerError(getFolderItemErrorMessage(existingItemError));
  }

  if (existingItem?.id) {
    return apiOk({
      id: String(existingItem.id),
      folderId: String(existingItem.folder_id ?? parsed.data.folderId),
      contentId: String(existingItem.content_id ?? parsed.data.contentId),
    });
  }

  const { data, error } = await context.supabase
    .from("library_folder_items")
    .insert({
      folder_id: parsed.data.folderId,
      content_id: parsed.data.contentId,
      added_by: context.profile.id,
    })
    .select("*")
    .single();

  if (error || !data) {
    const { data: duplicateItem, error: duplicateItemError } = await context.supabase
      .from("library_folder_items")
      .select("id, folder_id, content_id")
      .eq("folder_id", parsed.data.folderId)
      .eq("content_id", parsed.data.contentId)
      .maybeSingle();

    if (duplicateItemError) {
      return apiServerError(getFolderItemErrorMessage(error ?? duplicateItemError));
    }

    if (duplicateItem?.id) {
      return apiOk({
        id: String(duplicateItem.id),
        folderId: String(duplicateItem.folder_id ?? parsed.data.folderId),
        contentId: String(duplicateItem.content_id ?? parsed.data.contentId),
      });
    }

    return apiServerError(getFolderItemErrorMessage(error));
  }

  return apiOk({
    id: String(data.id),
    folderId: String(data.folder_id ?? parsed.data.folderId),
    contentId: String(data.content_id ?? parsed.data.contentId),
  });
}
