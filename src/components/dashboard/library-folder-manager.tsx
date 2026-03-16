"use client";

import { useState } from "react";
import { Folder, FolderEdit, FolderPlus, PencilLine, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { formatDateLabel } from "@/lib/format";
import { createTestId } from "@/lib/test-id";
import type { LibraryFolder } from "@/types/domain";

type FolderDialogMode = "create" | "edit";

function sortFolders(folders: LibraryFolder[]) {
  return [...folders].sort((left, right) => right.updatedAt.localeCompare(left.updatedAt));
}

export function LibraryFolderManager({
  initialFolders,
  selectedFolderId,
  onFolderSelect,
  onFolderView,
  onFoldersChange,
  itemCountByFolderId,
}: {
  initialFolders: LibraryFolder[];
  selectedFolderId?: string | null;
  onFolderSelect?: (folder: LibraryFolder) => void;
  onFolderView?: (folder: LibraryFolder) => void;
  onFoldersChange?: (folders: LibraryFolder[]) => void;
  itemCountByFolderId?: Record<string, number>;
}) {
  const [folders, setFolders] = useState(() => sortFolders(initialFolders));
  const [dialogMode, setDialogMode] = useState<FolderDialogMode | null>(null);
  const [selectedFolder, setSelectedFolder] = useState<LibraryFolder | null>(null);
  const [folderName, setFolderName] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<LibraryFolder | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  function syncFolders(nextFolders: LibraryFolder[]) {
    setFolders(nextFolders);
    onFoldersChange?.(nextFolders);
  }

  function openCreateDialog() {
    setDialogMode("create");
    setSelectedFolder(null);
    setFolderName("");
    setErrorMessage(null);
  }

  function openEditDialog(folder: LibraryFolder) {
    setDialogMode("edit");
    setSelectedFolder(folder);
    setFolderName(folder.name);
    setErrorMessage(null);
  }

  function closeFormDialog() {
    setDialogMode(null);
    setSelectedFolder(null);
    setFolderName("");
    setErrorMessage(null);
  }

  async function handleSubmit() {
    const trimmedName = folderName.trim();
    if (trimmedName.length < 2) {
      setErrorMessage("Folder name must be at least 2 characters.");
      return;
    }

    setErrorMessage(null);
    setSuccessMessage(null);

    setIsPending(true);
    try {
      const isEdit = dialogMode === "edit" && selectedFolder;
      const response = await fetch("/api/library-folders", {
        method: isEdit ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(isEdit ? { id: selectedFolder.id, name: trimmedName } : { name: trimmedName }),
      });
      const payload = (await response.json()) as { ok: boolean; data?: LibraryFolder; error?: string };

      if (!response.ok || !payload.ok || !payload.data) {
        setErrorMessage(payload.error ?? "Unable to save the folder right now.");
        return;
      }

      const savedFolder = payload.data;

      syncFolders(
        sortFolders(
          isEdit
            ? folders.map((folder) => (folder.id === savedFolder.id ? savedFolder : folder))
            : [savedFolder, ...folders],
        ),
      );
      setSuccessMessage(isEdit ? "Folder updated successfully." : "Folder created successfully.");
      closeFormDialog();
    } catch {
      setErrorMessage("Unable to save the folder right now.");
    } finally {
      setIsPending(false);
    }
  }

  async function handleDelete() {
    if (!deleteTarget) {
      return;
    }

    setErrorMessage(null);
    setSuccessMessage(null);

    setIsPending(true);
    try {
      const response = await fetch(`/api/library-folders?id=${encodeURIComponent(deleteTarget.id)}`, {
        method: "DELETE",
      });
      const payload = (await response.json()) as { ok: boolean; data?: { id: string }; error?: string };

      if (!response.ok || !payload.ok || !payload.data) {
        setErrorMessage(payload.error ?? "Unable to delete the folder right now.");
        return;
      }

      syncFolders(folders.filter((folder) => folder.id !== payload.data?.id));
      setDeleteTarget(null);
      setSuccessMessage("Folder deleted successfully.");
    } catch {
      setErrorMessage("Unable to delete the folder right now.");
    } finally {
      setIsPending(false);
    }
  }

  return (
    <Card className="space-y-6 border-slate-200/90 bg-[linear-gradient(180deg,rgba(248,250,252,0.95),rgba(255,255,255,0.98))]">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-3">
          <div className="inline-flex w-fit items-center gap-2 rounded-full bg-slate-950 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.22em] text-white">
            <FolderEdit className="size-3.5" />
            Library folders
          </div>
          <div>
            <h2 className="text-2xl font-semibold text-slate-950 sm:text-3xl">Organize your library your way</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600 sm:text-base">
              Create named folders for lesson kits, seasonal collections, or grade-level resources so your team can find materials faster.
            </p>
          </div>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <Button
            type="button"
            onClick={openCreateDialog}
            icon={<FolderPlus className="size-4" />}
            data-testid={createTestId("library-folder", "create")}
          >
            Add folder
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

      {folders.length ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {folders.map((folder) => {
            const itemCount = itemCountByFolderId?.[folder.id] ?? 0;
            const isSelected = selectedFolderId === folder.id;

            if (onFolderSelect) {
              return (
                <article
                  key={folder.id}
                  className={[
                    "cursor-pointer rounded-2xl border bg-white px-4 py-3 shadow-[0_18px_48px_-34px_rgba(15,23,42,0.35)] transition",
                    isSelected ? "border-sky-300 ring-4 ring-sky-100" : "border-slate-200",
                  ].join(" ")}
                  onClick={() => onFolderSelect(folder)}
                  data-testid={createTestId("library-folder", folder.name)}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-sky-50 text-sky-700">
                        <Folder className="size-4.5" />
                      </div>
                      <div className="min-w-0">
                        <button
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation();
                            onFolderView?.(folder);
                          }}
                          className="truncate text-left text-sm font-semibold text-slate-950 transition hover:text-sky-700"
                        >
                          {folder.name} ({itemCount})
                        </button>
                        <p className="mt-1 text-xs text-slate-500">Updated {formatDateLabel(folder.updatedAt)}</p>
                      </div>
                    </div>
                    <div className="flex shrink-0 gap-2">
                      <button
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation();
                          openEditDialog(folder);
                        }}
                        className="grid size-9 place-items-center rounded-2xl bg-slate-100 text-slate-500 transition hover:bg-sky-50 hover:text-sky-700"
                        aria-label={`Edit ${folder.name}`}
                        data-testid={createTestId("library-folder", "edit", folder.id)}
                      >
                        <PencilLine className="size-4" />
                      </button>
                      <button
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation();
                          setDeleteTarget(folder);
                        }}
                        className="grid size-9 place-items-center rounded-2xl bg-slate-100 text-slate-500 transition hover:bg-rose-50 hover:text-rose-700"
                        aria-label={`Delete ${folder.name}`}
                        data-testid={createTestId("library-folder", "delete", folder.id)}
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                  </div>
                </article>
              );
            }

            return (
              <article
                key={folder.id}
                className={[
                  "group rounded-[28px] border bg-white p-5 shadow-[0_24px_70px_-42px_rgba(15,23,42,0.35)] transition hover:-translate-y-0.5",
                  isSelected ? "border-sky-300 ring-4 ring-sky-100" : "border-slate-200",
                ].join(" ")}
                data-testid={createTestId("library-folder", folder.name)}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-4">
                    <div className="flex size-12 items-center justify-center rounded-2xl bg-sky-50 text-sky-700">
                      <Folder className="size-5" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-slate-950">{folder.name}</h3>
                      <p className="mt-2 text-sm leading-6 text-slate-500">
                        Updated {formatDateLabel(folder.updatedAt)}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();
                        openEditDialog(folder);
                      }}
                      className="grid size-10 place-items-center rounded-2xl bg-slate-100 text-slate-500 transition hover:bg-sky-50 hover:text-sky-700"
                      aria-label={`Edit ${folder.name}`}
                      data-testid={createTestId("library-folder", "edit", folder.id)}
                    >
                      <PencilLine className="size-4" />
                    </button>
                    <button
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();
                        setDeleteTarget(folder);
                      }}
                      className="grid size-10 place-items-center rounded-2xl bg-slate-100 text-slate-500 transition hover:bg-rose-50 hover:text-rose-700"
                      aria-label={`Delete ${folder.name}`}
                      data-testid={createTestId("library-folder", "delete", folder.id)}
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                </div>
                <div className="mt-6 rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-600">
                  A ready place to group curriculum resources, templates, and shared classroom assets.
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <div className="rounded-[28px] border border-dashed border-slate-200 bg-white px-6 py-10">
          <EmptyState
            title="No folders yet"
            description="Create your first library folder to organize content by topic, grade band, or teaching sequence."
          />
          <div className="mt-6 flex justify-center">
            <Button
              type="button"
              onClick={openCreateDialog}
              icon={<FolderPlus className="size-4" />}
              data-testid={createTestId("library-folder", "empty-create")}
            >
              Add folder
            </Button>
          </div>
        </div>
      )}

      <Modal
        open={dialogMode !== null}
        onClose={closeFormDialog}
        title={dialogMode === "edit" ? "Edit folder" : "Create folder"}
        description="Use a clear folder name so your team can organize resources and shared content quickly."
        footer={
          <>
            <Button type="button" variant="ghost" onClick={closeFormDialog}>
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleSubmit}
              disabled={isPending}
              data-testid={createTestId("library-folder", "save")}
            >
              {isPending ? "Saving..." : dialogMode === "edit" ? "Save changes" : "Create folder"}
            </Button>
          </>
        }
      >
        <label className="block space-y-2">
          <span className="text-sm font-semibold text-slate-700">Folder name</span>
          <Input
            value={folderName}
            onChange={(event) => setFolderName(event.target.value)}
            placeholder="Example: Grade 6 science"
            maxLength={80}
            autoFocus
            data-testid={createTestId("library-folder", "name-input")}
          />
        </label>
      </Modal>

      <Modal
        open={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        title="Delete folder"
        description={`Delete "${deleteTarget?.name ?? "this folder"}"? This removes the folder record from the library.`}
        footer={
          <>
            <Button type="button" variant="ghost" onClick={() => setDeleteTarget(null)}>
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleDelete}
              disabled={isPending}
              className="bg-rose-600 hover:bg-rose-700"
              data-testid={createTestId("library-folder", "confirm-delete")}
            >
              {isPending ? "Deleting..." : "Delete folder"}
            </Button>
          </>
        }
      >
        <div className="rounded-2xl border border-rose-100 bg-rose-50 px-4 py-4 text-sm leading-6 text-rose-700">
          Use delete when the folder is no longer needed. You can always create a new folder later.
        </div>
      </Modal>
    </Card>
  );
}
