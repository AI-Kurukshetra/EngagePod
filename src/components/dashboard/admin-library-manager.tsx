"use client";

import { useState } from "react";
import { LayoutGrid, PanelTop, PencilLine, Trash2, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { formatDateLabel } from "@/lib/format";
import { createTestId } from "@/lib/test-id";
import type { ContentAsset, LibraryFolder, UserProfile } from "@/types/domain";

async function readFileAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ""));
    reader.onerror = () => reject(new Error("Unable to read the selected file."));
    reader.readAsDataURL(file);
  });
}

type LibraryDialogMode = "create" | "edit";
type LibraryViewMode = "grid" | "table";

export function AdminLibraryManager({
  currentUser,
  initialFolders,
  initialContent,
}: {
  currentUser: UserProfile;
  initialFolders: LibraryFolder[];
  initialContent: ContentAsset[];
}) {
  const [folders, setFolders] = useState(initialFolders);
  const [contentItems, setContentItems] = useState(initialContent);
  const [dialogMode, setDialogMode] = useState<LibraryDialogMode | null>(null);
  const [viewMode, setViewMode] = useState<LibraryViewMode>("grid");
  const [selectedContent, setSelectedContent] = useState<ContentAsset | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ContentAsset | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  function closeModal() {
    setIsModalOpen(false);
    setDialogMode(null);
    setSelectedContent(null);
    setTitle("");
    setDescription("");
    setSelectedFile(null);
    setErrorMessage(null);
  }

  function openCreateModal() {
    setDialogMode("create");
    setSelectedContent(null);
    setTitle("");
    setDescription("");
    setSelectedFile(null);
    setErrorMessage(null);
    setSuccessMessage(null);
    setIsModalOpen(true);
  }

  function openEditModal(item: ContentAsset) {
    setDialogMode("edit");
    setSelectedContent(item);
    setTitle(item.title);
    setDescription(item.description);
    setSelectedFile(null);
    setErrorMessage(null);
    setSuccessMessage(null);
    setIsModalOpen(true);
  }

  async function handleSaveContent() {
    const isCreate = dialogMode === "create";

    if (!title.trim() || !description.trim() || (isCreate && !selectedFile)) {
      setErrorMessage("Name, description, and file are required.");
      return;
    }

    setErrorMessage(null);
    setSuccessMessage(null);
    setIsPending(true);

    try {
      const payload: Record<string, string> = {
        title: title.trim(),
        description: description.trim(),
      };

      if (selectedFile) {
        const fileDataUrl = await readFileAsDataUrl(selectedFile);
        payload.fileName = selectedFile.name;
        payload.fileDataUrl = fileDataUrl;
      }

      if (!isCreate && selectedContent) {
        payload.id = selectedContent.id;
      }

      const response = await fetch("/api/content", {
        method: isCreate ? "POST" : "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const responsePayload = (await response.json()) as {
        ok: boolean;
        data?: Record<string, unknown>;
        error?: string;
      };

      if (!response.ok || !responsePayload.ok || !responsePayload.data) {
        setErrorMessage(responsePayload.error ?? "Unable to create library content.");
        return;
      }

      const newContent: ContentAsset = {
        id: String(responsePayload.data.id),
        folderId: responsePayload.data.folder_id ? String(responsePayload.data.folder_id) : selectedContent?.folderId ?? null,
        folderIds: responsePayload.data.folder_id
          ? Array.from(new Set([String(responsePayload.data.folder_id), ...(selectedContent?.folderIds ?? [])]))
          : [...(selectedContent?.folderIds ?? [])],
        title: String(responsePayload.data.title ?? title.trim()),
        description: String(responsePayload.data.description ?? description.trim()),
        type: "resource",
        subject: String(responsePayload.data.subject ?? "General"),
        gradeBand: String(responsePayload.data.grade_band ?? "All Grades"),
        downloads: Number(responsePayload.data.downloads ?? 0),
        fileName: responsePayload.data.file_name ? String(responsePayload.data.file_name) : selectedFile?.name ?? selectedContent?.fileName ?? null,
        fileUrl: responsePayload.data.file_url ? String(responsePayload.data.file_url) : null,
        createdBy: responsePayload.data.created_by ? String(responsePayload.data.created_by) : selectedContent?.createdBy ?? currentUser.id,
        createdByName: selectedContent?.createdByName ?? currentUser.fullName,
        createdAt: String(responsePayload.data.created_at ?? selectedContent?.createdAt ?? new Date().toISOString()),
      };

      setContentItems((current) =>
        isCreate ? [newContent, ...current] : current.map((item) => (item.id === newContent.id ? newContent : item)),
      );
      setSuccessMessage(isCreate ? "Library content created successfully." : "Library content updated successfully.");
      closeModal();
    } catch {
      setErrorMessage(isCreate ? "Unable to create library content." : "Unable to update library content.");
    } finally {
      setIsPending(false);
    }
  }

  async function handleDeleteContent() {
    if (!deleteTarget) {
      return;
    }

    setErrorMessage(null);
    setSuccessMessage(null);
    setIsPending(true);

    try {
      const response = await fetch(`/api/content?id=${encodeURIComponent(deleteTarget.id)}`, {
        method: "DELETE",
      });
      const payload = (await response.json()) as { ok: boolean; data?: { id: string }; error?: string };

      if (!response.ok || !payload.ok || !payload.data) {
        setErrorMessage(payload.error ?? "Unable to delete library content.");
        return;
      }

      setContentItems((current) => current.filter((item) => item.id !== payload.data?.id));
      setDeleteTarget(null);
      setSuccessMessage("Library content deleted successfully.");
    } catch {
      setErrorMessage("Unable to delete library content.");
    } finally {
      setIsPending(false);
    }
  }

  function getFolderName(folderId: string | null) {
    return folders.find((folder) => folder.id === folderId)?.name ?? "Unassigned";
  }

  return (
    <div className="space-y-6">
      <Card className="space-y-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-400">Library management</p>
            <h2 className="mt-2 text-2xl font-semibold text-slate-950">Create shared library content</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
              Add a library item with a name, description, and uploaded file. Teacher users will keep their existing
              library experience and can browse these shared resources.
            </p>
          </div>
          <div className="flex items-center gap-3 whitespace-nowrap">
            <div className="inline-flex rounded-full border border-slate-200 bg-white p-1">
              <button
                type="button"
                onClick={() => setViewMode("table")}
                className={[
                  "grid size-10 place-items-center rounded-full transition",
                  viewMode === "table" ? "bg-slate-950 text-white" : "text-slate-500 hover:text-slate-900",
                ].join(" ")}
                aria-label="Table view"
                aria-pressed={viewMode === "table"}
                data-testid={createTestId("admin-library", "view-table")}
              >
                <PanelTop className="size-4" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode("grid")}
                className={[
                  "grid size-10 place-items-center rounded-full transition",
                  viewMode === "grid" ? "bg-slate-950 text-white" : "text-slate-500 hover:text-slate-900",
                ].join(" ")}
                aria-label="Grid view"
                aria-pressed={viewMode === "grid"}
                data-testid={createTestId("admin-library", "view-grid")}
              >
                <LayoutGrid className="size-4" />
              </button>
            </div>
            <Button
              type="button"
              onClick={openCreateModal}
              icon={<Upload className="size-4" />}
              className="shrink-0"
              data-testid={createTestId("admin-library", "create")}
            >
              Create new library
            </Button>
          </div>
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

        <div className="grid gap-4">
          {contentItems.length ? (
            viewMode === "grid" ? (
              contentItems.map((item) => (
                <article key={item.id} className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <h3 className="text-lg font-semibold text-slate-950">{item.title}</h3>
                      <p className="mt-2 text-sm leading-6 text-slate-600">{item.description}</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-slate-600">
                        {item.type}
                      </span>
                      <button
                        type="button"
                        onClick={() => openEditModal(item)}
                        className="grid size-10 place-items-center rounded-2xl bg-white text-slate-500 transition hover:bg-sky-50 hover:text-sky-700"
                        aria-label={`Edit ${item.title}`}
                        data-testid={createTestId("admin-library", "edit", item.id)}
                      >
                        <PencilLine className="size-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleteTarget(item)}
                        className="grid size-10 place-items-center rounded-2xl bg-white text-slate-500 transition hover:bg-rose-50 hover:text-rose-700"
                        aria-label={`Delete ${item.title}`}
                        data-testid={createTestId("admin-library", "delete", item.id)}
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2 text-xs font-medium text-slate-500">
                    <span className="rounded-full bg-white px-3 py-1">{getFolderName(item.folderId)}</span>
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
              <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white" data-testid={createTestId("admin-library", "table")}>
                <div className="overflow-x-auto">
                  <table className="min-w-full border-collapse">
                    <thead className="bg-slate-50 text-left">
                      <tr className="text-xs uppercase tracking-[0.18em] text-slate-500">
                        <th className="px-5 py-4 font-semibold">Name</th>
                        <th className="px-5 py-4 font-semibold">File</th>
                        <th className="px-5 py-4 font-semibold">Added</th>
                        <th className="px-5 py-4 font-semibold text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {contentItems.map((item) => (
                        <tr key={item.id} className="border-t border-slate-200 text-sm text-slate-700">
                          <td className="px-5 py-4 align-top">
                            <p className="font-semibold text-slate-950">{item.title}</p>
                          </td>
                          <td className="px-5 py-4 align-top">{item.fileName ?? "No file"}</td>
                          <td className="px-5 py-4 align-top">
                            {item.createdByName ?? "Admin user"}
                            <div className="mt-1 text-xs text-slate-500">{formatDateLabel(item.createdAt)}</div>
                          </td>
                          <td className="px-5 py-4 align-top">
                            <div className="flex justify-end gap-2">
                              <button
                                type="button"
                                onClick={() => openEditModal(item)}
                                className="grid size-10 place-items-center rounded-2xl bg-slate-100 text-slate-500 transition hover:bg-sky-50 hover:text-sky-700"
                                aria-label={`Edit ${item.title}`}
                                data-testid={createTestId("admin-library", "edit", item.id)}
                              >
                                <PencilLine className="size-4" />
                              </button>
                              <button
                                type="button"
                                onClick={() => setDeleteTarget(item)}
                                className="grid size-10 place-items-center rounded-2xl bg-slate-100 text-slate-500 transition hover:bg-rose-50 hover:text-rose-700"
                                aria-label={`Delete ${item.title}`}
                                data-testid={createTestId("admin-library", "delete", item.id)}
                              >
                                <Trash2 className="size-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )
          ) : (
            <EmptyState
              title="No admin library content yet"
              description="Create your first shared resource so teacher users can browse it from the library page."
            />
          )}
        </div>
      </Card>

      <Modal
        open={isModalOpen}
        onClose={closeModal}
        title={dialogMode === "edit" ? "Edit library" : "Create new library"}
        description={
          dialogMode === "edit"
            ? "Update the library name, description, or replace the uploaded file."
            : "Add the library name, description, and file. Teachers can place it into folders later."
        }
        footer={
          <>
            <Button type="button" variant="ghost" onClick={closeModal}>
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleSaveContent}
              disabled={isPending}
              data-testid={createTestId("admin-library", "save")}
            >
              {isPending ? (dialogMode === "edit" ? "Saving..." : "Creating...") : dialogMode === "edit" ? "Save changes" : "Create library"}
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
              data-testid={createTestId("admin-library", "title")}
            />
          </label>
          <label className="block space-y-2">
            <span className="text-sm font-semibold text-slate-700">Description</span>
            <textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Describe what teachers will find in this library item."
              className="min-h-28 w-full rounded-[22px] border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-sky-400 focus:shadow-[0_0_0_4px_rgba(14,165,233,0.12)]"
              data-testid={createTestId("admin-library", "description")}
            />
          </label>
          <label className="block space-y-2">
            <span className="text-sm font-semibold text-slate-700">Upload file</span>
            <input
              type="file"
              onChange={(event) => setSelectedFile(event.target.files?.[0] ?? null)}
              className="block w-full rounded-[22px] border border-dashed border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-700 file:mr-4 file:rounded-full file:border-0 file:bg-slate-950 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white"
              data-testid={createTestId("admin-library", "file")}
            />
            {selectedFile ? <p className="text-xs text-slate-500">{selectedFile.name}</p> : null}
            {!selectedFile && dialogMode === "edit" && selectedContent?.fileName ? (
              <p className="text-xs text-slate-500">Current file: {selectedContent.fileName}</p>
            ) : null}
          </label>
        </div>
      </Modal>

      <Modal
        open={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        title="Delete library"
        description={`Delete "${deleteTarget?.title ?? "this library item"}"? Teachers will no longer be able to browse or download it.`}
        footer={
          <>
            <Button type="button" variant="ghost" onClick={() => setDeleteTarget(null)}>
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleDeleteContent}
              disabled={isPending}
              className="bg-rose-600 hover:bg-rose-700"
              data-testid={createTestId("admin-library", "confirm-delete")}
            >
              {isPending ? "Deleting..." : "Delete library"}
            </Button>
          </>
        }
      >
        <div className="rounded-2xl border border-rose-100 bg-rose-50 px-4 py-4 text-sm leading-6 text-rose-700">
          Delete this library item only when it should no longer appear for teacher users.
        </div>
      </Modal>
    </div>
  );
}
