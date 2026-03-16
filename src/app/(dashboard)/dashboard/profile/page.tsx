import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { getDashboardSnapshot } from "@/lib/platform-data";

export default async function ProfilePage() {
  const snapshot = await getDashboardSnapshot();
  const currentUser = snapshot.currentUser;
  const school = snapshot.schools[0];

  if (!currentUser) {
    return (
      <Card>
        <EmptyState
          title="Profile unavailable"
          description="Sign in again to load your profile details."
        />
      </Card>
    );
  }

  const assignedClassrooms = snapshot.classrooms.filter((classroom) =>
    currentUser.classroomIds.includes(classroom.id),
  );

  return (
    <div className="space-y-6">
      <Card className="space-y-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex items-start gap-4">
            <div className="grid size-20 place-items-center rounded-[28px] bg-slate-950 text-2xl font-semibold text-white">
              {currentUser.fullName
                .split(" ")
                .filter(Boolean)
                .slice(0, 2)
                .map((part) => part[0]?.toUpperCase())
                .join("")}
            </div>
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-400">Profile</p>
              <h1 className="mt-2 text-3xl font-semibold text-slate-950">{currentUser.fullName}</h1>
              <p className="mt-2 text-sm text-slate-500">{currentUser.email}</p>
              <div className="mt-4 flex flex-wrap gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                <span className="rounded-full bg-slate-100 px-3 py-1">{currentUser.role}</span>
                <span className="rounded-full bg-slate-100 px-3 py-1">{currentUser.locale}</span>
                <span className="rounded-full bg-slate-100 px-3 py-1">{currentUser.streakDays} day streak</span>
              </div>
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-3xl bg-slate-50 p-4">
              <p className="text-sm text-slate-500">Workspace</p>
              <p className="mt-2 text-lg font-semibold text-slate-950">{school?.name ?? "Not assigned yet"}</p>
            </div>
            <div className="rounded-3xl bg-slate-50 p-4">
              <p className="text-sm text-slate-500">District</p>
              <p className="mt-2 text-lg font-semibold text-slate-950">{school?.district ?? "Unavailable"}</p>
            </div>
          </div>
        </div>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card className="space-y-2">
          <p className="text-sm text-slate-500">Assigned classrooms</p>
          <p className="text-3xl font-semibold text-slate-950">{assignedClassrooms.length}</p>
        </Card>
        <Card className="space-y-2">
          <p className="text-sm text-slate-500">Lessons available</p>
          <p className="text-3xl font-semibold text-slate-950">{snapshot.lessons.length}</p>
        </Card>
        <Card className="space-y-2">
          <p className="text-sm text-slate-500">Library folders</p>
          <p className="text-3xl font-semibold text-slate-950">{snapshot.libraryFolders.length}</p>
        </Card>
        <Card className="space-y-2">
          <p className="text-sm text-slate-500">Shared resources</p>
          <p className="text-3xl font-semibold text-slate-950">{snapshot.content.length}</p>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <Card className="space-y-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-400">Assigned classrooms</p>
            <h2 className="mt-2 text-2xl font-semibold text-slate-950">Where you are active</h2>
          </div>
          <div className="space-y-3">
            {assignedClassrooms.length ? (
              assignedClassrooms.map((classroom) => (
                <div key={classroom.id} className="rounded-3xl border border-slate-200 p-5">
                  <p className="font-semibold text-slate-950">{classroom.title}</p>
                  <p className="mt-2 text-sm text-slate-500">
                    {classroom.subject} / {classroom.gradeBand}
                  </p>
                  <p className="mt-3 text-xs uppercase tracking-[0.2em] text-slate-400">
                    {classroom.rosterCount} learners / {classroom.completionRate}% completion
                  </p>
                </div>
              ))
            ) : (
              <EmptyState
                title="No assigned classrooms"
                description="Your classroom assignments will appear here once your workspace connects you to active sections."
              />
            )}
          </div>
        </Card>

        <Card className="space-y-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-400">Workspace context</p>
            <h2 className="mt-2 text-2xl font-semibold text-slate-950">Your access snapshot</h2>
          </div>
          <div className="space-y-3">
            <div className="rounded-3xl bg-slate-50 p-5">
              <p className="text-sm text-slate-500">Role</p>
              <p className="mt-2 text-lg font-semibold text-slate-950">{currentUser.role}</p>
            </div>
            <div className="rounded-3xl bg-slate-50 p-5">
              <p className="text-sm text-slate-500">School time zone</p>
              <p className="mt-2 text-lg font-semibold text-slate-950">{school?.timeZone ?? "UTC"}</p>
            </div>
            <div className="rounded-3xl bg-slate-50 p-5">
              <p className="text-sm text-slate-500">Notifications available</p>
              <p className="mt-2 text-lg font-semibold text-slate-950">{snapshot.notifications.length}</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
