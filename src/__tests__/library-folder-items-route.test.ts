import { afterEach, describe, expect, it, vi } from "vitest";

afterEach(() => {
  vi.resetModules();
  vi.clearAllMocks();
});

function createFolderItemSupabaseMock({
  user = { id: "user-1" },
  profile = { id: "user-1", school_id: "school-1", role: "teacher" },
  folder = { id: "folder-1" },
  content = { id: "content-1" },
  existingItem = null,
  insertError = null,
}: {
  user?: { id: string } | null;
  profile?: Record<string, unknown> | null;
  folder?: Record<string, unknown> | null;
  content?: Record<string, unknown> | null;
  existingItem?: Record<string, unknown> | null;
  insertError?: unknown;
} = {}) {
  return {
    auth: {
      getUser: async () => ({ data: { user } }),
    },
    from: (table: string) => {
      if (table === "users") {
        return {
          select: () => ({
            eq: () => ({
              maybeSingle: async () => ({ data: profile, error: null }),
            }),
          }),
        };
      }

      if (table === "library_folders") {
        return {
          select: () => ({
            eq: () => ({
              eq: () => ({
                maybeSingle: async () => ({ data: folder, error: null }),
              }),
            }),
          }),
        };
      }

      if (table === "content_library") {
        return {
          select: () => ({
            eq: () => ({
              eq: () => ({
                maybeSingle: async () => ({ data: content, error: null }),
              }),
            }),
          }),
        };
      }

      if (table === "library_folder_items") {
        return {
          select: () => ({
            eq: () => ({
              eq: () => ({
                maybeSingle: async () => ({ data: existingItem, error: null }),
              }),
            }),
          }),
          insert: (payload: Record<string, unknown>) => ({
            select: () => ({
              single: async () => ({
                data:
                  insertError === null
                    ? {
                        id: "item-1",
                        folder_id: payload.folder_id,
                        content_id: payload.content_id,
                      }
                    : null,
                error: insertError,
              }),
            }),
          }),
        };
      }

      throw new Error(`Unexpected table: ${table}`);
    },
  };
}

describe("library folder items route", () => {
  it("adds library content to a teacher folder", async () => {
    vi.doMock("@/lib/supabase/server", () => ({
      createServerSupabaseClient: async () => createFolderItemSupabaseMock(),
    }));

    const { POST } = await import("@/app/api/library-folder-items/route");
    const response = await POST(
      new Request("http://localhost:3000/api/library-folder-items", {
        method: "POST",
        body: JSON.stringify({
          folderId: "folder-1",
          contentId: "content-1",
        }),
      }),
    );
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.data.folderId).toBe("folder-1");
    expect(json.data.contentId).toBe("content-1");
  });

  it("treats duplicate folder-content links as success", async () => {
    vi.doMock("@/lib/supabase/server", () => ({
      createServerSupabaseClient: async () =>
        createFolderItemSupabaseMock({
          existingItem: {
            id: "item-1",
            folder_id: "folder-1",
            content_id: "content-1",
          },
        }),
    }));

    const { POST } = await import("@/app/api/library-folder-items/route");
    const response = await POST(
      new Request("http://localhost:3000/api/library-folder-items", {
        method: "POST",
        body: JSON.stringify({
          folderId: "folder-1",
          contentId: "content-1",
        }),
      }),
    );
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.data.id).toBe("item-1");
    expect(json.data.folderId).toBe("folder-1");
    expect(json.data.contentId).toBe("content-1");
  });

  it("returns a clear migration error when the folder-link table is missing", async () => {
    vi.doMock("@/lib/supabase/server", () => ({
      createServerSupabaseClient: async () =>
        createFolderItemSupabaseMock({
          insertError: { code: "42P01", message: 'relation "library_folder_items" does not exist' },
        }),
    }));

    const { POST } = await import("@/app/api/library-folder-items/route");
    const response = await POST(
      new Request("http://localhost:3000/api/library-folder-items", {
        method: "POST",
        body: JSON.stringify({
          folderId: "folder-1",
          contentId: "content-1",
        }),
      }),
    );
    const json = await response.json();

    expect(response.status).toBe(500);
    expect(json.error).toMatch(/latest Supabase schema update/i);
  });
});
