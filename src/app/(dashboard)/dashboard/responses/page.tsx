import { redirect } from "next/navigation";
import { StudentResponseStudio } from "@/components/dashboard/student-response-studio";
import { getDefaultDashboardRoute } from "@/lib/constants";
import { getDashboardSnapshot } from "@/lib/platform-data";

export default async function ResponsesPage() {
  const snapshot = await getDashboardSnapshot();
  if (!snapshot.currentUser) {
    redirect("/login");
  }
  if (snapshot.currentUser.role !== "teacher") {
    redirect(getDefaultDashboardRoute(snapshot.currentUser.role));
  }

  const liveSession = snapshot.sessions.find((session) => session.status === "live") ?? snapshot.sessions[0] ?? null;

  return <StudentResponseStudio snapshot={snapshot} session={liveSession} />;
}
