import { MobileNav } from "@/components/app-shell/mobile-nav";
import { Sidebar } from "@/components/app-shell/sidebar";
import { Topbar } from "@/components/app-shell/topbar";
import type { DashboardSnapshot } from "@/types/domain";

export function DashboardShell({
  snapshot,
  children,
}: {
  snapshot: DashboardSnapshot;
  children: React.ReactNode;
}) {
  if (!snapshot.currentUser) {
    return null;
  }

  return (
    <div className="mx-auto grid min-h-screen max-w-[1600px] gap-6 px-4 py-4 lg:items-start lg:grid-cols-[280px_1fr] lg:px-6">
      <div className="hidden lg:sticky lg:top-4 lg:block lg:self-start">
        <Sidebar currentUser={snapshot.currentUser} />
      </div>
      <main className="min-w-0 space-y-6">
        <MobileNav currentUser={snapshot.currentUser} />
        <Topbar currentUser={snapshot.currentUser} />
        {children}
      </main>
    </div>
  );
}
