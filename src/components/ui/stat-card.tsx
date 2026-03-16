import { ArrowUpRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { createTestId } from "@/lib/test-id";

export function StatCard({
  label,
  value,
  trend,
}: {
  label: string;
  value: string;
  trend: string;
}) {
  return (
    <Card className="relative overflow-hidden">
      <div className="absolute inset-x-6 top-0 h-20 rounded-full bg-sky-100/70 blur-2xl" />
      <div className="relative space-y-3">
        <p className="text-sm font-medium text-slate-500">{label}</p>
        <p className="text-2xl font-semibold text-slate-950 sm:text-3xl" data-testid={createTestId("stat", label)}>
          {value}
        </p>
        <div className="inline-flex max-w-full items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold leading-5 text-emerald-700">
          <ArrowUpRight className="size-3" />
          <span className="break-words">{trend}</span>
        </div>
      </div>
    </Card>
  );
}
