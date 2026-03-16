"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { formatDateLabel } from "@/lib/format";
import { createTestId } from "@/lib/test-id";
import type { Assignment } from "@/types/domain";

type McqOptionKey = "A" | "B" | "C" | "D";

interface AssignmentMcqItem {
  id: string;
  question: string;
  options: Record<McqOptionKey, string>;
  points: number;
}

interface AssignmentMcqAttemptItem {
  id: string;
  mcqId: string;
  selectedOption: McqOptionKey;
  isCorrect: boolean;
  pointsEarned: number;
}

function mapMcq(row: Record<string, unknown>): AssignmentMcqItem {
  const options = (row.options ?? {}) as Record<string, unknown>;
  return {
    id: String(row.id ?? ""),
    question: String(row.question ?? ""),
    options: {
      A: String(options.A ?? ""),
      B: String(options.B ?? ""),
      C: String(options.C ?? ""),
      D: String(options.D ?? ""),
    },
    points: Number(row.points ?? 0),
  };
}

function mapAttempt(row: Record<string, unknown>): AssignmentMcqAttemptItem {
  const selectedOption = String(row.selectedOption ?? "A");
  return {
    id: String(row.id ?? ""),
    mcqId: String(row.mcqId ?? ""),
    selectedOption: (["A", "B", "C", "D"].includes(selectedOption) ? selectedOption : "A") as McqOptionKey,
    isCorrect: Boolean(row.isCorrect),
    pointsEarned: Number(row.pointsEarned ?? 0),
  };
}

export function StudentAssignmentsWorkspace({ assignments }: { assignments: Assignment[] }) {
  const [mcqs, setMcqs] = useState<AssignmentMcqItem[]>([]);
  const [attempts, setAttempts] = useState<Record<string, AssignmentMcqAttemptItem>>({});
  const [selectedOptions, setSelectedOptions] = useState<Record<string, McqOptionKey>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [submittingMcqId, setSubmittingMcqId] = useState<string | null>(null);

  useEffect(() => {
    let isActive = true;

    async function loadAssignmentData() {
      try {
        setLoading(true);
        setError(null);

        const [mcqResponse, attemptsResponse] = await Promise.all([
          fetch("/api/assignment-mcqs", {
            method: "GET",
            headers: { "Content-Type": "application/json" },
          }),
          fetch("/api/assignment-mcq-attempts", {
            method: "GET",
            headers: { "Content-Type": "application/json" },
          }),
        ]);

        const mcqJson = await mcqResponse.json();
        const attemptsJson = await attemptsResponse.json();

        if (!mcqResponse.ok || !mcqJson.ok || !Array.isArray(mcqJson.data)) {
          throw new Error(typeof mcqJson.error === "string" ? mcqJson.error : "Unable to load assignment MCQs.");
        }

        if (!attemptsResponse.ok || !attemptsJson.ok || !Array.isArray(attemptsJson.data)) {
          throw new Error(
            typeof attemptsJson.error === "string" ? attemptsJson.error : "Unable to load your assignment attempts.",
          );
        }

        if (!isActive) {
          return;
        }

        const mappedMcqs: AssignmentMcqItem[] = (mcqJson.data as Record<string, unknown>[]).map((row) => mapMcq(row));
        const mappedAttempts: AssignmentMcqAttemptItem[] = (attemptsJson.data as Record<string, unknown>[]).map((row) =>
          mapAttempt(row),
        );
        const attemptsByMcq: Record<string, AssignmentMcqAttemptItem> = {};
        mappedAttempts.forEach((attempt) => {
          attemptsByMcq[attempt.mcqId] = attempt;
        });

        setMcqs(mappedMcqs);
        setAttempts(attemptsByMcq);
      } catch (loadError) {
        if (!isActive) {
          return;
        }
        setError(loadError instanceof Error ? loadError.message : "Unable to load assignment data.");
      } finally {
        if (isActive) {
          setLoading(false);
        }
      }
    }

    void loadAssignmentData();

    return () => {
      isActive = false;
    };
  }, []);

  const totalPointsEarned = useMemo(
    () => Object.values(attempts).reduce((sum, attempt) => sum + attempt.pointsEarned, 0),
    [attempts],
  );

  async function submitAttempt(mcqId: string) {
    const selectedOption = selectedOptions[mcqId];
    if (!selectedOption) {
      setSubmitError("Select an option before submitting.");
      setSuccess(null);
      return;
    }

    try {
      setSubmittingMcqId(mcqId);
      setSubmitError(null);
      setSuccess(null);

      const response = await fetch("/api/assignment-mcq-attempts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mcqId,
          selectedOption,
        }),
      });
      const json = await response.json();

      if (!response.ok || !json.ok || !json.data) {
        throw new Error(typeof json.error === "string" ? json.error : "Unable to submit assignment attempt.");
      }

      const mappedAttempt = mapAttempt(json.data as Record<string, unknown>);
      setAttempts((current) => ({
        ...current,
        [mappedAttempt.mcqId]: mappedAttempt,
      }));
      setSuccess("Assignment response submitted.");
    } catch (submitAttemptError) {
      setSubmitError(submitAttemptError instanceof Error ? submitAttemptError.message : "Unable to submit assignment.");
    } finally {
      setSubmittingMcqId(null);
    }
  }

  return (
    <div className="space-y-5">
      <Card className="space-y-3">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-400">Assignments</p>
        <h2 className="text-2xl font-semibold text-slate-950">Attend MCQ assignments</h2>
        <p className="text-sm text-slate-600">
          Attempted {Object.keys(attempts).length}/{mcqs.length || 0} MCQs | Points earned: {totalPointsEarned}
        </p>
      </Card>

      <Card className="space-y-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-400">Your assignment queue</p>
          <h3 className="mt-2 text-xl font-semibold text-slate-950">Due-date tracking</h3>
        </div>
        {assignments.length ? (
          <div className="grid gap-3">
            {assignments.map((assignment) => (
              <div key={assignment.id} className="rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-700">
                {assignment.title} | Due {formatDateLabel(assignment.dueDate)}
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            title="No assignments available"
            description="Your assignment list will appear after teachers publish and schedule classroom work."
          />
        )}
      </Card>

      <Card className="space-y-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-400">MCQ assignment bank</p>
          <h3 className="mt-2 text-xl font-semibold text-slate-950">Submit your responses</h3>
        </div>
        {error ? <p className="text-sm font-medium text-rose-600">{error}</p> : null}
        {submitError ? <p className="text-sm font-medium text-rose-600">{submitError}</p> : null}
        {success ? <p className="text-sm font-medium text-emerald-600">{success}</p> : null}
        {loading ? (
          <p className="text-sm text-slate-500">Loading MCQ assignments...</p>
        ) : mcqs.length ? (
          <div className="grid gap-4">
            {mcqs.map((mcq) => {
              const attempt = attempts[mcq.id];
              return (
                <div key={mcq.id} className="rounded-3xl border border-slate-200 p-5">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <p className="text-lg font-semibold text-slate-950">{mcq.question}</p>
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                      {mcq.points} pts
                    </span>
                  </div>

                  <div className="mt-4 grid gap-2">
                    {(["A", "B", "C", "D"] as McqOptionKey[]).map((optionKey) => {
                      const isSelected = selectedOptions[mcq.id] === optionKey;
                      return (
                        <button
                          key={optionKey}
                          type="button"
                          onClick={() =>
                            setSelectedOptions((current) => ({
                              ...current,
                              [mcq.id]: optionKey,
                            }))
                          }
                          className={`rounded-2xl border px-3 py-2 text-left text-sm transition ${
                            isSelected
                              ? "border-sky-500 bg-sky-50 text-slate-900"
                              : "border-slate-200 bg-white text-slate-700 hover:border-sky-300 hover:bg-sky-50/50"
                          }`}
                          data-testid={createTestId("student-assignments", "option", mcq.id, optionKey)}
                        >
                          {optionKey}. {mcq.options[optionKey]}
                        </button>
                      );
                    })}
                  </div>

                  <div className="mt-4 flex flex-wrap items-center gap-3">
                    <Button
                      type="button"
                      disabled={submittingMcqId === mcq.id}
                      onClick={() => void submitAttempt(mcq.id)}
                      data-testid={createTestId("student-assignments", "submit", mcq.id)}
                    >
                      {submittingMcqId === mcq.id ? "Submitting..." : "Submit answer"}
                    </Button>
                    {attempt ? (
                      <p className={`text-sm font-semibold ${attempt.isCorrect ? "text-emerald-700" : "text-amber-700"}`}>
                        {attempt.isCorrect ? "Correct" : "Incorrect"} | Selected {attempt.selectedOption} | Score{" "}
                        {attempt.pointsEarned}
                      </p>
                    ) : null}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <EmptyState
            title="No MCQ assignments available"
            description="MCQ assignments will appear here after your teacher publishes them."
          />
        )}
      </Card>
    </div>
  );
}
