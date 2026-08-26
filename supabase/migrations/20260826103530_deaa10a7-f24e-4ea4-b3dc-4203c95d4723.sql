CREATE POLICY "read project files in storage" ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'project-files' AND public.can_view_project(auth.uid(), (split_part(name, '/', 1))::uuid));

CREATE POLICY "upload project files in storage" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'project-files' AND public.can_view_project(auth.uid(), (split_part(name, '/', 1))::uuid));

CREATE POLICY "update project files in storage" ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'project-files' AND public.can_view_project(auth.uid(), (split_part(name, '/', 1))::uuid))
  WITH CHECK (bucket_id = 'project-files' AND public.can_view_project(auth.uid(), (split_part(name, '/', 1))::uuid));

CREATE POLICY "delete project files in storage" ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'project-files' AND (owner_id = auth.uid()::text OR public.is_staff(auth.uid())));