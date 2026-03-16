import { Search } from "lucide-react";
import { AccountMenu } from "@/components/app-shell/account-menu";
import { Input } from "@/components/ui/input";
import { createTestId } from "@/lib/test-id";
import type { UserProfile } from "@/types/domain";

export function Topbar({ currentUser }: { currentUser: UserProfile }) {
  return (
    <div className="relative z-20 flex flex-col gap-4 overflow-visible rounded-[28px] border border-white/70 bg-white/80 p-4 backdrop-blur sm:p-5 lg:flex-row lg:items-center lg:justify-between">
      <div>
        <p className="text-sm font-medium uppercase tracking-[0.3em] text-slate-400">Today&apos;s command center</p>
        <h1 className="mt-1 text-2xl font-semibold text-slate-950 sm:text-3xl">Teach with momentum, not admin drag.</h1>
      </div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative w-full sm:min-w-[260px] sm:flex-1 lg:max-w-md">
          <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
          <Input
            aria-label="Search"
            className="pl-10"
            placeholder="Search lessons, classes, or standards"
            data-testid={createTestId("topbar", "search")}
          />
        </div>
        <div className="flex items-center gap-3">
          <AccountMenu currentUser={currentUser} />
        </div>
      </div>
    </div>
  );
}
