"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpenText, ChartNoAxesCombined, Home, Layers3, Menu, MessageSquare, Radar, Shield, UserCircle2, Users, X } from "lucide-react";
import { AccountActions } from "@/components/app-shell/account-actions";
import { getDashboardNavRoutes } from "@/lib/constants";
import { createTestId } from "@/lib/test-id";
import { cn, initials } from "@/lib/utils";
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

export function MobileNav({ currentUser }: { currentUser: UserProfile }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const routes = getDashboardNavRoutes(currentUser.role);

  return (
    <div className="lg:hidden">
      <div className="flex items-center justify-between rounded-[28px] border border-white/70 bg-white/85 px-4 py-3 shadow-[0_22px_70px_-42px_rgba(15,23,42,0.35)] backdrop-blur">
        <div className="flex items-center gap-3">
          <div className="grid size-11 place-items-center rounded-2xl bg-slate-950 text-sm font-semibold text-white">
            {initials(currentUser.fullName)}
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-950">{currentUser.fullName}</p>
            <p className="text-xs uppercase tracking-[0.2em] text-slate-500">{currentUser.role}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          className="flex size-11 items-center justify-center rounded-2xl bg-slate-950 text-white"
          data-testid={createTestId("mobile-nav", open ? "close" : "open")}
          aria-expanded={open}
          aria-label={open ? "Close navigation menu" : "Open navigation menu"}
        >
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>

      {open ? (
        <div className="mt-4 rounded-[28px] border border-white/70 bg-slate-950 p-4 text-white shadow-2xl shadow-slate-950/20">
          <div className="mb-4">
            <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Navigate workspace</p>
          </div>
          <nav className="grid gap-2">
            {routes.map((route) => {
              const Icon = iconsByHref[route.href as keyof typeof iconsByHref] ?? Home;
              const isActive =
                pathname === route.href ||
                (route.href !== "/dashboard" && pathname.startsWith(`${route.href}/`));

              return (
                <Link
                  key={route.href}
                  href={route.href}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "group flex items-center gap-3 rounded-2xl border px-4 py-3 text-sm font-medium transition",
                    isActive
                      ? "border-sky-300/30 bg-[linear-gradient(135deg,rgba(56,189,248,0.24),rgba(45,212,191,0.18))] text-white"
                      : "border-transparent text-slate-300 hover:border-white/10 hover:bg-white/8 hover:text-white",
                  )}
                  aria-current={isActive ? "page" : undefined}
                  data-testid={createTestId("mobile-sidebar", route.label)}
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
                  <span>{route.label}</span>
                </Link>
              );
            })}
          </nav>
          <div className="mt-4 border-t border-white/10 pt-4">
            <AccountActions layout="stacked" />
          </div>
        </div>
      ) : null}
    </div>
  );
}
