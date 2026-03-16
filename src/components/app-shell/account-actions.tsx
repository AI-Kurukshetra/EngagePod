"use client";

import { useState } from "react";
import Link from "next/link";
import { LogOut, UserCircle2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import { createTestId } from "@/lib/test-id";
import { cn } from "@/lib/utils";

export function AccountActions({
  layout = "inline",
}: {
  layout?: "inline" | "stacked" | "sidebar";
}) {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleLogout() {
    setErrorMessage(null);
    setIsPending(true);

    try {
      const supabase = createBrowserSupabaseClient();
      if (!supabase) {
        router.push("/login");
        router.refresh();
        return;
      }

      const { error } = await supabase.auth.signOut();
      if (error) {
        setErrorMessage(error.message);
        return;
      }

      router.push("/login");
      router.refresh();
    } finally {
      setIsPending(false);
    }
  }

  const containerClassName =
    layout === "stacked"
      ? "flex flex-col gap-2"
      : layout === "sidebar"
        ? "flex flex-col gap-2"
        : "flex flex-wrap items-center gap-2";

  const linkClassName =
    layout === "sidebar"
      ? "flex items-center justify-center gap-2 rounded-2xl bg-white/10 px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/15"
      : "inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800";

  const buttonClassName =
    layout === "sidebar"
      ? "flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-transparent px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/8"
      : "inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50";

  return (
    <div className={containerClassName}>
      <Link
        href="/dashboard/profile"
        className={linkClassName}
        data-testid={createTestId("account-actions", "profile")}
      >
        <UserCircle2 className="size-4" />
        Profile
      </Link>
      <button
        type="button"
        onClick={handleLogout}
        disabled={isPending}
        className={cn(buttonClassName, isPending ? "cursor-not-allowed opacity-60" : "")}
        data-testid={createTestId("account-actions", "logout")}
      >
        <LogOut className="size-4" />
        {isPending ? "Signing out..." : "Logout"}
      </button>
      {errorMessage ? (
        <p
          className={cn(
            "text-xs leading-5",
            layout === "sidebar" ? "text-rose-200" : "text-rose-600",
          )}
          data-testid={createTestId("account-actions", "error")}
        >
          {errorMessage}
        </p>
      ) : null}
    </div>
  );
}
