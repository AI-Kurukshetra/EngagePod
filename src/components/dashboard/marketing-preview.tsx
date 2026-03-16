import Link from "next/link";
import type { Route } from "next";
import { ArrowRight, ShieldCheck, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { APP_NAME } from "@/lib/constants";

export function MarketingPreview() {
  return (
    <section className="relative overflow-hidden px-4 py-6 lg:px-10 lg:py-10">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,_rgba(14,165,233,0.18),_transparent_36%),radial-gradient(circle_at_right,_rgba(45,212,191,0.14),_transparent_28%),linear-gradient(180deg,_#f8fcff_0%,_#eef6ff_100%)]" />
      <div className="mx-auto max-w-[1400px]">
        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <Card className="relative overflow-hidden bg-slate-950 text-white">
            <div className="absolute -left-20 top-6 size-64 rounded-full bg-sky-400/20 blur-3xl" />
            <div className="relative space-y-6">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm">
                <Sparkles className="size-4 text-cyan-300" />
                Interactive teaching, aligned for every classroom
              </div>
              <div className="space-y-4">
                <h1 className="max-w-3xl text-4xl font-semibold tracking-tight lg:text-6xl">
                  {APP_NAME} turns lessons into live, adaptive learning experiences.
                </h1>
                <p className="max-w-2xl text-lg leading-8 text-slate-300">
                  Launch multimedia lessons, collect responses in real time, surface intervention signals,
                  and keep parents, teachers, and administrators aligned in one secure workspace.
                </p>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row">
                <Link href={"/register" as Route}>
                  <Button icon={<ArrowRight className="size-4" />}>Create account</Button>
                </Link>
                <Link href="/login">
                  <Button variant="secondary" icon={<ShieldCheck className="size-4" />}>
                    Sign in
                  </Button>
                </Link>
              </div>
            </div>
          </Card>
          <Card className="grid gap-4">
            <div className="rounded-[28px] bg-gradient-to-br from-sky-500 to-cyan-400 p-6 text-slate-950">
              <p className="text-sm font-semibold uppercase tracking-[0.3em]">What ships in MVP</p>
              <h2 className="mt-3 text-3xl font-semibold">Auth, lessons, live rooms, analytics, parent visibility.</h2>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {[
                "Curriculum-aligned content library",
                "Interactive lesson builder",
                "Predictive risk analytics",
                "Google Classroom-ready integration layer",
              ].map((item) => (
                <div key={item} className="rounded-3xl border border-slate-200 bg-slate-50 p-5 text-sm font-medium text-slate-700">
                  {item}
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </section>
  );
}
