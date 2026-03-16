"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ChevronDown, LogOut, UserCircle2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import { createTestId } from "@/lib/test-id";
import { cn } from "@/lib/utils";
import type { UserProfile } from "@/types/domain";

export function AccountMenu({ currentUser }: { currentUser: UserProfile }) {
  const router = useRouter();
  const menuRef = useRef<HTMLDivElement | null>(null);
  const [open, setOpen] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    function handlePointerDown(event: MouseEvent) {
      if (!menuRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    window.addEventListener("mousedown", handlePointerDown);
    return () => window.removeEventListener("mousedown", handlePointerDown);
  }, []);

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

      setOpen(false);
      router.push("/login");
      router.refresh();
    } finally {
      setIsPending(false);
    }
  }

  return (
    <div ref={menuRef} className="relative hidden sm:block">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="flex items-center gap-3 rounded-2xl bg-slate-950 px-4 py-2 text-white transition hover:bg-slate-900"
        aria-expanded={open}
        aria-haspopup="menu"
        data-testid={createTestId("account-menu", "trigger")}
      >
        <div className="text-left">
          <p className="truncate whitespace-nowrap text-sm font-semibold text-white">{currentUser.fullName}</p>
          <p className="text-xs uppercase tracking-[0.2em] text-slate-400">{currentUser.role}</p>
        </div>
        <ChevronDown className={cn("size-4 text-slate-400 transition", open ? "rotate-180" : "")} />
      </button>

      {open ? (
        <div
          className="absolute right-0 top-[calc(100%+0.75rem)] z-[80] min-w-56 rounded-[24px] border border-slate-200 bg-white p-3 shadow-[0_24px_70px_-32px_rgba(15,23,42,0.35)]"
          role="menu"
          data-testid={createTestId("account-menu", "list")}
        >
          <Link
            href="/dashboard/profile"
            className="flex items-center gap-3 rounded-2xl px-3 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 hover:text-slate-950"
            onClick={() => setOpen(false)}
            data-testid={createTestId("account-menu", "profile")}
          >
            <UserCircle2 className="size-4" />
            Profile
          </Link>
          <button
            type="button"
            onClick={handleLogout}
            disabled={isPending}
            className="flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left text-sm font-semibold text-slate-700 transition hover:bg-slate-50 hover:text-slate-950 disabled:cursor-not-allowed disabled:opacity-60"
            data-testid={createTestId("account-menu", "logout")}
          >
            <LogOut className="size-4" />
            {isPending ? "Signing out..." : "Logout"}
          </button>
          {errorMessage ? (
            <p className="px-3 pb-1 pt-2 text-xs leading-5 text-rose-600" data-testid={createTestId("account-menu", "error")}>
              {errorMessage}
            </p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
