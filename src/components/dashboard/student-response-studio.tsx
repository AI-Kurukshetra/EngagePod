"use client";

import { useMemo, useState } from "react";
import { CheckCircle2, MessageSquare, PencilRuler, Send, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { createTestId } from "@/lib/test-id";
import type { DashboardSnapshot, LiveSession } from "@/types/domain";

type ResponseType = "multiple_choice" | "open_ended" | "drawing";

type SubmittedResponse = {
  id: string;
  studentName: string;
  activityId: string;
  responseType: ResponseType;
  responseValue: string;
  submittedAt: string;
};

const MULTIPLE_CHOICE_OPTIONS = [
  "Warm, humid air",
  "Cold mountain winds",
  "Ocean tides only",
  "Moonlight reflected in clouds",
];

const DRAWING_GRID_SIZE = 8;
const EMPTY_DRAWING = Array.from({ length: DRAWING_GRID_SIZE * DRAWING_GRID_SIZE }, () => false);

function drawingToString(cells: boolean[]) {
  return cells.map((cell) => (cell ? "1" : "0")).join("");
}

function drawingFromString(value: string) {
  return value
    .split("")
    .slice(0, DRAWING_GRID_SIZE * DRAWING_GRID_SIZE)
    .map((character) => character === "1");
}

function buildStudentId(studentName: string, responseType: ResponseType) {
  const normalized = studentName.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  return `${responseType}-${normalized || "student"}`;
}

function formatSubmittedAt(value: string) {
  return new Date(value).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
}

function DrawingPreview({ value }: { value: string }) {
  const cells = drawingFromString(value);

  return (
    <div className="grid grid-cols-8 gap-1 rounded-2xl bg-slate-100 p-2">
      {cells.map((cell, index) => (
        <div
          key={`${value}-${index}`}
          className={cell ? "size-3 rounded-[4px] bg-sky-500" : "size-3 rounded-[4px] bg-white"}
        />
      ))}
    </div>
  );
}

export function StudentResponseStudio({
  snapshot,
  session,
}: {
  snapshot: DashboardSnapshot;
  session: LiveSession | null;
}) {
  const lesson = snapshot.lessons.find((item) => item.id === session?.lessonId) ?? snapshot.lessons[0] ?? null;
  const [selectedChoice, setSelectedChoice] = useState(MULTIPLE_CHOICE_OPTIONS[0] ?? "");
  const [multipleChoiceStudent, setMultipleChoiceStudent] = useState("");
  const [openEndedStudent, setOpenEndedStudent] = useState("");
  const [openEndedResponse, setOpenEndedResponse] = useState("");
  const [drawingStudent, setDrawingStudent] = useState("");
  const [drawingCells, setDrawingCells] = useState(EMPTY_DRAWING);
  const [submissions, setSubmissions] = useState<SubmittedResponse[]>([]);
  const [pendingType, setPendingType] = useState<ResponseType | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const multipleChoiceResponses = useMemo(
    () => submissions.filter((submission) => submission.responseType === "multiple_choice"),
    [submissions],
  );
  const openEndedResponses = useMemo(
    () => submissions.filter((submission) => submission.responseType === "open_ended"),
    [submissions],
  );
  const drawingResponses = useMemo(
    () => submissions.filter((submission) => submission.responseType === "drawing"),
    [submissions],
  );
  const responseRate = session ? Math.min(100, Math.round((submissions.length / Math.max(session.attendeeCount, 1)) * 100)) : 0;
  const uniqueResponders = new Set(submissions.map((submission) => submission.studentName.toLowerCase())).size;

  const multipleChoiceBreakdown = MULTIPLE_CHOICE_OPTIONS.map((option) => {
    const count = multipleChoiceResponses.filter((submission) => submission.responseValue === option).length;
    const percentage = multipleChoiceResponses.length ? Math.round((count / multipleChoiceResponses.length) * 100) : 0;
    return { option, count, percentage };
  });

  async function submitResponse(input: {
    responseType: ResponseType;
    studentName: string;
    responseValue: string;
    activityId: string;
  }) {
    if (!input.studentName.trim() || !input.responseValue.trim()) {
      setErrorMessage("Student name and response are required.");
      return;
    }

    setPendingType(input.responseType);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const response = await fetch("/api/responses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          activityId: input.activityId,
          studentId: buildStudentId(input.studentName, input.responseType),
          responseType: input.responseType,
          responseValue: input.responseValue,
        }),
      });
      const payload = (await response.json()) as {
        ok: boolean;
        data?: { responseId: string };
        error?: string;
      };

      if (!response.ok || !payload.ok || !payload.data) {
        setErrorMessage(payload.error ?? "Unable to collect the response right now.");
        return;
      }

      const submission: SubmittedResponse = {
        id: String(payload.data.responseId),
        studentName: input.studentName.trim(),
        activityId: input.activityId,
        responseType: input.responseType,
        responseValue: input.responseValue,
        submittedAt: new Date().toISOString(),
      };

      setSubmissions((current) => [submission, ...current]);
      setSuccessMessage("Response collected in real time.");

      if (input.responseType === "multiple_choice") {
        setMultipleChoiceStudent("");
      }
      if (input.responseType === "open_ended") {
        setOpenEndedStudent("");
        setOpenEndedResponse("");
      }
      if (input.responseType === "drawing") {
        setDrawingStudent("");
        setDrawingCells([...EMPTY_DRAWING]);
      }
    } catch {
      setErrorMessage("Unable to collect the response right now.");
    } finally {
      setPendingType(null);
    }
  }

  if (!session || !lesson) {
    return (
      <EmptyState
        title="No live response session is active"
        description="Launch a live lesson first to collect multiple-choice, open-ended, and drawing responses."
      />
    );
  }

  return (
    <div className="space-y-6">
      <Card className="overflow-hidden border-slate-200/80 bg-[radial-gradient(circle_at_top_left,rgba(186,230,253,0.85),transparent_32%),linear-gradient(135deg,rgba(15,23,42,1),rgba(30,41,59,0.96))] text-white">
        <div className="space-y-6 p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.32em] text-sky-200">Student Response</p>
              <h1 className="mt-2 text-3xl font-semibold">{session.title}</h1>
              <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-300">
                Collect multiple-choice, open-ended, and drawing responses while the lesson is live. Results update
                instantly so you can adjust pacing before misconceptions spread.
              </p>
            </div>
            <div className="rounded-[28px] border border-white/10 bg-white/8 px-5 py-4 text-sm text-slate-200">
              <p className="font-semibold text-white">{lesson.title}</p>
              <p className="mt-1">{lesson.subject}</p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {[
              { label: "Attendees", value: session.attendeeCount, detail: "learners connected" },
              { label: "Responses", value: submissions.length, detail: `${uniqueResponders} unique responders` },
              { label: "Live response rate", value: `${responseRate}%`, detail: "updates with each submission" },
            ].map((item) => (
              <div key={item.label} className="rounded-[28px] border border-white/10 bg-white/8 px-5 py-4">
                <p className="text-sm text-slate-300">{item.label}</p>
                <p className="mt-3 text-3xl font-semibold text-white">{item.value}</p>
                <p className="mt-2 text-sm text-slate-300">{item.detail}</p>
              </div>
            ))}
          </div>
        </div>
      </Card>

      {successMessage ? (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
          {successMessage}
        </div>
      ) : null}
      {errorMessage ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
          {errorMessage}
        </div>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <div className="space-y-6">
          <Card className="space-y-5 border-slate-200/90">
            <div className="flex items-start gap-3">
              <div className="flex size-12 items-center justify-center rounded-2xl bg-sky-50 text-sky-700">
                <CheckCircle2 className="size-5" />
              </div>
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-400">Multiple choice</p>
                <h2 className="mt-1 text-xl font-semibold text-slate-950">Confidence-check poll</h2>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Which condition most directly supports thunderstorm formation?
                </p>
              </div>
            </div>
            <div className="space-y-4">
              <label className="block space-y-2">
                <span className="text-sm font-semibold text-slate-700">Student name</span>
                <Input
                  value={multipleChoiceStudent}
                  onChange={(event) => setMultipleChoiceStudent(event.target.value)}
                  placeholder="Example: Maya Chen"
                  data-testid={createTestId("responses", "mc-student")}
                />
              </label>
              <div className="grid gap-3">
                {MULTIPLE_CHOICE_OPTIONS.map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => setSelectedChoice(option)}
                    className={[
                      "rounded-2xl border px-4 py-3 text-left text-sm font-medium transition",
                      selectedChoice === option
                        ? "border-sky-300 bg-sky-50 text-sky-900"
                        : "border-slate-200 bg-white text-slate-700 hover:border-slate-300",
                    ].join(" ")}
                    data-testid={createTestId("responses", "mc-option", option)}
                  >
                    {option}
                  </button>
                ))}
              </div>
              <Button
                type="button"
                onClick={() =>
                  submitResponse({
                    responseType: "multiple_choice",
                    studentName: multipleChoiceStudent,
                    responseValue: selectedChoice,
                    activityId: `${lesson.id}-multiple-choice`,
                  })
                }
                icon={<Send className="size-4" />}
                disabled={pendingType === "multiple_choice"}
                data-testid={createTestId("responses", "mc-submit")}
              >
                {pendingType === "multiple_choice" ? "Collecting..." : "Collect multiple-choice response"}
              </Button>
            </div>
          </Card>

          <Card className="space-y-5 border-slate-200/90">
            <div className="flex items-start gap-3">
              <div className="flex size-12 items-center justify-center rounded-2xl bg-amber-50 text-amber-700">
                <MessageSquare className="size-5" />
              </div>
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-400">Open-ended</p>
                <h2 className="mt-1 text-xl font-semibold text-slate-950">Reasoning check</h2>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Explain how warm and cool air interact before a storm begins.
                </p>
              </div>
            </div>
            <div className="space-y-4">
              <label className="block space-y-2">
                <span className="text-sm font-semibold text-slate-700">Student name</span>
                <Input
                  value={openEndedStudent}
                  onChange={(event) => setOpenEndedStudent(event.target.value)}
                  placeholder="Example: Jordan Lee"
                  data-testid={createTestId("responses", "oe-student")}
                />
              </label>
              <label className="block space-y-2">
                <span className="text-sm font-semibold text-slate-700">Student response</span>
                <textarea
                  value={openEndedResponse}
                  onChange={(event) => setOpenEndedResponse(event.target.value)}
                  placeholder="Students can describe their thinking here."
                  className="min-h-28 w-full rounded-[22px] border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-sky-400 focus:shadow-[0_0_0_4px_rgba(14,165,233,0.12)]"
                  data-testid={createTestId("responses", "oe-input")}
                />
              </label>
              <Button
                type="button"
                onClick={() =>
                  submitResponse({
                    responseType: "open_ended",
                    studentName: openEndedStudent,
                    responseValue: openEndedResponse,
                    activityId: `${lesson.id}-open-ended`,
                  })
                }
                icon={<Send className="size-4" />}
                disabled={pendingType === "open_ended"}
                data-testid={createTestId("responses", "oe-submit")}
              >
                {pendingType === "open_ended" ? "Collecting..." : "Collect open-ended response"}
              </Button>
            </div>
          </Card>

          <Card className="space-y-5 border-slate-200/90">
            <div className="flex items-start gap-3">
              <div className="flex size-12 items-center justify-center rounded-2xl bg-violet-50 text-violet-700">
                <PencilRuler className="size-5" />
              </div>
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-400">Drawing</p>
                <h2 className="mt-1 text-xl font-semibold text-slate-950">Sketch response</h2>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Ask learners to sketch where condensation happens in the water cycle.
                </p>
              </div>
            </div>
            <div className="space-y-4">
              <label className="block space-y-2">
                <span className="text-sm font-semibold text-slate-700">Student name</span>
                <Input
                  value={drawingStudent}
                  onChange={(event) => setDrawingStudent(event.target.value)}
                  placeholder="Example: Sofia Patel"
                  data-testid={createTestId("responses", "draw-student")}
                />
              </label>
              <div className="space-y-3">
                <div className="grid grid-cols-8 gap-1 rounded-[28px] border border-slate-200 bg-slate-50 p-3">
                  {drawingCells.map((cell, index) => (
                    <button
                      key={`draw-cell-${index}`}
                      type="button"
                      onClick={() =>
                        setDrawingCells((current) => current.map((value, cellIndex) => (cellIndex === index ? !value : value)))
                      }
                      className={cell ? "aspect-square rounded-[6px] bg-sky-500" : "aspect-square rounded-[6px] bg-white"}
                      aria-label={`Toggle drawing cell ${index + 1}`}
                      data-testid={createTestId("responses", "draw-cell", String(index))}
                    />
                  ))}
                </div>
                <div className="flex justify-end">
                  <Button type="button" variant="ghost" onClick={() => setDrawingCells([...EMPTY_DRAWING])}>
                    Clear drawing
                  </Button>
                </div>
              </div>
              <Button
                type="button"
                onClick={() =>
                  submitResponse({
                    responseType: "drawing",
                    studentName: drawingStudent,
                    responseValue: drawingToString(drawingCells),
                    activityId: `${lesson.id}-drawing`,
                  })
                }
                icon={<Send className="size-4" />}
                disabled={pendingType === "drawing"}
                data-testid={createTestId("responses", "draw-submit")}
              >
                {pendingType === "drawing" ? "Collecting..." : "Collect drawing response"}
              </Button>
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="space-y-5 border-slate-200/90">
            <div className="flex items-start gap-3">
              <div className="flex size-12 items-center justify-center rounded-2xl bg-sky-50 text-sky-700">
                <Sparkles className="size-5" />
              </div>
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-400">Real-time results</p>
                <h2 className="mt-1 text-xl font-semibold text-slate-950">Multiple-choice breakdown</h2>
              </div>
            </div>
            {multipleChoiceResponses.length ? (
              <div className="space-y-4">
                {multipleChoiceBreakdown.map((option) => (
                  <div key={option.option} className="space-y-2">
                    <div className="flex items-center justify-between gap-3 text-sm font-medium text-slate-700">
                      <span>{option.option}</span>
                      <span>
                        {option.count} response{option.count === 1 ? "" : "s"} / {option.percentage}%
                      </span>
                    </div>
                    <Progress value={option.percentage} color="#0ea5e9" />
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState
                title="No poll responses yet"
                description="Multiple-choice selections will appear here as soon as students submit them."
              />
            )}
          </Card>

          <Card className="space-y-5 border-slate-200/90">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-400">Open-ended results</p>
              <h2 className="mt-1 text-xl font-semibold text-slate-950">Live written reasoning</h2>
            </div>
            {openEndedResponses.length ? (
              <div className="space-y-3">
                {openEndedResponses.map((submission) => (
                  <div key={submission.id} className="rounded-[24px] border border-slate-200 bg-slate-50 px-4 py-4">
                    <div className="flex items-center justify-between gap-3">
                      <p className="font-semibold text-slate-950">{submission.studentName}</p>
                      <span className="text-xs uppercase tracking-[0.22em] text-slate-400">
                        {formatSubmittedAt(submission.submittedAt)}
                      </span>
                    </div>
                    <p className="mt-3 text-sm leading-6 text-slate-700">{submission.responseValue}</p>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState
                title="No written responses yet"
                description="Open-ended responses will stream into this panel when learners submit them."
              />
            )}
          </Card>

          <Card className="space-y-5 border-slate-200/90">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-400">Drawing results</p>
              <h2 className="mt-1 text-xl font-semibold text-slate-950">Sketch gallery</h2>
            </div>
            {drawingResponses.length ? (
              <div className="grid gap-4 sm:grid-cols-2">
                {drawingResponses.map((submission) => (
                  <div key={submission.id} className="rounded-[24px] border border-slate-200 bg-slate-50 px-4 py-4">
                    <div className="flex items-center justify-between gap-3">
                      <p className="font-semibold text-slate-950">{submission.studentName}</p>
                      <span className="text-xs uppercase tracking-[0.22em] text-slate-400">
                        {formatSubmittedAt(submission.submittedAt)}
                      </span>
                    </div>
                    <div className="mt-4">
                      <DrawingPreview value={submission.responseValue} />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState
                title="No sketches yet"
                description="Drawing submissions will appear here in real time as learners sketch their ideas."
              />
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
