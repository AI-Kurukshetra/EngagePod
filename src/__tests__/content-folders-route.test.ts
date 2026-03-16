import { afterEach, describe, expect, it, vi } from "vitest";

afterEach(() => {
  vi.resetModules();
  vi.clearAllMocks();
});

function createRouteSupabaseMock({
  user = { id: "user-1" },
  profile = { id: "user-1", school_id: "school-1", role: "teacher" },
  folders = [
    {
      id: "folder-1",
      school_id: "school-1",
      created_by: "user-1",
      name: "Science Essentials",
      created_at: "2026-03-10T09:00:00+05:30",
      updated_at: "2026-03-14T09:30:00+05:30",
    },
  ],
  profileError = null,
  folderError = null,
  createError = null,
  updateError = null,
  deleteError = null,
}: {
  user?: { id: string } | null;
  profile?: Record<string, unknown> | null;
  folders?: Array<Record<string, unknown>>;
  profileError?: unknown;
  folderError?: unknown;
  createError?: unknown;
  updateError?: unknown;
  deleteError?: unknown;
} = {}) {
  return {
    auth: {
      getUser: async () => ({
        data: { user },
      }),
    },
    from: (table: string) => {
      if (table === "users") {
        return {
          select: () => ({
            eq: () => ({
              maybeSingle: async () => ({ data: profile, error: profileError }),
            }),
          }),
        };
      }

      if (table === "library_folders") {
        return {
          select: () => ({
            eq: () => ({
              eq: () => ({
                maybeSingle: async () => ({
                  data: folders[0] ?? null,
                  error: folderError,
                }),
              }),
              order: async () => ({
                data: folders,
                error: folderError,
              }),
            }),
          }),
          insert: (payload: Record<string, unknown>) => ({
            select: () => ({
              single: async () => ({
                data:
                  createError === null
                    ? {
                        id: "folder-2",
                        school_id: payload.school_id,
                        created_by: payload.created_by,
                        name: payload.name,
                        created_at: "2026-03-14T11:00:00+05:30",
                        updated_at: "2026-03-14T11:00:00+05:30",
                      }
                    : null,
                error: createError,
              }),
            }),
          }),
          update: (payload: Record<string, unknown>) => ({
            eq: () => ({
              eq: () => ({
                select: () => ({
                  single: async () => ({
                    data:
                      updateError === null
                        ? {
                            ...(folders[0] ?? {}),
                            name: payload.name,
                            updated_at: payload.updated_at,
                          }
                        : null,
                    error: updateError,
                  }),
                }),
              }),
            }),
          }),
          delete: () => ({
            eq: () => ({
              eq: async () => ({
                error: deleteError,
              }),
            }),
          }),
        };
      }

      throw new Error(`Unexpected table: ${table}`);
    },
  };
}

describe("content folder route", () => {
  it("rejects requests when supabase is not configured", async () => {
    vi.doMock("@/lib/supabase/server", () => ({
      createServerSupabaseClient: async () => null,
    }));

    const { GET } = await import("@/app/api/library-folders/route");
    const response = await GET();
    const json = await response.json();

    expect(response.status).toBe(401);
    expect(json.ok).toBe(false);
  });

  it("creates a folder for the current school", async () => {
    vi.doMock("@/lib/supabase/server", () => ({
      createServerSupabaseClient: async () => createRouteSupabaseMock(),
    }));

    const { POST } = await import("@/app/api/library-folders/route");
    const response = await POST(
        new Request("http://localhost:3000/api/library-folders", {
        method: "POST",
        body: JSON.stringify({ name: "Assessment Bank" }),
      }),
    );
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.data.name).toBe("Assessment Bank");
  });

  it("updates a folder name", async () => {
    vi.doMock("@/lib/supabase/server", () => ({
      createServerSupabaseClient: async () => createRouteSupabaseMock(),
    }));

    const { PATCH } = await import("@/app/api/library-folders/route");
    const response = await PATCH(
        new Request("http://localhost:3000/api/library-folders", {
        method: "PATCH",
        body: JSON.stringify({ id: "folder-1", name: "Updated Science Essentials" }),
      }),
    );
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.data.name).toBe("Updated Science Essentials");
  });

  it("returns not found when deleting a missing folder", async () => {
    vi.doMock("@/lib/supabase/server", () => ({
      createServerSupabaseClient: async () => createRouteSupabaseMock({ folders: [] }),
    }));

    const { DELETE } = await import("@/app/api/library-folders/route");
    const response = await DELETE(
        new Request("http://localhost:3000/api/library-folders?id=folder-1", {
        method: "DELETE",
      }),
    );

    expect(response.status).toBe(404);
  });
});
