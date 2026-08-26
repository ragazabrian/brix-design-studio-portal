import { HugeiconsIcon } from "@hugeicons/react";
import { File01Icon } from "@hugeicons/core-free-icons";
import { useQueryClient } from "@tanstack/react-query";
import { useRef, useState } from "react";
import { toast } from "sonner";

import { supabase } from "@/integrations/supabase/client";
import { useProjectFiles } from "@/hooks/usePortal";
import { PillButton } from "@/components/site/Primitives";

function readableSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function FileGrid({
  projectId,
  canUpload,
  userId,
}: {
  projectId: string;
  canUpload: boolean;
  userId: string;
}) {
  const { data: files, isPending } = useProjectFiles(projectId);
  const queryClient = useQueryClient();
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  async function onFiles(event: React.ChangeEvent<HTMLInputElement>) {
    const selected = Array.from(event.target.files ?? []);
    if (selected.length === 0) return;

    setUploading(true);
    for (const file of selected) {
      const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "-");
      const path = `${projectId}/${Date.now()}-${safeName}`;

      const { error: uploadError } = await supabase.storage
        .from("project-files")
        .upload(path, file, { cacheControl: "3600", upsert: false });

      if (uploadError) {
        toast.error(`${file.name} did not upload. ${uploadError.message}`);
        continue;
      }

      const { error: rowError } = await supabase.from("project_files").insert({
        project_id: projectId,
        name: file.name,
        storage_path: path,
        mime_type: file.type || null,
        size_bytes: file.size,
        uploaded_by: userId,
      });

      if (rowError) toast.error(`${file.name} uploaded but was not listed. ${rowError.message}`);
    }
    setUploading(false);
    if (inputRef.current) inputRef.current.value = "";
    await queryClient.invalidateQueries({ queryKey: ["project-files", projectId] });
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
      ) : files && files.length > 0 ? (
        <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {files.map((file) => {
            const isImage = (file.mime_type ?? "").startsWith("image/");
            return (
              <li key={file.id} className="overflow-hidden rounded-3xl border border-border">
                <div className="flex aspect-[4/3] items-center justify-center bg-frost">
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
                    {readableSize(file.size_bytes)}
                    {" · "}
                    {new Date(file.created_at).toLocaleDateString()}
                  </p>
                  {file.url ? (
                    <a
                      href={file.url}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-3 inline-block text-sm underline underline-offset-4"
                    >
                      Open file
                    </a>
                  ) : null}
                </div>
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="mt-6 rounded-3xl bg-frost p-6 text-muted-foreground">
          No files yet. {canUpload ? "Add the first one above." : "Your designer will add them here."}
        </p>
      )}
    </section>
  );
}
