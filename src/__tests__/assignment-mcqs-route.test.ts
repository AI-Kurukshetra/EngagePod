import { afterEach, describe, expect, it, vi } from "vitest";

afterEach(() => {
  vi.resetModules();
  vi.clearAllMocks();
});

function createAssignmentMcqsSupabaseMock({
  user = { id: "teacher-1" },
  profile = { id: "teacher-1", school_id: "school-1", role: "teacher" },
  rows = [
    {
      id: "mcq-1",
      question: "Which layer of Earth is liquid?",
      option_a: "Crust",
      option_b: "Outer core",
      option_c: "Mantle",
      option_d: "Inner core",
      correct_option: "B",
      points: 8,
      created_at: "2026-03-14T11:33:00+05:30",
      created_by: "teacher-1",
    },
  ],
  queryError = null,
  insertError = null,
}: {
  user?: { id: string } | null;
  profile?: Record<string, unknown> | null;
  rows?: Array<Record<string, unknown>>;
  queryError?: unknown;
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

      if (table === "assignment_mcqs") {
        return {
          select: () => ({
            eq: () => ({
              order: async () => ({ data: queryError ? null : rows, error: queryError }),
            }),
          }),
          insert: (payload: Record<string, unknown>) => ({
            select: () => ({
              single: async () => ({
                data:
                  insertError === null
                    ? {
                        id: "mcq-created",
                        question: payload.question,
                        option_a: payload.option_a,
                        option_b: payload.option_b,
                        option_c: payload.option_c,
                        option_d: payload.option_d,
                        correct_option: payload.correct_option,
                        points: payload.points,
                        created_at: "2026-03-14T12:01:00+05:30",
                        created_by: payload.created_by,
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

describe("assignment MCQs route", () => {
  it("returns assignment MCQs for teacher role", async () => {
    vi.doMock("@/lib/supabase/server", () => ({
      createServerSupabaseClient: async () => createAssignmentMcqsSupabaseMock(),
    }));

    const { GET } = await import("@/app/api/assignment-mcqs/route");
    const response = await GET();
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.data[0].question).toBe("Which layer of Earth is liquid?");
    expect(json.data[0].correctOption).toBe("B");
  });

  it("creates a new assignment MCQ for teacher role", async () => {
    vi.doMock("@/lib/supabase/server", () => ({
      createServerSupabaseClient: async () => createAssignmentMcqsSupabaseMock(),
    }));

    const { POST } = await import("@/app/api/assignment-mcqs/route");
    const response = await POST(
      new Request("http://localhost:3000/api/assignment-mcqs", {
        method: "POST",
        body: JSON.stringify({
          question: "What causes rainfall?",
          optionA: "Wind only",
          optionB: "Warm air rises and condenses",
          optionC: "Moonlight",
          optionD: "Dry air sinks",
          correctOption: "B",
          points: 10,
        }),
      }),
    );
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.data.question).toBe("What causes rainfall?");
    expect(json.data.correctOption).toBe("B");
    expect(json.data.points).toBe(10);
  });

  it("allows student role to read assignment MCQs", async () => {
    vi.doMock("@/lib/supabase/server", () => ({
      createServerSupabaseClient: async () =>
        createAssignmentMcqsSupabaseMock({
          user: { id: "student-1" },
          profile: { id: "student-1", school_id: "school-1", role: "student" },
        }),
    }));

    const { GET } = await import("@/app/api/assignment-mcqs/route");
    const response = await GET();
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.data[0].question).toBe("Which layer of Earth is liquid?");
  });

  it("rejects student role create requests", async () => {
    vi.doMock("@/lib/supabase/server", () => ({
      createServerSupabaseClient: async () =>
        createAssignmentMcqsSupabaseMock({
          profile: { id: "student-1", school_id: "school-1", role: "student" },
        }),
    }));

    const { POST } = await import("@/app/api/assignment-mcqs/route");
    const response = await POST(
      new Request("http://localhost:3000/api/assignment-mcqs", {
        method: "POST",
        body: JSON.stringify({
          question: "What causes rainfall?",
          optionA: "Wind only",
          optionB: "Warm air rises and condenses",
          optionC: "Moonlight",
          optionD: "Dry air sinks",
          correctOption: "B",
          points: 10,
        }),
      }),
    );

    expect(response.status).toBe(403);
  });

  it("returns migration guidance when assignment_mcqs table is missing", async () => {
    vi.doMock("@/lib/supabase/server", () => ({
      createServerSupabaseClient: async () =>
        createAssignmentMcqsSupabaseMock({
          queryError: { code: "42P01", message: 'relation "assignment_mcqs" does not exist' },
        }),
    }));

    const { GET } = await import("@/app/api/assignment-mcqs/route");
    const response = await GET();
    const json = await response.json();

    expect(response.status).toBe(500);
    expect(json.error).toMatch(/schema update/i);
  });
});
