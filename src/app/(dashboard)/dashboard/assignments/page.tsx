import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Progress } from "@/components/ui/progress";
import { TeacherAssignmentsWorkspace } from "@/components/dashboard/teacher-assignments-workspace";
import { StudentAssignmentsWorkspace } from "@/components/dashboard/student-assignments-workspace";
import { getDashboardSnapshot } from "@/lib/platform-data";
import { getDefaultDashboardRoute } from "@/lib/constants";
import { formatDateLabel } from "@/lib/format";
import { redirect } from "next/navigation";

export default async function AssignmentsPage() {
  const snapshot = await getDashboardSnapshot();
  if (!snapshot.currentUser) {
    redirect("/login");
  }
  const role = snapshot.currentUser.role;
  if (!["teacher", "student", "parent"].includes(role)) {
    redirect(getDefaultDashboardRoute(snapshot.currentUser.role));
  }

  if (role === "teacher") {
    return <TeacherAssignmentsWorkspace assessments={snapshot.assessments} assignments={snapshot.assignments} />;
  }

  if (role === "student") {
    return <StudentAssignmentsWorkspace assignments={snapshot.assignments} />;
  }

  const headingByRole = {
    student: "Track due dates and completion",
    parent: "Family assignment follow-through",
    admin: "Assignment progress overview",
    instructional_coach: "Assignment progress overview",
  } as const;
  const subheadingByRole = {
    student: "Assignments",
    parent: "Assignments",
    admin: "Assignments",
    instructional_coach: "Assignments",
  } as const;
  const emptyDescriptionByRole = {
    student: "Your assignment list will appear after teachers publish and schedule classroom work.",
    parent: "Family assignment updates will appear after classroom tasks are published.",
    admin: "Assignment summaries will appear once classroom work starts flowing into the platform.",
    instructional_coach: "Assignment summaries will appear once classroom work starts flowing into the platform.",
  } as const;
  const emptyTitleByRole = {
    student: "No assignments available",
    parent: "No assignments available",
    admin: "No assignments available",
    instructional_coach: "No assignments available",
  } as const;

  return (
    <Card className="space-y-5">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-400">{subheadingByRole[role]}</p>
        <h2 className="mt-2 text-2xl font-semibold text-slate-950">{headingByRole[role]}</h2>
      </div>
      <div className="grid gap-4">
        {snapshot.assignments.length ? (
          snapshot.assignments.map((assignment) => (
            <div key={assignment.id} className="rounded-3xl border border-slate-200 p-5">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-lg font-semibold text-slate-950">{assignment.title}</p>
                  <p className="mt-1 text-sm text-slate-500">Due {formatDateLabel(assignment.dueDate)}</p>
                </div>
                <span className="rounded-full bg-slate-100 px-4 py-2 text-xs font-semibold text-slate-700">
                  {assignment.assignedCount} learners
                </span>
              </div>
              <div className="mt-4">
                <p className="text-sm text-slate-500">Completion</p>
                <Progress value={assignment.completionRate} />
              </div>
            </div>
          ))
        ) : (
          <EmptyState
            title={emptyTitleByRole[role]}
            description={emptyDescriptionByRole[role]}
          />
        )}
      </div>
      <div className="rounded-3xl bg-slate-950 p-5 text-sm text-slate-200">
        {snapshot.assignments[0]
          ? `Next assignment deadline: ${formatDateLabel(snapshot.assignments[0].dueDate)}.`
          : "Assignment due-date updates will appear here once tasks are scheduled."}
      </div>
    </Card>
  );
}
