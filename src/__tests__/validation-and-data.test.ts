import { describe, expect, it } from "vitest";
import { createEmptySnapshot } from "@/lib/snapshot";
import { getApiPayload, getDashboardSnapshot, getPlatformBlueprint } from "@/lib/platform-data";
import { API_GROUPS, APP_NAME, DASHBOARD_ROUTES, getDashboardNavRoutes } from "@/lib/constants";
import {
  createLibraryFolderSchema,
  createLessonSchema,
  deleteLibraryFolderSchema,
  launchSessionSchema,
  signInSchema,
  submitResponseSchema,
  updateLibraryFolderSchema,
} from "@/lib/validation/schemas";

describe("validation schemas and platform data", () => {
  it("validates sign in and lesson creation payloads", () => {
    expect(signInSchema.safeParse({ email: "teacher@engagepod.edu", password: "password123" }).success).toBe(true);
    expect(
      createLessonSchema.safeParse({
        title: "New lesson",
        subject: "Science",
        gradeBand: "Grade 6",
        durationMinutes: 20,
        standards: ["NGSS"],
        aiAssist: true,
      }).success,
    ).toBe(true);
    expect(createLibraryFolderSchema.safeParse({ name: "Grade 6 Science" }).success).toBe(true);
  });

  it("rejects malformed response and session payloads", () => {
    expect(submitResponseSchema.safeParse({ responseValue: "" }).success).toBe(false);
    expect(
      launchSessionSchema.safeParse({
        classroomId: "class_1",
        lessonId: "lesson_1",
        startsAt: "not-a-date",
      }).success,
    ).toBe(false);
    expect(updateLibraryFolderSchema.safeParse({ id: "f1", name: "A" }).success).toBe(false);
    expect(deleteLibraryFolderSchema.safeParse({ id: "" }).success).toBe(false);
  });

  it("returns populated fallback snapshot and blueprint data", async () => {
    const snapshot = await getDashboardSnapshot();
    const payload = await getApiPayload();
    const blueprint = await getPlatformBlueprint();

    expect(snapshot).toEqual(createEmptySnapshot());
    expect(payload.activities.length).toBe(0);
    expect(blueprint.coreFeatures.length).toBeGreaterThan(0);
  });

  it("exposes stable app constants", () => {
    expect(APP_NAME).toBe("EngagePod");
    expect(API_GROUPS).toContain("analytics");
    expect(DASHBOARD_ROUTES).toHaveLength(10);
  });

  it("grants dashboard, assignments, analytics, and live modules to student and parent roles", () => {
    const studentRoutes = getDashboardNavRoutes("student").map((route) => route.href);
    const parentRoutes = getDashboardNavRoutes("parent").map((route) => route.href);

    for (const routes of [studentRoutes, parentRoutes]) {
      expect(routes).toContain("/dashboard");
      expect(routes).toContain("/dashboard/live");
      expect(routes).toContain("/dashboard/analytics");
      expect(routes).toContain("/dashboard/assignments");
      expect(routes).not.toContain("/dashboard/library");
      expect(routes).not.toContain("/dashboard/builder");
      expect(routes).not.toContain("/dashboard/admin");
    }
  });
});
