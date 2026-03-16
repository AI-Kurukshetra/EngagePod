import { describe, expect, it } from "vitest";
import { createEmptySnapshot } from "@/lib/snapshot";
import { snapshotFixture } from "@/__tests__/fixtures/snapshot";
import { buildLessonCoverage, buildMetricCards, buildRiskDistribution } from "@/lib/analytics";

describe("analytics helpers", () => {
  it("builds metric cards for the dashboard", () => {
    const metrics = buildMetricCards(snapshotFixture);

    expect(metrics).toHaveLength(4);
    expect(metrics[0]?.label).toBe("Active learners");
  });

  it("handles a snapshot with no live session", () => {
    const metrics = buildMetricCards({
      ...snapshotFixture,
      sessions: snapshotFixture.sessions.map((session) => ({
        ...session,
        status: "completed" as const,
      })),
    });

    expect(metrics[1]?.trend).toContain("No live session");
  });

  it("summarizes risk distribution", () => {
    expect(buildRiskDistribution(snapshotFixture)).toEqual({
      low: 1,
      medium: 1,
      high: 1,
    });
  });

  it("maps lesson coverage correctly", () => {
    const coverage = buildLessonCoverage(snapshotFixture);
    expect(coverage[0]?.activities).toBeGreaterThan(0);
    expect(coverage[0]?.totalPoints).toBeGreaterThan(0);
  });

  it("handles an empty snapshot", () => {
    const metrics = buildMetricCards(createEmptySnapshot());

    expect(metrics[2]?.value).toBe("0%");
    expect(metrics[3]?.trend).toContain("No parent notices yet");
  });
});
