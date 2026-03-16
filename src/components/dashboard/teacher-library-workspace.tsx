"use client";

import { useMemo, useState } from "react";
import { CheckCircle2, FileText, FolderPlus } from "lucide-react";
import { LibraryFolderManager } from "@/components/dashboard/library-folder-manager";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Modal } from "@/components/ui/modal";
import type { DashboardSnapshot } from "@/types/domain";

export function TeacherLibraryWorkspace({ snapshot }: { snapshot: DashboardSnapshot }) {
  const [folders, setFolders] = useState(snapshot.libraryFolders);
  const [contentItems, setContentItems] = useState(snapshot.content);
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(snapshot.libraryFolders[0]?.id ?? null);
  const [isLibraryModalOpen, setIsLibraryModalOpen] = useState(false);
  const [pendingContentId, setPendingContentId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const selectedFolder = useMemo(
    () => folders.find((folder) => folder.id === selectedFolderId) ?? null,
    [folders, selectedFolderId],
  );
  const folderItemCountById = useMemo(
    () =>
      folders.reduce<Record<string, number>>((accumulator, folder) => {
        accumulator[folder.id] = contentItems.filter((asset) => asset.folderIds.includes(folder.id)).length;
        return accumulator;
      }, {}),
    [contentItems, folders],
  );
  const selectedFolderItems = useMemo(
    () => (selectedFolder ? contentItems.filter((asset) => asset.folderIds.includes(selectedFolder.id)) : []),
    [contentItems, selectedFolder],
  );

  async function handleAddToFolder(contentId: string) {
    if (!selectedFolderId) {
      return;
    }

    setPendingContentId(contentId);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const response = await fetch("/api/library-folder-items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          folderId: selectedFolderId,
          contentId,
        }),
      });
      const payload = (await response.json()) as {
        ok: boolean;
        data?: { folderId: string; contentId: string };
        error?: string;
      };

      if (!response.ok || !payload.ok || !payload.data) {
        setErrorMessage(payload.error ?? "Unable to add the library to this folder.");
        return;
      }

      setContentItems((current) =>
        current.map((asset) =>
          asset.id === payload.data?.contentId && !asset.folderIds.includes(payload.data.folderId)
            ? { ...asset, folderIds: [...asset.folderIds, payload.data.folderId] }
            : asset,
        ),
      );
      setSuccessMessage("Library added to the selected folder.");
    } catch {
      setErrorMessage("Unable to add the library to this folder.");
    } finally {
      setPendingContentId(null);
    }
  }

  return (
    <div className="space-y-6">
      <LibraryFolderManager
        initialFolders={folders}
        selectedFolderId={selectedFolderId}
        itemCountByFolderId={folderItemCountById}
        onFolderSelect={(folder) => setSelectedFolderId(folder.id)}
        onFolderView={(folder) => {
          setSelectedFolderId(folder.id);
          setIsLibraryModalOpen(true);
        }}
        onFoldersChange={(nextFolders) => {
          setFolders(nextFolders);
          if (!nextFolders.some((folder) => folder.id === selectedFolderId)) {
            setSelectedFolderId(nextFolders[0]?.id ?? null);
          }
        }}
      />

      {successMessage ? (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
          {successMessage}
        </div>
      ) : null}

      {selectedFolder ? (
        <Card className="space-y-5 border-slate-200/90 bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(248,250,252,0.94))]">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-400">Lessons</p>
              <h2 className="mt-2 text-2xl font-semibold text-slate-950">{selectedFolder.name}</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Libraries added to this folder appear here as ready-to-use lesson resources.
              </p>
            </div>
            <Button type="button" variant="secondary" onClick={() => setIsLibraryModalOpen(true)}>
              Browse library
            </Button>
          </div>

          {selectedFolderItems.length ? (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {selectedFolderItems.map((asset) => (
                <article
                  key={asset.id}
                  className="rounded-[28px] border border-slate-200 bg-white shadow-[0_20px_60px_-40px_rgba(15,23,42,0.4)]"
                >
                  <div className="flex items-start gap-3 px-5 py-4">
                    <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-violet-100 text-violet-700">
                      <FileText className="size-5" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-base font-semibold text-slate-950">{asset.title}</p>
                      <p className="mt-1 text-sm text-slate-600">{asset.createdByName ?? "Shared library"}</p>
                    </div>
                  </div>
                  <div className="bg-amber-100 px-5 py-2 text-sm font-medium text-amber-900">Added in folder</div>
                  <div className="px-5 py-8 text-center">
                    <div className="mx-auto flex size-14 items-center justify-center rounded-full border-2 border-sky-300 text-sky-600">
                      <CheckCircle2 className="size-6" />
                    </div>
                    <p className="mt-4 text-sm font-semibold text-sky-700">{asset.type === "template" ? "Template" : "Resource"}</p>
                  </div>
                  <div className="flex items-center justify-between border-t border-slate-100 px-5 py-4 text-sm text-slate-500">
                    <span>{new Date(asset.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
                    <span>{asset.fileName ?? "Library item"}</span>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="rounded-[28px] border border-dashed border-slate-200 bg-white px-6 py-10">
              <EmptyState
                title="No lessons in this folder yet"
                description="Click the folder name or use Browse library to add shared materials into this folder."
              />
            </div>
          )}
        </Card>
      ) : null}

      <Modal
        open={isLibraryModalOpen}
        onClose={() => setIsLibraryModalOpen(false)}
        title={selectedFolder ? `${selectedFolder.name} library list` : "Shared library list"}
        description="Browse the shared library and add the resources you want into this folder."
        className="max-w-4xl"
      >
        {selectedFolder ? (
          contentItems.length ? (
            <div className="space-y-4">
              {errorMessage ? (
                <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
                  {errorMessage}
                </div>
              ) : null}
              <div className="grid gap-3 sm:grid-cols-2">
                {contentItems.map((asset) => {
                  const isAdded = asset.folderIds.includes(selectedFolder.id);

                  return (
                    <article
                      key={asset.id}
                      className="rounded-[28px] border border-slate-200 bg-[linear-gradient(180deg,#ffffff,rgba(248,250,252,0.9))] p-5 shadow-[0_24px_70px_-42px_rgba(15,23,42,0.35)] transition hover:-translate-y-0.5 hover:border-sky-200"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex min-w-0 items-start gap-3">
                          <div className="mt-0.5 flex size-11 shrink-0 items-center justify-center rounded-2xl bg-sky-50 text-sky-700">
                            <FileText className="size-5" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-base font-semibold text-slate-950">{asset.title}</p>
                            <p className="mt-2 text-sm leading-6 text-slate-600">{asset.description}</p>
                          </div>
                        </div>
                        {isAdded ? (
                          <span className="inline-flex shrink-0 items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                            <CheckCircle2 className="size-3.5" />
                            Added
                          </span>
                        ) : null}
                      </div>
                      <div className="mt-4 flex flex-wrap gap-2 text-xs font-medium text-slate-500">
                        {asset.fileName ? (
                          <span className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-slate-600">
                            {asset.fileName}
                          </span>
                        ) : null}
                        {asset.createdByName ? (
                          <span className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-slate-600">
                            By {asset.createdByName}
                          </span>
                        ) : null}
                      </div>
                      <div className="mt-5 flex items-center justify-end">
                        <Button
                          type="button"
                          onClick={() => handleAddToFolder(asset.id)}
                          disabled={isAdded || pendingContentId === asset.id}
                          icon={isAdded ? <CheckCircle2 className="size-4" /> : <FolderPlus className="size-4" />}
                          variant={isAdded ? "secondary" : "primary"}
                        >
                          {isAdded ? "Added in Folder" : pendingContentId === asset.id ? "Adding..." : "Add to folder"}
                        </Button>
                      </div>
                    </article>
                  );
                })}
              </div>
            </div>
          ) : (
            <EmptyState
              title="No shared libraries yet"
              description="Admin-created library items will appear here so teachers can add them into folders."
            />
          )
        ) : (
          <EmptyState
            title="Select a folder to browse shared resources"
            description="Choose a library folder to view the admin-created materials available for that collection."
          />
        )}
      </Modal>
    </div>
  );
}
