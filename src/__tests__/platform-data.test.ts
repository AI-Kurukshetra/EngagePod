import { afterEach, describe, expect, it, vi } from "vitest";
import { createEmptySnapshot } from "@/lib/snapshot";

afterEach(() => {
  vi.resetModules();
  vi.clearAllMocks();
});

describe("platform data supabase branches", () => {
  it("returns an empty snapshot when no client is available", async () => {
    vi.doMock("@/lib/supabase/server", () => ({
      createServerSupabaseClient: async () => null,
    }));

    const { getDashboardSnapshot } = await import("@/lib/platform-data");
    await expect(getDashboardSnapshot()).resolves.toEqual(createEmptySnapshot());
  });

  it("returns an empty snapshot when no auth user exists", async () => {
    vi.doMock("@/lib/supabase/server", () => ({
      createServerSupabaseClient: async () => ({
        auth: {
          getUser: async () => ({ data: { user: null } }),
        },
      }),
    }));

    const { getDashboardSnapshot } = await import("@/lib/platform-data");
    await expect(getDashboardSnapshot()).resolves.toEqual(createEmptySnapshot());
  });

  it("builds a snapshot from authenticated user metadata when no profile row exists", async () => {
    vi.doMock("@/lib/supabase/server", () => ({
      createServerSupabaseClient: async () => ({
        auth: {
          getUser: async () => ({
            data: {
              user: {
                id: "user-1",
                email: "jordan@example.com",
                user_metadata: {
                  full_name: "Jordan Lee",
                  role: "teacher",
                  locale: "en-US",
                },
              },
            },
          }),
        },
        from: () => ({
          select: () => ({
            eq: async () => ({ data: [], error: null }),
            in: async () => ({ data: [], error: null }),
            order: async () => ({ data: [], error: null }),
          }),
        }),
      }),
    }));

    const { getDashboardSnapshot } = await import("@/lib/platform-data");
    await expect(getDashboardSnapshot()).resolves.toMatchObject({
      currentUser: {
        id: "user-1",
        fullName: "Jordan Lee",
      },
      lessons: [],
    });
  });

  it("maps supabase rows into a populated dashboard snapshot", async () => {
    const tables: Record<string, Array<Record<string, unknown>>> = {
      users: [
        {
          id: "user-1",
          full_name: "Jordan Lee",
          email: "jordan@example.com",
          role: "teacher",
          locale: "en-US",
          avatar_url: "",
          school_id: "school-1",
          streak_days: 3,
        },
        {
          id: "user-2",
          full_name: "Ava Parent",
          email: "ava.parent@example.com",
          role: "parent",
          locale: "en-US",
          avatar_url: "",
          school_id: "school-1",
          streak_days: 0,
        },
      ],
      schools: [
        {
          id: "school-1",
          name: "Springfield Academy",
          district: "Metro District",
          plan: "enterprise",
          time_zone: "UTC",
          active_students: 1200,
          active_teachers: 80,
        },
      ],
      classrooms: [
        {
          id: "class-1",
          school_id: "school-1",
          teacher_id: "user-1",
          title: "Science 6A",
          subject: "Science",
          grade_band: "Grade 6",
          roster_count: 30,
          completion_rate: 90,
          pace_mode: "teacher",
        },
      ],
      lessons: [
        {
          id: "lesson-1",
          school_id: "school-1",
          created_by: "user-1",
          title: "Weather Systems",
          subject: "Science",
          grade_band: "Grade 6",
          status: "published",
          duration_minutes: 30,
          standards: ["NGSS"],
          featured: true,
          ai_assist: true,
          tags: ["science"],
        },
      ],
      activities: [
        {
          id: "activity-1",
          lesson_id: "lesson-1",
          title: "Warm-up poll",
          type: "poll",
          prompt: "What affects the weather?",
          estimated_minutes: 5,
          points: 10,
          position: 1,
        },
      ],
      sessions: [
        {
          id: "session-1",
          classroom_id: "class-1",
          lesson_id: "lesson-1",
          title: "Weather Systems Live",
          attendee_count: 28,
          engagement_score: 91,
          response_rate: 88,
          breakout_rooms: 3,
          status: "live",
          starts_at: "2026-03-14T11:30:00+05:30",
        },
      ],
      assignments: [
        {
          id: "assignment-1",
          classroom_id: "class-1",
          lesson_id: "lesson-1",
          title: "Weather reflection",
          due_date: "2026-03-16",
          completion_rate: 82,
          assigned_count: 30,
        },
      ],
      assessments: [
        {
          id: "assessment-1",
          title: "Science checkpoint",
          format: "formative",
          average_score: 85,
          submission_rate: 92,
          flagged_for_review: 1,
        },
      ],
      student_progress: [
        {
          id: "progress-1",
          student_id: "student-1",
          classroom_id: "class-1",
          mastery_rate: 93,
          risk_level: "low",
          last_active: "2026-03-14T10:10:00+05:30",
          created_at: "2026-03-14T10:10:00+05:30",
        },
      ],
      notifications: [
        {
          id: "notification-1",
          school_id: "school-1",
          title: "Weekly family summary ready",
          audience: ["parent"],
          channel: "email",
          status: "queued",
          created_at: "2026-03-14T09:00:00+05:30",
        },
      ],
      library_folders: [
        {
          id: "folder-1",
          school_id: "school-1",
          created_by: "user-1",
          name: "Science Essentials",
          created_at: "2026-03-10T09:00:00+05:30",
          updated_at: "2026-03-14T09:30:00+05:30",
        },
      ],
      library_folder_items: [
        {
          id: "item-1",
          folder_id: "folder-1",
          content_id: "content-1",
        },
      ],
      content_library: [
        {
          id: "content-1",
          school_id: "school-1",
          folder_id: "folder-1",
          created_by: "user-1",
          title: "Weather card deck",
          description: "Interactive deck for weather patterns.",
          type: "template",
          subject: "Science",
          grade_band: "Grade 6",
          file_name: "weather-card-deck.pdf",
          file_url: "https://example.com/weather-card-deck.pdf",
          downloads: 100,
          created_at: "2026-03-14T09:00:00+05:30",
        },
      ],
      media_files: [
        {
          id: "media-1",
          lesson_id: "lesson-1",
          kind: "image",
          name: "Cloud formation",
          url: "https://example.com/cloud.jpg",
          created_at: "2026-03-14T09:00:00+05:30",
        },
      ],
      integrations: [
        {
          id: "integration-1",
          school_id: "school-1",
          name: "Google Classroom",
          category: "lms",
          status: "connected",
          created_at: "2026-03-14T09:00:00+05:30",
        },
      ],
    };

    function createQuery(rows: Array<Record<string, unknown>>) {
      let filtered = [...rows];

      return {
        eq(column: string, value: string) {
          filtered = filtered.filter((row) => String(row[column] ?? "") === value);
          return this;
        },
        in(column: string, values: string[]) {
          filtered = filtered.filter((row) => values.includes(String(row[column] ?? "")));
          return this;
        },
        order(column: string, options?: { ascending?: boolean }) {
          filtered = [...filtered].sort((left, right) => {
            const leftValue = String(left[column] ?? "");
            const rightValue = String(right[column] ?? "");
            return options?.ascending === false
              ? rightValue.localeCompare(leftValue)
              : leftValue.localeCompare(rightValue);
          });
          return this;
        },
        then(resolve: (value: { data: Array<Record<string, unknown>>; error: null }) => unknown) {
          return Promise.resolve(resolve({ data: filtered, error: null }));
        },
      };
    }

    vi.doMock("@/lib/supabase/server", () => ({
      createServerSupabaseClient: async () => ({
        auth: {
          getUser: async () => ({
            data: {
              user: {
                id: "user-1",
                email: "jordan@example.com",
                user_metadata: {},
              },
            },
          }),
        },
        from: (table: string) => ({
          select: () => createQuery(tables[table] ?? []),
        }),
      }),
    }));

    const { getDashboardSnapshot } = await import("@/lib/platform-data");
    const snapshot = await getDashboardSnapshot();

    expect(snapshot).toMatchObject({
      currentUser: {
        fullName: "Jordan Lee",
        schoolId: "school-1",
        classroomIds: ["class-1"],
      },
      schools: [{ name: "Springfield Academy" }],
      libraryFolders: [{ name: "Science Essentials" }],
      lessons: [{ title: "Weather Systems", activities: [{ title: "Warm-up poll" }] }],
      content: [{ title: "Weather card deck", createdByName: "Jordan Lee" }],
      sessions: [{ title: "Weather Systems Live" }],
      integrations: [{ name: "Google Classroom" }],
    });
    expect(snapshot.schoolUsers).toEqual(expect.arrayContaining([
      expect.objectContaining({ fullName: "Jordan Lee" }),
      expect.objectContaining({ fullName: "Ava Parent" }),
    ]));
  });
});
