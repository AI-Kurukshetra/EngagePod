import type { Route } from "next";
import type { UserRole } from "@/types/domain";

export const APP_NAME = "EngagePod";

export const API_GROUPS = [
  "auth",
  "users",
  "schools",
  "classrooms",
  "lessons",
  "activities",
  "responses",
  "assessments",
  "analytics",
  "content",
  "media",
  "sessions",
  "notifications",
  "integrations",
  "reports",
  "admin",
] as const;

const ALL_ROLES: UserRole[] = ["teacher", "student", "parent", "admin", "instructional_coach"];

type DashboardRoute = {
  href: Route;
  label: string;
  nav: boolean;
  roles: UserRole[];
  roleLabels?: Partial<Record<UserRole, string>>;
};

export const DASHBOARD_ROUTES: readonly DashboardRoute[] = [
  {
    href: "/dashboard",
    label: "Overview",
    nav: true,
    roles: ["teacher", "student", "parent", "admin"] as UserRole[],
    roleLabels: { admin: "Dashboard", student: "Dashboard", parent: "Dashboard" },
  },
  { href: "/dashboard/library", label: "Library", nav: true, roles: ["teacher", "admin"] as UserRole[] },
  { href: "/dashboard/builder", label: "Builder", nav: true, roles: ["teacher", "admin"] as UserRole[] },
  { href: "/dashboard/live", label: "Live", nav: true, roles: ["teacher", "student", "parent"] as UserRole[] },
  { href: "/dashboard/responses", label: "Student Response", nav: true, roles: ["teacher"] as UserRole[] },
  { href: "/dashboard/analytics", label: "Analytics", nav: true, roles: ["teacher", "student", "parent"] as UserRole[] },
  { href: "/dashboard/assignments", label: "Assignments", nav: true, roles: ["teacher", "student", "parent"] as UserRole[] },
  { href: "/dashboard/parent", label: "Parent Portal", nav: true, roles: ["admin"] as UserRole[], roleLabels: { admin: "Parents" } },
  { href: "/dashboard/profile", label: "Profile", nav: false, roles: ALL_ROLES },
  { href: "/dashboard/admin", label: "Admin", nav: true, roles: ["admin"] as UserRole[], roleLabels: { admin: "Teacher" } },
];

export function getDashboardNavRoutes(role: UserRole) {
  return DASHBOARD_ROUTES
    .filter((route) => route.nav && route.roles.includes(role))
    .map((route) => ({
      ...route,
      label: route.roleLabels?.[role] ?? route.label,
    }));
}

export function getDefaultDashboardRoute(role: UserRole) {
  return getDashboardNavRoutes(role)[0]?.href ?? ("/dashboard" as Route);
}
