-- Move chat attachments off the Lovable Google Drive connector onto Supabase
-- Storage, matching the existing project-files pattern.

ALTER TABLE public.chat_attachments RENAME COLUMN drive_file_id TO storage_path;

CREATE POLICY "read own chat attachments in storage" ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'chat-attachments' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "upload own chat attachments in storage" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'chat-attachments' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "delete own chat attachments in storage" ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'chat-attachments' AND (storage.foldername(name))[1] = auth.uid()::text);
