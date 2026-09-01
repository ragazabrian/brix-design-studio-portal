import { HugeiconsIcon } from "@hugeicons/react";
import { File01Icon } from "@hugeicons/core-free-icons";
import { useQueryClient } from "@tanstack/react-query";
import { useRef, useState } from "react";
import { toast } from "sonner";

import { supabase } from "@/integrations/supabase/client";
import { logActivity, useFileVersions, useProjectFiles } from "@/hooks/usePortal";
import { PillButton } from "@/components/site/Primitives";

function readableSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function storagePath(projectId: string, name: string) {
  const safeName = name.replace(/[^a-zA-Z0-9._-]/g, "-");
  return `${projectId}/${Date.now()}-${safeName}`;
}

export function FileGrid({
  projectId,
  canUpload,
  userId,
  query = "",
}: {
  projectId: string;
  canUpload: boolean;
  userId: string;
  query?: string;
}) {
  const { data: files, isPending } = useProjectFiles(projectId);
  const queryClient = useQueryClient();
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [openVersions, setOpenVersions] = useState<string | null>(null);

  const term = query.trim().toLowerCase();
  const visible = (files ?? []).filter(
    (file) =>
      term.length === 0 ||
      file.name.toLowerCase().includes(term) ||
      (file.folder ?? "").toLowerCase().includes(term),
  );

  async function refresh() {
    await queryClient.invalidateQueries({ queryKey: ["project-files", projectId] });
    await queryClient.invalidateQueries({ queryKey: ["activity", projectId] });
  }

  async function onFiles(event: React.ChangeEvent<HTMLInputElement>) {
    const selected = Array.from(event.target.files ?? []);
    if (selected.length === 0) return;

    setUploading(true);
    for (const file of selected) {
      const path = storagePath(projectId, file.name);

      const { error: uploadError } = await supabase.storage
        .from("project-files")
        .upload(path, file, { cacheControl: "3600", upsert: false });

      if (uploadError) {
        toast.error(`${file.name} did not upload. ${uploadError.message}`);
        continue;
      }

      const { data: row, error: rowError } = await supabase
        .from("project_files")
        .insert({
          project_id: projectId,
          name: file.name,
          storage_path: path,
          mime_type: file.type || null,
          size_bytes: file.size,
          uploaded_by: userId,
          version: 1,
        })
        .select("id")
        .maybeSingle();

      if (rowError || !row) {
        toast.error(`${file.name} uploaded but was not listed. ${rowError?.message ?? ""}`);
        continue;
      }

      await supabase.from("file_versions").insert({
        file_id: row.id,
        project_id: projectId,
        version: 1,
        name: file.name,
        storage_path: path,
        mime_type: file.type || null,
        size_bytes: file.size,
        uploaded_by: userId,
      });
      await logActivity(projectId, userId, `Uploaded ${file.name}`);
    }
    setUploading(false);
    if (inputRef.current) inputRef.current.value = "";
    await refresh();
    toast.success("Upload finished.");
  }

  return (
    <section aria-labelledby="files-heading">
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4">
        <h2 id="files-heading" className="text-[20px] font-medium">
          Files
        </h2>
        {canUpload ? (
          <div>
            <label htmlFor="file-upload" className="sr-only">
              Add files to this project
            </label>
            <input
              ref={inputRef}
              id="file-upload"
              type="file"
              multiple
              onChange={onFiles}
              className="hidden"
            />
            <PillButton
              type="button"
              onClick={() => inputRef.current?.click()}
              disabled={uploading}
              className="disabled:opacity-60"
            >
              {uploading ? "Uploading" : "Add files"}
            </PillButton>
          </div>
        ) : null}
      </div>

      {isPending ? (
        <p className="mt-6 text-muted-foreground">Loading files.</p>
      ) : visible.length > 0 ? (
        <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((file) => {
            const isImage = (file.mime_type ?? "").startsWith("image/");
            return (
              <li key={file.id} className="overflow-hidden rounded-3xl border border-border">
                <div className="flex aspect-[4/3] items-center justify-center bg-muted">
                  {isImage && file.url ? (
                    <img
                      src={file.url}
                      alt={file.name}
                      loading="lazy"
                      className="grayscale-media h-full w-full object-cover"
                    />
                  ) : (
                    <span className="flex flex-col items-center gap-2 text-muted-foreground">
                      <HugeiconsIcon icon={File01Icon} size={28} strokeWidth={1.5} aria-hidden />
                      <span className="label-caps">
                        {(file.name.split(".").pop() ?? "file").slice(0, 5)}
                      </span>
                    </span>
                  )}
                </div>
                <div className="p-4">
                  <p className="truncate text-[15px] font-medium">{file.name}</p>
                  <p className="mt-1 text-caption text-muted-foreground tabular-nums">
                    Version {file.version} · {readableSize(file.size_bytes)} ·{" "}
                    {new Date(file.updated_at).toLocaleDateString()}
                  </p>
                  <div className="mt-3 flex flex-wrap items-center gap-4">
                    {file.url ? (
                      <a
                        href={file.url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-sm underline underline-offset-4"
                      >
                        Open file
                      </a>
                    ) : null}
                    <button
                      type="button"
                      onClick={() =>
                        setOpenVersions((current) => (current === file.id ? null : file.id))
                      }
                      aria-expanded={openVersions === file.id}
                      className="text-sm underline underline-offset-4"
                    >
                      {openVersions === file.id ? "Hide history" : "Version history"}
                    </button>
                    {canUpload ? (
                      <NewVersionButton
                        fileId={file.id}
                        projectId={projectId}
                        fileName={file.name}
                        currentVersion={file.version}
                        userId={userId}
                        onDone={refresh}
                      />
                    ) : null}
                  </div>

                  {openVersions === file.id ? (
                    <VersionList
                      fileId={file.id}
                      projectId={projectId}
                      currentPath={file.storage_path}
                      canRestore={canUpload}
                      userId={userId}
                      onRestored={refresh}
                    />
                  ) : null}
                </div>
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="mt-6 rounded-3xl bg-muted p-6 text-muted-foreground">
          {term.length > 0
            ? "No files match that search."
            : canUpload
              ? "No files yet. Add the first one above."
              : "No files yet. Your designer will add them here."}
        </p>
      )}
    </section>
  );
}

function NewVersionButton({
  fileId,
  projectId,
  fileName,
  currentVersion,
  userId,
  onDone,
}: {
  fileId: string;
  projectId: string;
  fileName: string;
  currentVersion: number;
  userId: string;
  onDone: () => Promise<void>;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const queryClient = useQueryClient();

  async function onPick(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    setBusy(true);
    const path = storagePath(projectId, file.name);
    const { error: uploadError } = await supabase.storage
      .from("project-files")
      .upload(path, file, { cacheControl: "3600", upsert: false });

    if (uploadError) {
      setBusy(false);
      toast.error(`The new version did not upload. ${uploadError.message}`);
      return;
    }

    const nextVersion = currentVersion + 1;
    const { error } = await supabase.from("file_versions").insert({
      file_id: fileId,
      project_id: projectId,
      version: nextVersion,
      name: file.name,
      storage_path: path,
      mime_type: file.type || null,
      size_bytes: file.size,
      uploaded_by: userId,
    });

    if (!error) {
      await supabase
        .from("project_files")
        .update({
          storage_path: path,
          mime_type: file.type || null,
          size_bytes: file.size,
          version: nextVersion,
          updated_at: new Date().toISOString(),
        })
        .eq("id", fileId);
      await logActivity(projectId, userId, `Updated ${fileName} to version ${nextVersion}`);
      toast.success(`Saved as version ${nextVersion}.`);
    } else {
      toast.error("The new version was not saved.");
    }

    setBusy(false);
    if (inputRef.current) inputRef.current.value = "";
    await queryClient.invalidateQueries({ queryKey: ["file-versions", fileId] });
    await onDone();
  }

  return (
    <>
      <label htmlFor={`version-${fileId}`} className="sr-only">
        Upload a new version of {fileName}
      </label>
      <input
        ref={inputRef}
        id={`version-${fileId}`}
        type="file"
        onChange={onPick}
        className="hidden"
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={busy}
        className="text-sm underline underline-offset-4 disabled:opacity-60"
      >
        {busy ? "Saving" : "New version"}
      </button>
    </>
  );
}

function VersionList({
  fileId,
  projectId,
  currentPath,
  canRestore,
  userId,
  onRestored,
}: {
  fileId: string;
  projectId: string;
  currentPath: string;
  canRestore: boolean;
  userId: string;
  onRestored: () => Promise<void>;
}) {
  const { data: versions, isPending } = useFileVersions(fileId);
  const queryClient = useQueryClient();
  const [busy, setBusy] = useState(false);

  async function restore(version: {
    version: number;
    name: string;
    storage_path: string;
    mime_type: string | null;
    size_bytes: number;
  }) {
    setBusy(true);
    const nextVersion = Math.max(...(versions ?? []).map((item) => item.version)) + 1;
    const { error } = await supabase.from("file_versions").insert({
      file_id: fileId,
      project_id: projectId,
      version: nextVersion,
      name: version.name,
      storage_path: version.storage_path,
      mime_type: version.mime_type,
      size_bytes: version.size_bytes,
      uploaded_by: userId,
    });

    if (error) {
      setBusy(false);
      toast.error("That version was not restored.");
      return;
    }

    await supabase
      .from("project_files")
      .update({
        name: version.name,
        storage_path: version.storage_path,
        mime_type: version.mime_type,
        size_bytes: version.size_bytes,
        version: nextVersion,
        updated_at: new Date().toISOString(),
      })
      .eq("id", fileId);
    await logActivity(
      projectId,
      userId,
      `Restored ${version.name} from version ${version.version}`,
    );
    setBusy(false);
    toast.success(`Version ${version.version} is live again.`);
    await queryClient.invalidateQueries({ queryKey: ["file-versions", fileId] });
    await onRestored();
  }

  if (isPending) return <p className="mt-3 text-caption text-muted-foreground">Loading history.</p>;

  return (
    <ol className="mt-4 space-y-2">
      {(versions ?? []).map((version) => {
        const isCurrent = version.storage_path === currentPath;
        return (
          <li
            key={version.id}
            className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 rounded-2xl bg-muted px-3 py-2"
          >
            <span className="min-w-0">
              <span className="block truncate text-caption">
                Version {version.version}
                {isCurrent ? " (current)" : ""}
              </span>
              <span className="block text-caption text-muted-foreground tabular-nums">
                {new Date(version.created_at).toLocaleString()} · {readableSize(version.size_bytes)}
              </span>
            </span>
            {canRestore && !isCurrent ? (
              <button
                type="button"
                onClick={() => restore(version)}
                disabled={busy}
                className="text-sm underline underline-offset-4 disabled:opacity-60"
              >
                Restore
              </button>
            ) : null}
          </li>
        );
      })}
      {(versions ?? []).length === 0 ? (
        <li className="text-caption text-muted-foreground">No saved versions yet.</li>
      ) : null}
    </ol>
  );
}
