import { afterEach, describe, expect, it, vi } from "vitest";

afterEach(() => {
  vi.resetModules();
  vi.clearAllMocks();
});

function createAttemptSupabaseMock({
  user = { id: "student-1" },
  profile = { id: "student-1", school_id: "school-1", role: "student" },
  mcq = { id: "mcq-1", school_id: "school-1", correct_option: "B", points: 8 },
  attempts = [
    {
      id: "attempt-1",
      mcq_id: "mcq-1",
      school_id: "school-1",
      student_id: "student-1",
      selected_option: "B",
      is_correct: true,
      points_earned: 8,
      created_at: "2026-03-14T11:33:00+05:30",
    },
  ],
}: {
  user?: { id: string } | null;
  profile?: Record<string, unknown> | null;
  mcq?: Record<string, unknown> | null;
  attempts?: Array<Record<string, unknown>>;
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
              eq: () => ({
                maybeSingle: async () => ({ data: mcq, error: null }),
              }),
            }),
          }),
        };
      }

      if (table === "assignment_mcq_attempts") {
        const query = {
          eq: () => query,
          order: async () => ({ data: attempts, error: null }),
        };
        return {
          select: () => query,
          upsert: (payload: Record<string, unknown>) => ({
            select: () => ({
              single: async () => ({
                data: {
                  id: "attempt-created",
                  ...payload,
                },
                error: null,
              }),
            }),
          }),
        };
      }

      throw new Error(`Unexpected table: ${table}`);
    },
  };
}

describe("assignment MCQ attempts route", () => {
  it("returns only student attempts for student role", async () => {
    vi.doMock("@/lib/supabase/server", () => ({
      createServerSupabaseClient: async () => createAttemptSupabaseMock(),
    }));

    const { GET } = await import("@/app/api/assignment-mcq-attempts/route");
    const response = await GET();
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.data[0].mcqId).toBe("mcq-1");
    expect(json.data[0].isCorrect).toBe(true);
  });

  it("saves a student attempt and computes result from correct option", async () => {
    vi.doMock("@/lib/supabase/server", () => ({
      createServerSupabaseClient: async () => createAttemptSupabaseMock(),
    }));

    const { POST } = await import("@/app/api/assignment-mcq-attempts/route");
    const response = await POST(
      new Request("http://localhost:3000/api/assignment-mcq-attempts", {
        method: "POST",
        body: JSON.stringify({
          mcqId: "mcq-1",
          selectedOption: "B",
        }),
      }),
    );
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.data.mcqId).toBe("mcq-1");
    expect(json.data.isCorrect).toBe(true);
    expect(json.data.pointsEarned).toBe(8);
  });

  it("rejects attempt submissions from non-student roles", async () => {
    vi.doMock("@/lib/supabase/server", () => ({
      createServerSupabaseClient: async () =>
        createAttemptSupabaseMock({
          user: { id: "teacher-1" },
          profile: { id: "teacher-1", school_id: "school-1", role: "teacher" },
        }),
    }));

    const { POST } = await import("@/app/api/assignment-mcq-attempts/route");
    const response = await POST(
      new Request("http://localhost:3000/api/assignment-mcq-attempts", {
        method: "POST",
        body: JSON.stringify({
          mcqId: "mcq-1",
          selectedOption: "B",
        }),
      }),
    );

    expect(response.status).toBe(403);
  });
});
