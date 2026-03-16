import { AdminPanel } from "@/components/dashboard/admin-panel";
import { getDefaultDashboardRoute } from "@/lib/constants";
import { getDashboardSnapshot } from "@/lib/platform-data";
import { redirect } from "next/navigation";

export default async function AdminPage() {
  const snapshot = await getDashboardSnapshot();
  if (!snapshot.currentUser) {
    redirect("/login");
  }
  if (snapshot.currentUser.role !== "admin") {
    redirect(getDefaultDashboardRoute(snapshot.currentUser.role));
  }
  return <AdminPanel snapshot={snapshot} />;
}
