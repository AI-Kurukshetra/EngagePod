import type { Route } from "next";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export function EmptyState({
  title,
  description,
  ctaLabel,
  ctaHref,
}: {
  title: string;
  description: string;
  ctaLabel?: string;
  ctaHref?: Route;
}) {
  return (
    <Card className="space-y-4 border-dashed border-slate-300 bg-slate-50/80 text-center">
      <div className="space-y-2">
        <h2 className="text-xl font-semibold text-slate-950 sm:text-2xl">{title}</h2>
        <p className="mx-auto max-w-2xl text-sm leading-6 text-slate-600">{description}</p>
      </div>
      {ctaLabel && ctaHref ? (
        <div className="flex justify-center">
          <Button href={ctaHref}>{ctaLabel}</Button>
        </div>
      ) : null}
    </Card>
  );
}
