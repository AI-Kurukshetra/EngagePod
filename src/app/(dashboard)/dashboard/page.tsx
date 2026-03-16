import { LiveSessionPanel } from "@/components/dashboard/live-session-panel";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Progress } from "@/components/ui/progress";
import { StatCard } from "@/components/ui/stat-card";
import { buildMetricCards, buildRiskDistribution } from "@/lib/analytics";
import { getDashboardSnapshot } from "@/lib/platform-data";
import { formatDateLabel } from "@/lib/format";

export default async function DashboardPage() {
  const snapshot = await getDashboardSnapshot();
  const role = snapshot.currentUser?.role ?? "teacher";
  const metrics = buildMetricCards(snapshot);
  const risk = buildRiskDistribution(snapshot);
  const canOpenBuilder = role === "teacher" || role === "admin";
  const noLiveDescriptionByRole = {
    teacher: "Create a classroom session after your first lesson is published.",
    student: "Your teacher has not scheduled a live session yet.",
    parent: "Live classroom sessions will appear here when they are scheduled.",
    admin: "No live sessions are currently active in this workspace.",
    instructional_coach: "Live sessions will appear here after teachers launch classroom sessions.",
  } as const;
  const assignmentsHeadingByRole = {
    teacher: "What learners need next",
    student: "What you need to complete",
    parent: "Family assignment snapshot",
    admin: "Assignment progress overview",
    instructional_coach: "Assignment progress by classroom",
  } as const;
  const allMcqAttempts = snapshot.assignmentMcqAttempts;
  const visibleMcqAttempts =
    role === "student"
      ? allMcqAttempts.filter((attempt) => attempt.studentId === snapshot.currentUser?.id)
      : allMcqAttempts;
  const totalMcqPoints = visibleMcqAttempts.reduce((sum, attempt) => sum + attempt.pointsEarned, 0);
  const correctMcqCount = visibleMcqAttempts.filter((attempt) => attempt.isCorrect).length;
  const mcqAccuracy = visibleMcqAttempts.length ? Math.round((correctMcqCount / visibleMcqAttempts.length) * 100) : 0;
  const resultHeadingByRole = {
    teacher: "MCQ result board",
    student: "Your MCQ results",
    parent: "Family-facing MCQ results",
    admin: "MCQ result board",
    instructional_coach: "MCQ result board",
  } as const;
  const resultDescriptionByRole = {
    teacher: "Track participation and accuracy across published assignment MCQs.",
    student: "Review your submitted MCQ attempts and current score.",
    parent: "Review assignment MCQ outcomes and completion trends.",
    admin: "Track participation and accuracy across published assignment MCQs.",
    instructional_coach: "Track participation and accuracy across published assignment MCQs.",
  } as const;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => (
          <StatCard key={metric.label} {...metric} />
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
        {snapshot.sessions[0] ? (
          <LiveSessionPanel session={snapshot.sessions[0]} />
        ) : (
          <EmptyState
            title="No live session is scheduled"
            description={noLiveDescriptionByRole[role]}
            ctaLabel={canOpenBuilder ? "Open builder" : undefined}
            ctaHref={canOpenBuilder ? "/dashboard/builder" : undefined}
          />
        )}
        <Card className="space-y-5">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-400">Risk radar</p>
            <h2 className="mt-2 text-2xl font-semibold text-slate-950">Intervention at a glance</h2>
          </div>
          <div className="space-y-4">
            {[
              { label: "Low risk", value: risk.low, color: "#22c55e" },
              { label: "Medium risk", value: risk.medium, color: "#f59e0b" },
              { label: "High risk", value: risk.high, color: "#ef4444" },
            ].map((item) => (
              <div key={item.label} className="space-y-2">
                <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between text-sm font-medium text-slate-700">
                  <span>{item.label}</span>
                  <span>{item.value}</span>
                </div>
                <Progress value={item.value * 30} color={item.color} />
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div>
        <Card className="space-y-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-400">Assignments</p>
            <h2 className="mt-2 text-2xl font-semibold text-slate-950">{assignmentsHeadingByRole[role]}</h2>
          </div>
          <div className="space-y-4">
            {snapshot.assignments.length ? (
              snapshot.assignments.map((assignment) => (
                <div key={assignment.id} className="rounded-3xl border border-slate-200 p-5">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <h3 className="text-lg font-semibold text-slate-950">{assignment.title}</h3>
                      <p className="mt-1 text-sm text-slate-500">Due {formatDateLabel(assignment.dueDate)}</p>
                    </div>
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                      {assignment.assignedCount} learners
                    </span>
                  </div>
                  <div className="mt-4">
                    <Progress value={assignment.completionRate} />
                  </div>
                </div>
              ))
            ) : (
              <EmptyState
                title="No assignments yet"
                description="Assignments will appear here once lessons are scheduled for a classroom."
              />
            )}
          </div>
        </Card>
      </div>

      <div>
        <Card className="space-y-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-400">Assignment results</p>
            <h2 className="mt-2 text-2xl font-semibold text-slate-950">{resultHeadingByRole[role]}</h2>
            <p className="mt-2 text-sm text-slate-600">{resultDescriptionByRole[role]}</p>
          </div>
          {snapshot.assignmentMcqs.length ? (
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-3xl border border-slate-200 p-5">
                <p className="text-sm text-slate-500">Published MCQs</p>
                <p className="mt-2 text-3xl font-semibold text-slate-950">{snapshot.assignmentMcqs.length}</p>
              </div>
              <div className="rounded-3xl border border-slate-200 p-5">
                <p className="text-sm text-slate-500">Submitted attempts</p>
                <p className="mt-2 text-3xl font-semibold text-slate-950">{visibleMcqAttempts.length}</p>
              </div>
              <div className="rounded-3xl border border-slate-200 p-5">
                <p className="text-sm text-slate-500">{role === "student" ? "Your score" : "Accuracy"}</p>
                <p className="mt-2 text-3xl font-semibold text-slate-950">
                  {role === "student" ? totalMcqPoints : `${mcqAccuracy}%`}
                </p>
              </div>
            </div>
          ) : (
            <EmptyState
              title="No assignment MCQ results yet"
              description="MCQ results will appear here after teachers publish assignment MCQs and students submit attempts."
            />
          )}
        </Card>
      </div>
    </div>
  );
}
