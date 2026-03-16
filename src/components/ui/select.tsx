import type { SelectHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Select(props: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className={cn(
        "w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none ring-0 focus:border-sky-400 focus:shadow-[0_0_0_4px_rgba(14,165,233,0.12)]",
        props.className,
      )}
    />
  );
}
