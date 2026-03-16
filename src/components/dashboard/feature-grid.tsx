import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { createTestId } from "@/lib/test-id";
import type { FeatureItem } from "@/types/domain";

export function FeatureGrid({
  title,
  description,
  items,
}: {
  title: string;
  description: string;
  items: FeatureItem[];
}) {
  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-slate-950">{title}</h2>
          <p className="text-sm text-slate-600">{description}</p>
        </div>
      </div>
      <div className="grid gap-4 xl:grid-cols-2">
        {items.map((item) => (
          <Card key={item.id} className="space-y-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h3 className="text-lg font-semibold text-slate-950" data-testid={createTestId("feature", item.id)}>
                  {item.title}
                </h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">{item.description}</p>
              </div>
              <Badge
                tone={item.priority === "must-have" ? "success" : item.priority === "innovative" ? "info" : "warning"}
              >
                {item.priority}
              </Badge>
            </div>
            <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
              Complexity: {item.complexity}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
