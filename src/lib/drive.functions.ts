import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const GATEWAY = "https://connector-gateway.lovable.dev/google_drive";
const FOLDER_NAME = "Brix Client Portal uploads";

type UploadInput = {
  name: string;
  mimeType: string;
  /** The file bytes, base64 encoded, without a data URL prefix. */
  data: string;
  threadId?: string | undefined;
};

export type DriveUpload = {
  id: string;
  name: string;
  mimeType: string;
  size: number;
  thumbnailUrl: string | null;
  webViewLink: string | null;
};

function gatewayHeaders() {
  const lovableKey = process.env["LOVABLE_API_KEY"];
  const driveKey = process.env["GOOGLE_DRIVE_API_KEY"];
  if (!lovableKey || !driveKey) {
    throw new Error("The studio Google Drive is not connected yet.");
  }
  return {
    Authorization: `Bearer ${lovableKey}`,
    "X-Connection-Api-Key": driveKey,
  };
}

/** Finds, or makes once, the single studio folder every portal upload lands in. */
async function studioFolderId(headers: Record<string, string>): Promise<string | null> {
  const query = encodeURIComponent(
    `name='${FOLDER_NAME}' and mimeType='application/vnd.google-apps.folder' and trashed=false`,
  );
  const lookup = await fetch(`${GATEWAY}/drive/v3/files?q=${query}&fields=files(id)`, { headers });
  if (lookup.ok) {
    const found = (await lookup.json()) as { files?: Array<{ id: string }> };
    const existing = found.files?.[0]?.id;
    if (existing) return existing;
  }

  const created = await fetch(`${GATEWAY}/drive/v3/files?fields=id`, {
    method: "POST",
    headers: { ...headers, "Content-Type": "application/json" },
    body: JSON.stringify({ name: FOLDER_NAME, mimeType: "application/vnd.google-apps.folder" }),
  });
  if (!created.ok) return null;
  const folder = (await created.json()) as { id?: string };
  return folder.id ?? null;
}

export const uploadToStudioDrive = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: UploadInput) => {
    if (!input?.name || typeof input.data !== "string" || input.data.length === 0) {
      throw new Error("That file could not be read.");
    }
    return input;
  })
  .handler(async ({ data, context }): Promise<DriveUpload> => {
    const headers = gatewayHeaders();
    const folderId = await studioFolderId(headers);
    const mimeType = data.mimeType || "application/octet-stream";

    const boundary = `brix-${crypto.randomUUID()}`;
    const metadata = {
      name: data.name,
      ...(folderId ? { parents: [folderId] } : {}),
    };
    const body = [
      `--${boundary}`,
      "Content-Type: application/json; charset=UTF-8",
      "",
      JSON.stringify(metadata),
      `--${boundary}`,
      `Content-Type: ${mimeType}`,
      "Content-Transfer-Encoding: base64",
      "",
      data.data,
      `--${boundary}--`,
      "",
    ].join("\r\n");

    const fields = "id,name,mimeType,size,thumbnailLink,webViewLink";
    const response = await fetch(
      `${GATEWAY}/upload/drive/v3/files?uploadType=multipart&fields=${fields}`,
      {
        method: "POST",
        headers: { ...headers, "Content-Type": `multipart/related; boundary=${boundary}` },
        body,
      },
    );

    if (!response.ok) {
      const detail = await response.text();
      console.error(`drive upload failed [${response.status}]: ${detail}`);
      throw new Error(`${data.name} did not reach Google Drive.`);
    }

    const file = (await response.json()) as {
      id: string;
      name: string;
      mimeType?: string;
      size?: string;
      thumbnailLink?: string;
      webViewLink?: string;
    };

    const upload: DriveUpload = {
      id: file.id,
      name: file.name,
      mimeType: file.mimeType ?? mimeType,
      size: Number(file.size ?? 0),
      thumbnailUrl: file.thumbnailLink ?? null,
      webViewLink: file.webViewLink ?? null,
    };

    const { error } = await context.supabase.from("chat_attachments").insert({
      thread_id: data.threadId ?? null,
      user_id: context.userId,
      drive_file_id: upload.id,
      name: upload.name,
      mime_type: upload.mimeType,
      size_bytes: upload.size,
      thumbnail_url: upload.thumbnailUrl,
      web_view_link: upload.webViewLink,
    });
    if (error) console.error("drive upload: listing the file failed", error);

    return upload;
  });
