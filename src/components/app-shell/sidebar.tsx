"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpenText, ChartNoAxesCombined, Home, Layers3, MessageSquare, Radar, Shield, UserCircle2, Users } from "lucide-react";
import { getDashboardNavRoutes } from "@/lib/constants";
import { createTestId } from "@/lib/test-id";
import { cn } from "@/lib/utils";
import type { UserProfile } from "@/types/domain";

const iconsByHref = {
  "/dashboard": Home,
  "/dashboard/library": BookOpenText,
  "/dashboard/builder": Layers3,
  "/dashboard/live": Radar,
  "/dashboard/responses": MessageSquare,
  "/dashboard/analytics": ChartNoAxesCombined,
  "/dashboard/assignments": Users,
  "/dashboard/parent": Users,
  "/dashboard/profile": UserCircle2,
  "/dashboard/admin": Shield,
} as const;

export function Sidebar({ currentUser }: { currentUser: UserProfile }) {
  const pathname = usePathname();
  const routes = getDashboardNavRoutes(currentUser.role);

  return (
    <aside className="flex max-h-[calc(100vh-2rem)] flex-col overflow-hidden rounded-[32px] border border-white/60 bg-slate-950 p-5 text-white shadow-2xl shadow-slate-950/20">
      <div className="mb-8 flex items-center gap-3">
        <div className="grid size-11 place-items-center rounded-2xl bg-gradient-to-br from-sky-400 to-cyan-300 text-slate-950">
          EP
        </div>
        <div>
          <p className="text-sm text-slate-400">Interactive Learning OS</p>
          <h2 className="text-xl font-semibold">EngagePod</h2>
        </div>
      </div>
      <nav className="scrollbar-transparent space-y-2 overflow-y-auto pr-1">
        {routes.map((route) => {
          const Icon = iconsByHref[route.href as keyof typeof iconsByHref] ?? Home;
          const isActive =
            pathname === route.href ||
            (route.href !== "/dashboard" && pathname.startsWith(`${route.href}/`));
          return (
            <Link
              key={route.href}
              href={route.href}
              className={cn(
                "group flex items-center gap-3 rounded-2xl border px-4 py-3 text-sm font-medium transition",
                isActive
                  ? "border-sky-300/30 bg-[linear-gradient(135deg,rgba(56,189,248,0.24),rgba(45,212,191,0.18))] text-white shadow-[0_16px_38px_-24px_rgba(56,189,248,0.75)]"
                  : "border-transparent text-slate-300 hover:border-white/10 hover:bg-white/8 hover:text-white",
              )}
              aria-current={isActive ? "page" : undefined}
              data-testid={createTestId("sidebar", route.label)}
            >
              <span
                className={cn(
                  "flex size-9 items-center justify-center rounded-xl transition",
                  isActive
                    ? "bg-white/16 text-white"
                    : "bg-white/5 text-slate-300 group-hover:bg-white/10 group-hover:text-white",
                )}
              >
                <Icon className="size-4" />
              </span>
              <span className={cn(isActive ? "text-white" : "text-inherit")}>{route.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
