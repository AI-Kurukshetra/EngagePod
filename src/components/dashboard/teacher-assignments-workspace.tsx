"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Select } from "@/components/ui/select";
import { formatDateLabel } from "@/lib/format";
import { createTestId } from "@/lib/test-id";
import type { AssessmentSummary, Assignment } from "@/types/domain";

type McqOptionKey = "A" | "B" | "C" | "D";

interface CreatedMcq {
  id: string;
  question: string;
  options: Record<McqOptionKey, string>;
  correctOption: McqOptionKey;
  points: number;
}

const optionKeys: McqOptionKey[] = ["A", "B", "C", "D"];

function mapApiMcqItem(row: Record<string, unknown>): CreatedMcq {
  const options = (row.options ?? {}) as Record<string, unknown>;
  const correctOption = String(row.correctOption ?? "A");

  return {
    id: String(row.id ?? `mcq-${Date.now()}`),
    question: String(row.question ?? ""),
    options: {
      A: String(options.A ?? ""),
      B: String(options.B ?? ""),
      C: String(options.C ?? ""),
      D: String(options.D ?? ""),
    },
    correctOption: (optionKeys.includes(correctOption as McqOptionKey) ? correctOption : "A") as McqOptionKey,
    points: Number(row.points ?? 0),
  };
}

export function TeacherAssignmentsWorkspace({
  assessments,
  assignments,
}: {
  assessments: AssessmentSummary[];
  assignments: Assignment[];
}) {
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState<Record<McqOptionKey, string>>({
    A: "",
    B: "",
    C: "",
    D: "",
  });
  const [correctOption, setCorrectOption] = useState<McqOptionKey>("A");
  const [points, setPoints] = useState("5");
  const [createdMcqs, setCreatedMcqs] = useState<CreatedMcq[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loadingMcqs, setLoadingMcqs] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    let isActive = true;

    async function loadAssignmentMcqs() {
      try {
        setLoadingMcqs(true);
        setLoadError(null);

        const response = await fetch("/api/assignment-mcqs", {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });
        const json = await response.json();

        if (!response.ok || !json.ok || !Array.isArray(json.data)) {
          throw new Error(typeof json.error === "string" ? json.error : "Unable to load assignment MCQs.");
        }

        if (!isActive) {
          return;
        }

        setCreatedMcqs(json.data.map((item: Record<string, unknown>) => mapApiMcqItem(item)));
      } catch (loadErrorValue) {
        if (!isActive) {
          return;
        }
        setLoadError(loadErrorValue instanceof Error ? loadErrorValue.message : "Unable to load assignment MCQs.");
      } finally {
        if (isActive) {
          setLoadingMcqs(false);
        }
      }
    }

    void loadAssignmentMcqs();

    return () => {
      isActive = false;
    };
  }, []);

  function handleOptionChange(option: McqOptionKey, value: string) {
    setOptions((current) => ({ ...current, [option]: value }));
  }

  async function handleCreateMcq(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    const trimmedQuestion = question.trim();
    const normalizedOptions = optionKeys.map((option) => options[option].trim());
    const parsedPoints = Number.parseInt(points, 10);

    if (!trimmedQuestion) {
      setError("Question is required.");
      return;
    }

    if (normalizedOptions.some((option) => !option)) {
      setError("All four options are required.");
      return;
    }

    if (new Set(normalizedOptions.map((option) => option.toLowerCase())).size !== optionKeys.length) {
      setError("Options must be unique.");
      return;
    }

    if (!Number.isFinite(parsedPoints) || parsedPoints < 1 || parsedPoints > 100) {
      setError("Points must be between 1 and 100.");
      return;
    }

    try {
      setIsSubmitting(true);

      const response = await fetch("/api/assignment-mcqs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: trimmedQuestion,
          optionA: normalizedOptions[0] ?? "",
          optionB: normalizedOptions[1] ?? "",
          optionC: normalizedOptions[2] ?? "",
          optionD: normalizedOptions[3] ?? "",
          correctOption,
          points: parsedPoints,
        }),
      });
      const json = await response.json();

      if (!response.ok || !json.ok || !json.data) {
        throw new Error(typeof json.error === "string" ? json.error : "Unable to create MCQ.");
      }

      setCreatedMcqs((current) => [mapApiMcqItem(json.data as Record<string, unknown>), ...current]);
      setQuestion("");
      setOptions({ A: "", B: "", C: "", D: "" });
      setCorrectOption("A");
      setPoints("5");
      setSuccess("MCQ created successfully.");
    } catch (createError) {
      setError(createError instanceof Error ? createError.message : "Unable to create MCQ.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="space-y-5">
      <Card className="space-y-5">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-400">Assignments and grading</p>
            <h2 className="mt-2 text-2xl font-semibold text-slate-950">Create MCQ assignments</h2>
          </div>
          <span className="rounded-full bg-slate-100 px-4 py-2 text-xs font-semibold text-slate-700">
            {createdMcqs.length} MCQ{createdMcqs.length === 1 ? "" : "s"} created
          </span>
        </div>
        {loadError ? <p className="text-sm font-medium text-rose-600">{loadError}</p> : null}

        <form className="grid gap-4 rounded-3xl border border-slate-200 p-5" onSubmit={handleCreateMcq}>
          <div>
            <label className="text-sm font-medium text-slate-700" htmlFor="mcq-question">
              MCQ question
            </label>
            <Input
              id="mcq-question"
              value={question}
              onChange={(event) => setQuestion(event.target.value)}
              placeholder="Enter the question prompt"
              data-testid={createTestId("assignments", "mcq", "question")}
            />
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            {optionKeys.map((optionKey) => (
              <div key={optionKey}>
                <label className="text-sm font-medium text-slate-700" htmlFor={`mcq-option-${optionKey}`}>
                  Option {optionKey}
                </label>
                <Input
                  id={`mcq-option-${optionKey}`}
                  value={options[optionKey]}
                  onChange={(event) => handleOptionChange(optionKey, event.target.value)}
                  placeholder={`Option ${optionKey}`}
                  data-testid={createTestId("assignments", "mcq", "option", optionKey)}
                />
              </div>
            ))}
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            <div>
              <label className="text-sm font-medium text-slate-700" htmlFor="mcq-correct-answer">
                Correct answer
              </label>
              <Select
                id="mcq-correct-answer"
                value={correctOption}
                onChange={(event) => setCorrectOption(event.target.value as McqOptionKey)}
                data-testid={createTestId("assignments", "mcq", "correct")}
              >
                {optionKeys.map((optionKey) => (
                  <option key={optionKey} value={optionKey}>
                    {optionKey}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700" htmlFor="mcq-points">
                Points
              </label>
              <Input
                id="mcq-points"
                type="number"
                min={1}
                max={100}
                value={points}
                onChange={(event) => setPoints(event.target.value)}
                data-testid={createTestId("assignments", "mcq", "points")}
              />
            </div>
          </div>
          {error ? <p className="text-sm font-medium text-rose-600">{error}</p> : null}
          {success ? <p className="text-sm font-medium text-emerald-600">{success}</p> : null}
          <div className="flex justify-end">
            <Button type="submit" disabled={isSubmitting} data-testid={createTestId("assignments", "mcq", "create")}>
              {isSubmitting ? "Saving..." : "Add MCQ"}
            </Button>
          </div>
        </form>
      </Card>

      <Card className="space-y-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-400">MCQ bank</p>
          <h3 className="mt-2 text-xl font-semibold text-slate-950">Created multiple-choice questions</h3>
        </div>
        {loadingMcqs ? (
          <p className="text-sm text-slate-500">Loading MCQs...</p>
        ) : createdMcqs.length ? (
          <div className="grid gap-4">
            {createdMcqs.map((mcq) => (
              <div key={mcq.id} className="rounded-3xl border border-slate-200 p-5">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <p className="text-lg font-semibold text-slate-950">{mcq.question}</p>
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                    {mcq.points} pts
                  </span>
                </div>
                <div className="mt-4 grid gap-2">
                  {optionKeys.map((optionKey) => (
                    <p key={optionKey} className="text-sm text-slate-600">
                      {optionKey}. {mcq.options[optionKey]}
                    </p>
                  ))}
                </div>
                <p className="mt-4 text-sm font-semibold text-emerald-700">Correct answer: {mcq.correctOption}</p>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            title="No MCQs created yet"
            description="Create your first multiple-choice question to start building assignment-ready checks for understanding."
          />
        )}
      </Card>

      <Card className="space-y-5">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-400">Assessment overview</p>
          <h2 className="mt-2 text-2xl font-semibold text-slate-950">Submission pipelines and score review</h2>
        </div>
        <div className="grid gap-4">
          {assessments.length ? (
            assessments.map((assessment) => (
              <div key={assessment.id} className="rounded-3xl border border-slate-200 p-5">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <p className="text-lg font-semibold text-slate-950">{assessment.title}</p>
                    <p className="mt-1 text-sm text-slate-500">{assessment.format} assessment</p>
                  </div>
                  <div className="rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700">
                    {assessment.flaggedForReview} flagged for review
                  </div>
                </div>
                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  <div>
                    <p className="text-sm text-slate-500">Average score</p>
                    <p className="text-3xl font-semibold text-slate-950">{assessment.averageScore}%</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">Submission rate</p>
                    <Progress value={assessment.submissionRate} />
                  </div>
                </div>
              </div>
            ))
          ) : (
            <EmptyState
              title="No assessments available"
              description="Assessment summaries will appear here once classroom work starts flowing into the platform."
            />
          )}
        </div>
        <div className="rounded-3xl bg-slate-950 p-5 text-sm text-slate-200">
          {assignments[0]
            ? `Automated reports are scheduled after each due date. Next digest: ${formatDateLabel(assignments[0].dueDate)}.`
            : "Automated reports will start once the first assignment is scheduled."}
        </div>
      </Card>
    </div>
  );
}
