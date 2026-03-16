import type { DashboardSnapshot, MetricCard } from "@/types/domain";
import { formatNumber, formatTimeLabel } from "@/lib/format";
import { percentLabel } from "@/lib/utils";

export function buildMetricCards(snapshot: DashboardSnapshot): MetricCard[] {
  const liveSession = snapshot.sessions.find((session) => session.status === "live");
  const averageMastery = snapshot.progress.length
    ? snapshot.progress.reduce((sum, item) => sum + item.masteryRate, 0) /
      snapshot.progress.length
    : 0;

  return [
    {
      label: "Active learners",
      value: formatNumber(snapshot.schools[0]?.activeStudents ?? 0),
      trend: "+12% this month",
    },
    {
      label: "Live engagement",
      value: percentLabel(liveSession?.engagementScore ?? 0),
      trend: `${liveSession ? formatTimeLabel(liveSession.startsAt) : "No live session"} start`,
    },
    {
      label: "Average mastery",
      value: percentLabel(averageMastery),
      trend: "Intervention queue down 8%",
    },
    {
      label: "Assignments on track",
      value: snapshot.assignments.length
        ? `${snapshot.assignments.filter((assignment) => assignment.completionRate >= 75).length}/${snapshot.assignments.length}`
        : "0/0",
      trend: snapshot.notifications.length ? "Parent digest ready" : "No parent notices yet",
    },
  ];
}

export function buildRiskDistribution(snapshot: DashboardSnapshot) {
  return snapshot.progress.reduce(
    (accumulator, item) => {
      accumulator[item.riskLevel] += 1;
      return accumulator;
    },
    { low: 0, medium: 0, high: 0 },
  );
}

export function buildLessonCoverage(snapshot: DashboardSnapshot) {
  return snapshot.lessons.map((lesson) => ({
    lessonId: lesson.id,
    title: lesson.title,
    activities: lesson.activities.length,
    totalPoints: lesson.activities.reduce((sum, activity) => sum + activity.points, 0),
  }));
}
