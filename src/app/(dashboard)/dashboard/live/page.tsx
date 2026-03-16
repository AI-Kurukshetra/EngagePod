import { LiveSessionPanel } from "@/components/dashboard/live-session-panel";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { getDashboardSnapshot } from "@/lib/platform-data";
import { getDefaultDashboardRoute } from "@/lib/constants";
import { formatDateLabel, formatTimeLabel } from "@/lib/format";
import { redirect } from "next/navigation";

export default async function LivePage() {
  const snapshot = await getDashboardSnapshot();
  if (!snapshot.currentUser) {
    redirect("/login");
  }
  const role = snapshot.currentUser.role;
  if (!["teacher", "student", "parent"].includes(role)) {
    redirect(getDefaultDashboardRoute(snapshot.currentUser.role));
  }

  const liveHeadingByRole = {
    teacher: "Upcoming live learning blocks",
    student: "Your upcoming live classes",
    parent: "Upcoming live sessions",
    admin: "Upcoming live sessions",
    instructional_coach: "Upcoming live sessions",
  } as const;

  const liveDescriptionByRole = {
    teacher: "Launch a lesson session after you have at least one classroom and one published lesson.",
    student: "Your teacher has not scheduled a live classroom session yet.",
    parent: "No live classroom sessions are currently scheduled for family viewing.",
    admin: "No live classroom sessions are currently scheduled.",
    instructional_coach: "No live classroom sessions are currently scheduled.",
  } as const;

  return (
    <div className="space-y-6">
      {snapshot.sessions[0] ? (
        <LiveSessionPanel session={snapshot.sessions[0]} />
      ) : (
        <EmptyState
          title="No live sessions found"
          description={liveDescriptionByRole[role]}
        />
      )}
      <Card className="space-y-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-400">Session schedule</p>
          <h2 className="mt-2 text-2xl font-semibold text-slate-950">{liveHeadingByRole[role]}</h2>
        </div>
        <div className="grid gap-4 lg:grid-cols-2">
          {snapshot.sessions.length ? (
            snapshot.sessions.map((session) => (
              <div key={session.id} className="rounded-3xl border border-slate-200 p-5">
                <p className="text-lg font-semibold text-slate-950">{session.title}</p>
                <p className="mt-2 text-sm text-slate-500">
                  {formatDateLabel(session.startsAt)} at {formatTimeLabel(session.startsAt)}
                </p>
                <div className="mt-4 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-slate-600">
                  <span>{session.breakoutRooms} breakout rooms</span>
                  <span className="text-slate-300">/</span>
                  <span>{session.responseRate}% response rate</span>
                </div>
              </div>
            ))
          ) : (
            <EmptyState
              title="Schedule your first session"
              description="The live roster and pacing controls will populate here after a session is created."
            />
          )}
        </div>
      </Card>
    </div>
  );
}
