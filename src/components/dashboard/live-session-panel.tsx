"use client";

import { useState } from "react";
import { Mic, Play, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { createTestId } from "@/lib/test-id";
import type { LiveSession } from "@/types/domain";

export function LiveSessionPanel({ session }: { session: LiveSession }) {
  const [engagement, setEngagement] = useState(session.engagementScore);

  return (
    <Card className="space-y-6 bg-slate-950 text-white">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Live classroom</p>
          <h2 className="mt-2 text-2xl font-semibold">{session.title}</h2>
          <p className="mt-2 text-sm text-slate-300">
            Teacher-paced delivery, breakout rooms, and live response ingestion are active.
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Button
            variant="secondary"
            className="w-full sm:w-auto"
            icon={<Mic className="size-4" />}
            onClick={() => setEngagement((value) => Math.min(value + 2, 100))}
            data-testid={createTestId("live", "boost")}
          >
            Boost engagement
          </Button>
          <Button className="w-full sm:w-auto" icon={<Play className="size-4" />} data-testid={createTestId("live", "launch")}>
            Launch activity
          </Button>
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-3xl bg-white/10 p-4">
          <div className="flex items-center gap-2 text-slate-300">
            <Users className="size-4" />
            Attendees
          </div>
          <p className="mt-3 text-3xl font-semibold">{session.attendeeCount}</p>
        </div>
        <div className="rounded-3xl bg-white/10 p-4">
          <p className="text-sm text-slate-300">Response rate</p>
          <p className="mt-3 text-3xl font-semibold">{session.responseRate}%</p>
        </div>
        <div className="rounded-3xl bg-white/10 p-4">
          <p className="text-sm text-slate-300">Breakout rooms</p>
          <p className="mt-3 text-3xl font-semibold">{session.breakoutRooms}</p>
        </div>
      </div>
      <Progress value={engagement} color="#38bdf8" />
    </Card>
  );
}
