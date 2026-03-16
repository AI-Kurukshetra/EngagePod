"use client";

import { useMemo, useState } from "react";
import { FilePlus2, ShieldCheck, Upload, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { formatDateLabel } from "@/lib/format";
import { createTestId } from "@/lib/test-id";
import type { ContentAsset, DashboardSnapshot, UserProfile } from "@/types/domain";

function teachers(users: UserProfile[]) {
  return users.filter((user) => user.role === "teacher");
}

function parents(users: UserProfile[]) {
  return users.filter((user) => user.role === "parent");
}

async function readFileAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ""));
    reader.onerror = () => reject(new Error("Unable to read the selected file."));
    reader.readAsDataURL(file);
  });
}

export function AdminPanel({ snapshot }: { snapshot: DashboardSnapshot }) {
  const school = snapshot.schools[0];
  const teacherUsers = useMemo(() => teachers(snapshot.schoolUsers), [snapshot.schoolUsers]);
  const parentUsers = useMemo(() => parents(snapshot.schoolUsers), [snapshot.schoolUsers]);
  const [contentItems, setContentItems] = useState(snapshot.content);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  function closeModal() {
    setIsModalOpen(false);
    setTitle("");
    setDescription("");
    setSelectedFile(null);
    setErrorMessage(null);
  }

  async function handleCreateContent() {
    if (!title.trim() || !description.trim() || !selectedFile) {
      setErrorMessage("Name, description, and file are required.");
      return;
    }

    setErrorMessage(null);
    setSuccessMessage(null);
    setIsPending(true);

    try {
      const fileDataUrl = await readFileAsDataUrl(selectedFile);
      const response = await fetch("/api/content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim(),
          fileName: selectedFile.name,
          fileDataUrl,
        }),
      });

      const payload = (await response.json()) as {
        ok: boolean;
        data?: Record<string, unknown>;
        error?: string;
      };

      if (!response.ok || !payload.ok || !payload.data) {
        setErrorMessage(payload.error ?? "Unable to create library content.");
        return;
      }

      const newContent: ContentAsset = {
        id: String(payload.data.id),
        folderId: payload.data.folder_id ? String(payload.data.folder_id) : null,
        folderIds: payload.data.folder_id ? [String(payload.data.folder_id)] : [],
        title: String(payload.data.title ?? title.trim()),
        description: String(payload.data.description ?? description.trim()),
        type: "resource",
        subject: String(payload.data.subject ?? "General"),
        gradeBand: String(payload.data.grade_band ?? "All Grades"),
        downloads: Number(payload.data.downloads ?? 0),
        fileName: payload.data.file_name ? String(payload.data.file_name) : selectedFile.name,
        fileUrl: payload.data.file_url ? String(payload.data.file_url) : null,
        createdBy: payload.data.created_by ? String(payload.data.created_by) : snapshot.currentUser?.id ?? null,
        createdByName: snapshot.currentUser?.fullName ?? "Admin user",
        createdAt: String(payload.data.created_at ?? new Date().toISOString()),
      };

      setContentItems((current) => [newContent, ...current]);
      setSuccessMessage("Library content created successfully.");
      closeModal();
    } catch {
      setErrorMessage("Unable to create library content.");
    } finally {
      setIsPending(false);
    }
  }

  if (snapshot.currentUser?.role !== "admin") {
    return (
      <Card>
        <EmptyState
          title="Admin access required"
          description="This workspace view is reserved for admin users who manage staff, families, and shared library content."
        />
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card className="space-y-3">
          <div className="flex size-12 items-center justify-center rounded-2xl bg-sky-50 text-sky-700">
            <Users className="size-5" />
          </div>
          <p className="text-sm text-slate-500">Active students</p>
          <p className="text-3xl font-semibold text-slate-950">{school?.activeStudents ?? 0}</p>
        </Card>
        <Card className="space-y-3">
          <div className="flex size-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
            <ShieldCheck className="size-5" />
          </div>
          <p className="text-sm text-slate-500">Teachers</p>
          <p className="text-3xl font-semibold text-slate-950">{teacherUsers.length}</p>
        </Card>
        <Card className="space-y-3">
          <div className="flex size-12 items-center justify-center rounded-2xl bg-amber-50 text-amber-700">
            <Users className="size-5" />
          </div>
          <p className="text-sm text-slate-500">Parents</p>
          <p className="text-3xl font-semibold text-slate-950">{parentUsers.length}</p>
        </Card>
        <Card className="space-y-3">
          <div className="flex size-12 items-center justify-center rounded-2xl bg-rose-50 text-rose-700">
            <FilePlus2 className="size-5" />
          </div>
          <p className="text-sm text-slate-500">Library content</p>
          <p className="text-3xl font-semibold text-slate-950">{contentItems.length}</p>
        </Card>
      </div>

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

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <Card className="space-y-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-400">Library management</p>
              <h2 className="mt-2 text-2xl font-semibold text-slate-950">Create shared content for teachers</h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
                Upload resource files once and make them available to teacher users inside the library experience.
              </p>
            </div>
            <Button
              type="button"
              onClick={() => {
                setErrorMessage(null);
                setIsModalOpen(true);
              }}
              icon={<Upload className="size-4" />}
              data-testid={createTestId("admin-content", "create")}
            >
              Create library content
            </Button>
          </div>

          <div className="grid gap-4">
            {contentItems.length ? (
              contentItems.map((item) => (
                <article key={item.id} className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <h3 className="text-lg font-semibold text-slate-950">{item.title}</h3>
                      <p className="mt-2 text-sm leading-6 text-slate-600">{item.description}</p>
                    </div>
                    <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-slate-600">
                      {item.type}
                    </span>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2 text-xs font-medium text-slate-500">
                    <span className="rounded-full bg-white px-3 py-1">{item.subject}</span>
                    <span className="rounded-full bg-white px-3 py-1">{item.gradeBand}</span>
                    {item.fileName ? <span className="rounded-full bg-white px-3 py-1">{item.fileName}</span> : null}
                  </div>
                  <p className="mt-4 text-xs uppercase tracking-[0.2em] text-slate-400">
                    Added by {item.createdByName ?? "Admin user"} on {formatDateLabel(item.createdAt)}
                  </p>
                </article>
              ))
            ) : (
              <EmptyState
                title="No admin library content yet"
                description="Create your first shared resource so teacher users can browse it from the library page."
              />
            )}
          </div>
        </Card>

        <div className="grid gap-6">
          <Card className="space-y-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-400">Teacher list</p>
              <h2 className="mt-2 text-2xl font-semibold text-slate-950">Teachers in this workspace</h2>
            </div>
            <div className="space-y-3">
              {teacherUsers.length ? (
                teacherUsers.map((teacher) => (
                  <div key={teacher.id} className="rounded-3xl border border-slate-200 p-4">
                    <p className="font-semibold text-slate-950">{teacher.fullName}</p>
                    <p className="mt-1 text-sm text-slate-500">{teacher.email}</p>
                  </div>
                ))
              ) : (
                <EmptyState
                  title="No teachers found"
                  description="Teacher accounts will appear here once they are linked to this workspace."
                />
              )}
            </div>
          </Card>

          <Card className="space-y-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-400">Parent list</p>
              <h2 className="mt-2 text-2xl font-semibold text-slate-950">Parents in this workspace</h2>
            </div>
            <div className="space-y-3">
              {parentUsers.length ? (
                parentUsers.map((parent) => (
                  <div key={parent.id} className="rounded-3xl border border-slate-200 p-4">
                    <p className="font-semibold text-slate-950">{parent.fullName}</p>
                    <p className="mt-1 text-sm text-slate-500">{parent.email}</p>
                  </div>
                ))
              ) : (
                <EmptyState
                  title="No parents found"
                  description="Parent accounts will appear here once family users are linked to this workspace."
                />
              )}
            </div>
          </Card>
        </div>
      </div>

      <Modal
        open={isModalOpen}
        onClose={closeModal}
        title="Create library content"
        description="This content will be visible to teacher users in the library module. Teachers can place it into folders later."
        footer={
          <>
            <Button type="button" variant="ghost" onClick={closeModal}>
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleCreateContent}
              disabled={isPending}
              data-testid={createTestId("admin-content", "save")}
            >
              {isPending ? "Creating..." : "Create content"}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <label className="block space-y-2">
            <span className="text-sm font-semibold text-slate-700">Name</span>
            <Input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Example: Grade 6 science toolkit"
              data-testid={createTestId("admin-content", "title")}
            />
          </label>
          <label className="block space-y-2">
            <span className="text-sm font-semibold text-slate-700">Description</span>
            <textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Describe what teachers will find in this resource."
              className="min-h-28 w-full rounded-[22px] border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-sky-400 focus:shadow-[0_0_0_4px_rgba(14,165,233,0.12)]"
              data-testid={createTestId("admin-content", "description")}
            />
          </label>
          <label className="block space-y-2">
            <span className="text-sm font-semibold text-slate-700">Upload file</span>
            <input
              type="file"
              onChange={(event) => setSelectedFile(event.target.files?.[0] ?? null)}
              className="block w-full rounded-[22px] border border-dashed border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-700 file:mr-4 file:rounded-full file:border-0 file:bg-slate-950 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white"
              data-testid={createTestId("admin-content", "file")}
            />
            {selectedFile ? <p className="text-xs text-slate-500">{selectedFile.name}</p> : null}
          </label>
        </div>
      </Modal>
    </div>
  );
}
