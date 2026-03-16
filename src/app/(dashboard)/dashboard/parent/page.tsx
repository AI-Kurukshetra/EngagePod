import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Progress } from "@/components/ui/progress";
import { getDefaultDashboardRoute } from "@/lib/constants";
import { getDashboardSnapshot } from "@/lib/platform-data";
import { redirect } from "next/navigation";

export default async function ParentPage() {
  const snapshot = await getDashboardSnapshot();
  if (!snapshot.currentUser) {
    redirect("/login");
  }
  if (snapshot.currentUser.role !== "admin") {
    redirect(getDefaultDashboardRoute(snapshot.currentUser.role));
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
      <Card className="space-y-5">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-400">Parent portal</p>
          <h2 className="mt-2 text-2xl font-semibold text-slate-950">Home visibility without dashboard overload</h2>
        </div>
        <div className="space-y-4">
          {snapshot.progress.length ? (
            snapshot.progress.map((item) => (
              <div key={item.studentId} className="rounded-3xl border border-slate-200 p-5">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <p className="font-semibold text-slate-950">{item.studentId.replace("_", " ")}</p>
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase text-slate-600">
                    {item.riskLevel} risk
                  </span>
                </div>
                <div className="mt-4">
                  <Progress value={item.masteryRate} />
                </div>
              </div>
            ))
          ) : (
            <EmptyState
              title="No parent-facing progress yet"
              description="Student progress summaries will appear here after classroom activity and assessment data arrive."
            />
          )}
        </div>
      </Card>
      <Card className="space-y-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-400">Family communication</p>
          <h2 className="mt-2 text-2xl font-semibold text-slate-950">Notifications and action prompts</h2>
        </div>
        <div className="space-y-3">
          {snapshot.notifications.length ? (
            snapshot.notifications.map((notification) => (
              <div key={notification.id} className="rounded-3xl bg-slate-50 p-5">
                <p className="font-semibold text-slate-950">{notification.title}</p>
                <p className="mt-2 text-sm text-slate-500">
                  Channel: {notification.channel} | Status: {notification.status}
                </p>
              </div>
            ))
          ) : (
            <EmptyState
              title="No family notifications queued"
              description="Parent and guardian communications will appear after notification workflows are configured."
            />
          )}
        </div>
      </Card>
    </div>
  );
}
