import { DashboardShell } from "@/components/app-shell/dashboard-shell";
import { getDashboardSnapshot } from "@/lib/platform-data";
import { redirect } from "next/navigation";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const snapshot = await getDashboardSnapshot();
  if (!snapshot.currentUser) {
    redirect("/login");
  }

  return <DashboardShell snapshot={snapshot}>{children}</DashboardShell>;
}
