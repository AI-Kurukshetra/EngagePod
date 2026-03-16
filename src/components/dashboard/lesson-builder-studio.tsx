"use client";

import { useMemo, useState } from "react";
import {
  CircleHelp,
  FileText,
  GripVertical,
  ImageIcon,
  MessageSquareQuote,
  PencilRuler,
  PlaySquare,
  Plus,
  Sparkles,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { createTestId } from "@/lib/test-id";
import type { Lesson } from "@/types/domain";

type BuilderTemplate = {
  id: string;
  title: string;
  type: string;
  prompt: string;
  estimatedMinutes: number;
  points: number;
  family: "interactive" | "media";
  icon: typeof CircleHelp;
};

type BuilderBlock = {
  id: string;
  lessonId: string;
  title: string;
  type: string;
  prompt: string;
  estimatedMinutes: number;
  points: number;
  family: "interactive" | "media";
  icon: typeof CircleHelp;
};

const BUILDER_TEMPLATES: BuilderTemplate[] = [
  {
    id: "multiple-choice",
    title: "Multiple choice check",
    type: "quiz",
    prompt: "Ask learners to choose the strongest answer before you reveal the explanation.",
    estimatedMinutes: 4,
    points: 10,
    family: "interactive",
    icon: CircleHelp,
  },
  {
    id: "open-ended",
    title: "Open-ended reflection",
    type: "open_ended",
    prompt: "Collect reasoning in complete sentences so you can surface misconceptions immediately.",
    estimatedMinutes: 5,
    points: 10,
    family: "interactive",
    icon: MessageSquareQuote,
  },
  {
    id: "drawing",
    title: "Draw-it canvas",
    type: "draw",
    prompt: "Let learners sketch a process, diagram, or annotated model directly in the lesson flow.",
    estimatedMinutes: 6,
    points: 15,
    family: "interactive",
    icon: PencilRuler,
  },
  {
    id: "image",
    title: "Image reveal",
    type: "image",
    prompt: "Drop in a visual anchor, hotspot, or diagram reveal to focus discussion.",
    estimatedMinutes: 3,
    points: 0,
    family: "media",
    icon: ImageIcon,
  },
  {
    id: "video",
    title: "Video checkpoint",
    type: "video",
    prompt: "Embed a short clip and pair it with a pause prompt or prediction stop.",
    estimatedMinutes: 4,
    points: 0,
    family: "media",
    icon: PlaySquare,
  },
  {
    id: "document",
    title: "Document annotation",
    type: "document",
    prompt: "Layer a reference article, worksheet, or excerpt with teacher-guided annotation.",
    estimatedMinutes: 5,
    points: 0,
    family: "media",
    icon: FileText,
  },
];

function iconForActivityType(type: string) {
  return (
    BUILDER_TEMPLATES.find((template) => template.type === type)?.icon ??
    (type === "open_ended" ? MessageSquareQuote : type === "draw" ? PencilRuler : CircleHelp)
  );
}

function familyForType(type: string) {
  return BUILDER_TEMPLATES.find((template) => template.type === type)?.family ?? "interactive";
}

function buildBlockFromTemplate(template: BuilderTemplate, lessonId: string) {
  return {
    id: `${template.id}-${crypto.randomUUID()}`,
    lessonId,
    title: template.title,
    type: template.type,
    prompt: template.prompt,
    estimatedMinutes: template.estimatedMinutes,
    points: template.points,
    family: template.family,
    icon: template.icon,
  } satisfies BuilderBlock;
}

export function LessonBuilderStudio({ lesson }: { lesson: Lesson }) {
  const [blocks, setBlocks] = useState<BuilderBlock[]>(
    lesson.activities.map((activity) => ({
      id: activity.id,
      lessonId: activity.lessonId,
      title: activity.title,
      type: activity.type,
      prompt: activity.prompt,
      estimatedMinutes: activity.estimatedMinutes,
      points: activity.points,
      family: familyForType(activity.type),
      icon: iconForActivityType(activity.type),
    })),
  );
  const [dragPayload, setDragPayload] = useState<string | null>(null);

  const mediaBlockCount = useMemo(() => blocks.filter((block) => block.family === "media").length, [blocks]);
  const interactionBlockCount = useMemo(() => blocks.filter((block) => block.family === "interactive").length, [blocks]);

  function insertTemplate(templateId: string, index = blocks.length) {
    const template = BUILDER_TEMPLATES.find((item) => item.id === templateId);
    if (!template) {
      return;
    }

    const nextBlock = buildBlockFromTemplate(template, lesson.id);
    setBlocks((current) => {
      const next = [...current];
      next.splice(index, 0, nextBlock);
      return next;
    });
  }

  function moveBlock(blockId: string, index: number) {
    setBlocks((current) => {
      const currentIndex = current.findIndex((block) => block.id === blockId);
      if (currentIndex === -1) {
        return current;
      }

      const next = [...current];
      const [moved] = next.splice(currentIndex, 1);
      const targetIndex = currentIndex < index ? index - 1 : index;
      next.splice(targetIndex, 0, moved);
      return next;
    });
  }

  function handleDrop(index: number) {
    if (!dragPayload) {
      return;
    }

    const [kind, value] = dragPayload.split(":");
    if (kind === "palette") {
      insertTemplate(value, index);
    }
    if (kind === "canvas") {
      moveBlock(value, index);
    }
    setDragPayload(null);
  }

  return (
    <div className="space-y-6">
      <Card className="overflow-hidden border-slate-200/80 bg-[radial-gradient(circle_at_top_left,rgba(224,242,254,0.95),transparent_32%),linear-gradient(180deg,rgba(255,255,255,0.98),rgba(248,250,252,0.94))]">
        <div className="space-y-6 p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <Badge tone="info">Builder</Badge>
                {lesson.aiAssist ? <Badge tone="success">AI assist enabled</Badge> : null}
              </div>
              <h2 className="mt-3 text-3xl font-semibold text-slate-950">{lesson.title}</h2>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
                Drag response blocks and multimedia elements into the canvas, then reorder steps until the lesson flow
                matches the classroom experience you want.
              </p>
            </div>
            <Button
              className="w-full sm:w-auto"
              icon={<Plus className="size-4" />}
              onClick={() => insertTemplate("multiple-choice")}
              data-testid={createTestId("builder", "add-activity")}
            >
              Add interactive block
            </Button>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {[
              { label: "Lesson steps", value: blocks.length, detail: "reorder at any time" },
              { label: "Interactive blocks", value: interactionBlockCount, detail: "polls, prompts, sketches" },
              { label: "Media elements", value: mediaBlockCount, detail: "image, video, document" },
            ].map((item) => (
              <div key={item.label} className="rounded-[26px] border border-slate-200/70 bg-white/80 px-5 py-4">
                <p className="text-sm text-slate-500">{item.label}</p>
                <p className="mt-2 text-3xl font-semibold text-slate-950">{item.value}</p>
                <p className="mt-2 text-sm text-slate-500">{item.detail}</p>
              </div>
            ))}
          </div>
        </div>
      </Card>

      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <Card className="space-y-5 border-slate-200/90">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-slate-400">Block palette</p>
            <h3 className="mt-2 text-2xl font-semibold text-slate-950">Interactive and media elements</h3>
          </div>
          <div className="grid gap-3">
            {BUILDER_TEMPLATES.map((template) => {
              const Icon = template.icon;

              return (
                <article
                  key={template.id}
                  draggable
                  onDragStart={(event) => {
                    const payload = `palette:${template.id}`;
                    setDragPayload(payload);
                    event.dataTransfer?.setData("text/plain", payload);
                  }}
                  onDragEnd={() => setDragPayload(null)}
                  className="rounded-[26px] border border-slate-200 bg-slate-50 p-4"
                  data-testid={createTestId("builder-palette", template.id)}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex min-w-0 items-start gap-3">
                      <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-white text-slate-700">
                        <Icon className="size-5" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-slate-950">{template.title}</p>
                        <p className="mt-2 text-sm leading-6 text-slate-600">{template.prompt}</p>
                      </div>
                    </div>
                    <Badge tone={template.family === "media" ? "warning" : "info"}>{template.family}</Badge>
                  </div>
                  <div className="mt-4 flex items-center justify-between gap-3">
                    <div className="text-xs uppercase tracking-[0.22em] text-slate-400">
                      {template.estimatedMinutes} min {template.points ? `/ ${template.points} pts` : ""}
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => insertTemplate(template.id)}
                      data-testid={createTestId("builder-palette", "add", template.id)}
                    >
                      Add to canvas
                    </Button>
                  </div>
                </article>
              );
            })}
          </div>
        </Card>

        <Card className="space-y-5 border-slate-200/90">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.28em] text-slate-400">Lesson canvas</p>
              <h3 className="mt-2 text-2xl font-semibold text-slate-950">Drag blocks into teaching order</h3>
            </div>
            <Badge tone="success">{blocks.length} steps</Badge>
          </div>

          <div className="space-y-3">
            {[0, ...blocks.map((_, index) => index + 1)].map((dropIndex) => (
              <div key={`canvas-slot-${dropIndex}`} className="space-y-3">
                <div
                  onDragOver={(event) => event.preventDefault()}
                  onDrop={(event) => {
                    event.preventDefault();
                    handleDrop(dropIndex);
                  }}
                  className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/80 px-4 py-3 text-center text-xs font-semibold uppercase tracking-[0.24em] text-slate-400"
                  data-testid={createTestId("builder-canvas", "dropzone", dropIndex)}
                >
                  Drop block here
                </div>

                {dropIndex < blocks.length ? (
                  <article
                    key={blocks[dropIndex]?.id}
                    draggable
                    onDragStart={(event) => {
                      const payload = `canvas:${blocks[dropIndex]!.id}`;
                      setDragPayload(payload);
                      event.dataTransfer?.setData("text/plain", payload);
                    }}
                    onDragEnd={() => setDragPayload(null)}
                    className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-[0_18px_48px_-34px_rgba(15,23,42,0.35)]"
                    data-testid={createTestId("builder-canvas", "block", blocks[dropIndex]!.id)}
                    aria-label={blocks[dropIndex]!.title}
                  >
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                      <div className="flex min-w-0 items-start gap-3">
                        <div className="grid size-11 shrink-0 place-items-center rounded-2xl bg-slate-100 text-slate-600">
                          <GripVertical className="size-4" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-400">
                            Step {dropIndex + 1}
                          </p>
                          <h4 className="mt-2 text-lg font-semibold text-slate-950">{blocks[dropIndex]!.title}</h4>
                          <p className="mt-2 text-sm leading-6 text-slate-600">{blocks[dropIndex]!.prompt}</p>
                        </div>
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge tone={blocks[dropIndex]!.family === "media" ? "warning" : "info"}>
                          {blocks[dropIndex]!.type}
                        </Badge>
                        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                          {blocks[dropIndex]!.estimatedMinutes} min
                        </span>
                      </div>
                    </div>
                  </article>
                ) : null}
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="rounded-3xl bg-gradient-to-r from-sky-50 to-cyan-50 p-5 text-sm text-slate-700">
        <div className="flex items-center gap-2 font-semibold text-slate-900">
          <Sparkles className="size-4" />
          AI recommendation
        </div>
        Place an image reveal before the multiple-choice check, then follow with a draw-it canvas to move from
        noticing to explanation.
      </div>
    </div>
  );
}
