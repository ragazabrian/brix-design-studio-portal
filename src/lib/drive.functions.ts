import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const BUCKET = "chat-attachments";
const SIGNED_URL_TTL_SECONDS = 3600;

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

export const uploadToStudioDrive = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: UploadInput) => {
    if (!input?.name || typeof input.data !== "string" || input.data.length === 0) {
      throw new Error("That file could not be read.");
    }
    return input;
  })
  .handler(async ({ data, context }): Promise<DriveUpload> => {
    const mimeType = data.mimeType || "application/octet-stream";
    const bytes = Buffer.from(data.data, "base64");
    const path = `${context.userId}/${crypto.randomUUID()}-${data.name}`;

    const { error: uploadError } = await context.supabase.storage
      .from(BUCKET)
      .upload(path, bytes, { contentType: mimeType, cacheControl: "3600", upsert: false });

    if (uploadError) {
      console.error(`drive upload failed: ${uploadError.message}`);
      throw new Error(`${data.name} did not upload.`);
    }

    const { data: signed } = await context.supabase.storage
      .from(BUCKET)
      .createSignedUrl(path, SIGNED_URL_TTL_SECONDS);

    const { error: insertError } = await context.supabase.from("chat_attachments").insert({
      thread_id: data.threadId ?? null,
      user_id: context.userId,
      storage_path: path,
      name: data.name,
      mime_type: mimeType,
      size_bytes: bytes.length,
    });
    if (insertError) console.error("drive upload: recording the file failed", insertError);

    return {
      id: path,
      name: data.name,
      mimeType,
      size: bytes.length,
      thumbnailUrl: null,
      webViewLink: signed?.signedUrl ?? null,
    };
  });
