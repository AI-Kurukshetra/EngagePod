import { afterEach, describe, expect, it, vi } from "vitest";

afterEach(() => {
  vi.resetModules();
  vi.clearAllMocks();
});

function createContentSupabaseMock({
  user = {
    id: "admin-1",
    user_metadata: {
      school_name: "Springfield Academy",
      district: "Metro District",
      role: "admin",
    },
  },
  school = { id: "school-1" },
  profile = { id: "admin-1", school_id: "school-1", role: "admin", full_name: "District Admin" },
  existingContent = { id: "content-1", school_id: "school-1", created_by: "admin-1", title: "Weather card deck" },
  insertError = null,
  updateError = null,
  deleteError = null,
}: {
  user?: Record<string, unknown> | null;
  school?: Record<string, unknown> | null;
  profile?: Record<string, unknown> | null;
  existingContent?: Record<string, unknown> | null;
  insertError?: unknown;
  updateError?: unknown;
  deleteError?: unknown;
} = {}) {
  return {
    auth: {
      getUser: async () => ({ data: { user } }),
    },
    from: (table: string) => {
      if (table === "schools") {
        return {
          select: () => ({
            eq: () => ({
              eq: () => ({
                maybeSingle: async () => ({ data: school, error: null }),
              }),
              maybeSingle: async () => ({ data: school, error: null }),
            }),
          }),
        };
      }

      if (table === "users") {
        return {
          select: () => ({
            eq: () => ({
              maybeSingle: async () => ({ data: profile, error: null }),
            }),
          }),
        };
      }

      if (table === "content_library") {
        return {
          select: () => ({
            eq: () => ({
              eq: () => ({
                maybeSingle: async () => ({ data: existingContent, error: null }),
              }),
            }),
          }),
          insert: (payload: Record<string, unknown>) => ({
            select: () => ({
              single: async () => ({
                data:
                  insertError === null
                    ? {
                        id: "content-2",
                        ...payload,
                        created_at: "2026-03-14T11:00:00+05:30",
                      }
                    : null,
                error: insertError,
              }),
            }),
          }),
          update: (payload: Record<string, unknown>) => ({
            eq: () => ({
              eq: () => ({
                select: () => ({
                  single: async () => ({
                    data:
                      updateError === null && existingContent
                        ? {
                            ...existingContent,
                            ...payload,
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

describe("content route", () => {
  it("creates admin library content", async () => {
    vi.doMock("@/lib/supabase/server", () => ({
      createServerSupabaseClient: async () => createContentSupabaseMock(),
    }));

    const { POST } = await import("@/app/api/content/route");
    const response = await POST(
      new Request("http://localhost:3000/api/content", {
        method: "POST",
        body: JSON.stringify({
          title: "Grade 6 Toolkit",
          description: "Teacher-ready science resource pack.",
          fileName: "toolkit.pdf",
          fileDataUrl: "data:application/pdf;base64,AAA",
        }),
      }),
    );
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.data.title).toBe("Grade 6 Toolkit");
  });

  it("rejects non-admin users", async () => {
    vi.doMock("@/lib/supabase/server", () => ({
      createServerSupabaseClient: async () =>
        createContentSupabaseMock({
          user: {
            id: "teacher-1",
            user_metadata: {
              school_name: "Springfield Academy",
              district: "Metro District",
              role: "teacher",
            },
          },
          profile: { id: "teacher-1", school_id: "school-1", role: "teacher", full_name: "Jordan Lee" },
        }),
    }));

    const { POST } = await import("@/app/api/content/route");
    const response = await POST(
      new Request("http://localhost:3000/api/content", {
        method: "POST",
        body: JSON.stringify({
          title: "Grade 6 Toolkit",
          description: "Teacher-ready science resource pack.",
          fileName: "toolkit.pdf",
          fileDataUrl: "data:application/pdf;base64,AAA",
        }),
      }),
    );

    expect(response.status).toBe(403);
  });

  it("updates admin library content", async () => {
    vi.doMock("@/lib/supabase/server", () => ({
      createServerSupabaseClient: async () =>
        createContentSupabaseMock({
          existingContent: {
            id: "content-1",
            school_id: "school-1",
            created_by: "admin-1",
            title: "Weather card deck",
            description: "Old description",
            file_name: "weather-card-deck.pdf",
            file_url: "data:application/pdf;base64,AAA",
          },
        }),
    }));

    const { PATCH } = await import("@/app/api/content/route");
    const response = await PATCH(
      new Request("http://localhost:3000/api/content", {
        method: "PATCH",
        body: JSON.stringify({
          id: "content-1",
          title: "Updated Weather card deck",
          description: "Updated deck for science review.",
        }),
      }),
    );
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.data.title).toBe("Updated Weather card deck");
  });

  it("deletes admin library content", async () => {
    vi.doMock("@/lib/supabase/server", () => ({
      createServerSupabaseClient: async () => createContentSupabaseMock(),
    }));

    const { DELETE } = await import("@/app/api/content/route");
    const response = await DELETE(
      new Request("http://localhost:3000/api/content?id=content-1", {
        method: "DELETE",
      }),
    );
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.data.id).toBe("content-1");
  });
});
