import { Card } from "@/components/ui/card";
import { getDashboardSnapshot } from "@/lib/platform-data";
import { buildLessonCoverage, buildRiskDistribution } from "@/lib/analytics";
import { getDefaultDashboardRoute } from "@/lib/constants";
import { redirect } from "next/navigation";

export default async function AnalyticsPage() {
  const snapshot = await getDashboardSnapshot();
  if (!snapshot.currentUser) {
    redirect("/login");
  }
  const role = snapshot.currentUser.role;
  if (!["teacher", "student", "parent"].includes(role)) {
    redirect(getDefaultDashboardRoute(snapshot.currentUser.role));
  }
  const coverage = buildLessonCoverage(snapshot);
  const risk = buildRiskDistribution(snapshot);
  const roleLabelByRole = {
    teacher: "Risk and mastery analytics",
    student: "Progress and mastery signals",
    parent: "Progress and mastery overview",
    admin: "Risk and mastery analytics",
    instructional_coach: "Risk and mastery analytics",
  } as const;
  const coverageLabelByRole = {
    teacher: "Assessment depth by lesson",
    student: "Learning coverage by lesson",
    parent: "Coverage across current lessons",
    admin: "Assessment depth by lesson",
    instructional_coach: "Assessment depth by lesson",
  } as const;

  return (
    <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
      <Card className="space-y-5">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-400">Predictive signals</p>
          <h2 className="mt-2 text-2xl font-semibold text-slate-950">{roleLabelByRole[role]}</h2>
        </div>
        <div className="space-y-4">
          {Object.entries(risk).map(([label, value]) => (
            <div key={label} className="rounded-3xl bg-slate-50 p-5">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm font-medium capitalize text-slate-600">{label} risk</p>
                <p className="text-2xl font-semibold text-slate-950">{value}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>
      <Card className="space-y-5">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-400">Lesson coverage</p>
          <h2 className="mt-2 text-2xl font-semibold text-slate-950">{coverageLabelByRole[role]}</h2>
        </div>
        <div className="space-y-4">
          {coverage.map((item) => (
            <div key={item.lessonId} className="space-y-2 rounded-3xl border border-slate-200 p-5">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <p className="font-semibold text-slate-950">{item.title}</p>
                <p className="text-sm text-slate-500">{item.activities} activities</p>
              </div>
              <div className="h-3 rounded-full bg-slate-100">
                <div
                  className="h-3 rounded-full bg-gradient-to-r from-sky-500 to-cyan-400"
                  style={{ width: `${Math.min(item.totalPoints, 100)}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
