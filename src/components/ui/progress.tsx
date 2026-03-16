import { percentLabel } from "@/lib/utils";

export function Progress({
  value,
  color = "var(--color-primary)",
}: {
  value: number;
  color?: string;
}) {
  return (
    <div aria-label={percentLabel(value)} className="space-y-2">
      <div className="h-2 rounded-full bg-slate-200">
        <div
          className="h-2 rounded-full transition-all"
          style={{ width: percentLabel(value), backgroundColor: color }}
        />
      </div>
      <p className="text-xs font-medium text-slate-500">{percentLabel(value)}</p>
    </div>
  );
}
