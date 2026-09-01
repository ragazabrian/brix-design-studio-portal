-- Library assets (brand assets + reusable modules)
CREATE TABLE public.library_assets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  kind text NOT NULL DEFAULT 'brand',
  name text NOT NULL,
  description text,
  tags text[] NOT NULL DEFAULT '{}',
  storage_path text,
  thumbnail_path text,
  mime_type text,
  size_bytes bigint NOT NULL DEFAULT 0,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.library_assets TO authenticated;
GRANT ALL ON public.library_assets TO service_role;
ALTER TABLE public.library_assets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "library visible to project" ON public.library_assets FOR SELECT TO authenticated USING (public.can_view_project(auth.uid(), project_id));
CREATE POLICY "staff create library" ON public.library_assets FOR INSERT TO authenticated WITH CHECK (public.is_staff(auth.uid()));
CREATE POLICY "staff update library" ON public.library_assets FOR UPDATE TO authenticated USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));
CREATE POLICY "staff delete library" ON public.library_assets FOR DELETE TO authenticated USING (public.is_staff(auth.uid()));
CREATE TRIGGER library_assets_updated_at BEFORE UPDATE ON public.library_assets FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Brand guidelines
CREATE TABLE public.guidelines (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  section text NOT NULL DEFAULT 'general',
  title text NOT NULL,
  body text NOT NULL DEFAULT '',
  image_path text,
  position integer NOT NULL DEFAULT 0,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.guidelines TO authenticated;
GRANT ALL ON public.guidelines TO service_role;
ALTER TABLE public.guidelines ENABLE ROW LEVEL SECURITY;
CREATE POLICY "guidelines visible to project" ON public.guidelines FOR SELECT TO authenticated USING (public.can_view_project(auth.uid(), project_id));
CREATE POLICY "staff create guidelines" ON public.guidelines FOR INSERT TO authenticated WITH CHECK (public.is_staff(auth.uid()));
CREATE POLICY "staff update guidelines" ON public.guidelines FOR UPDATE TO authenticated USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));
CREATE POLICY "staff delete guidelines" ON public.guidelines FOR DELETE TO authenticated USING (public.is_staff(auth.uid()));
CREATE TRIGGER guidelines_updated_at BEFORE UPDATE ON public.guidelines FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Meeting bookings
CREATE TABLE public.meetings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  title text NOT NULL,
  agenda text,
  starts_at timestamptz NOT NULL,
  duration_minutes integer NOT NULL DEFAULT 30,
  meeting_url text,
  status text NOT NULL DEFAULT 'requested',
  requested_by uuid REFERENCES auth.users(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.meetings TO authenticated;
GRANT ALL ON public.meetings TO service_role;
ALTER TABLE public.meetings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "meetings visible to project" ON public.meetings FOR SELECT TO authenticated USING (public.can_view_project(auth.uid(), project_id));
CREATE POLICY "project people request meetings" ON public.meetings FOR INSERT TO authenticated WITH CHECK (public.can_view_project(auth.uid(), project_id) AND requested_by = auth.uid());
CREATE POLICY "staff update meetings" ON public.meetings FOR UPDATE TO authenticated USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));
CREATE POLICY "staff delete meetings" ON public.meetings FOR DELETE TO authenticated USING (public.is_staff(auth.uid()));
CREATE TRIGGER meetings_updated_at BEFORE UPDATE ON public.meetings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Asset / hours requests
CREATE TABLE public.asset_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  title text NOT NULL,
  brief text,
  kind text NOT NULL DEFAULT 'asset',
  hours_requested integer NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'open',
  requested_by uuid REFERENCES auth.users(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.asset_requests TO authenticated;
GRANT ALL ON public.asset_requests TO service_role;
ALTER TABLE public.asset_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "requests visible to project" ON public.asset_requests FOR SELECT TO authenticated USING (public.can_view_project(auth.uid(), project_id));
CREATE POLICY "project people raise requests" ON public.asset_requests FOR INSERT TO authenticated WITH CHECK (public.can_view_project(auth.uid(), project_id) AND requested_by = auth.uid());
CREATE POLICY "staff update requests" ON public.asset_requests FOR UPDATE TO authenticated USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));
CREATE POLICY "staff delete requests" ON public.asset_requests FOR DELETE TO authenticated USING (public.is_staff(auth.uid()));
CREATE TRIGGER asset_requests_updated_at BEFORE UPDATE ON public.asset_requests FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Chat attachments stored in the studio Google Drive
CREATE TABLE public.chat_attachments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  thread_id uuid REFERENCES public.chat_threads(id) ON DELETE CASCADE,
  message_id uuid REFERENCES public.chat_messages(id) ON DELETE SET NULL,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  drive_file_id text NOT NULL,
  name text NOT NULL,
  mime_type text,
  size_bytes bigint NOT NULL DEFAULT 0,
  thumbnail_url text,
  web_view_link text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.chat_attachments TO authenticated;
GRANT ALL ON public.chat_attachments TO service_role;
ALTER TABLE public.chat_attachments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own chat attachments" ON public.chat_attachments FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- Invite links
ALTER TABLE public.invitations
  ADD COLUMN IF NOT EXISTS token uuid NOT NULL DEFAULT gen_random_uuid(),
  ADD COLUMN IF NOT EXISTS expires_at timestamptz NOT NULL DEFAULT (now() + interval '14 days');
CREATE UNIQUE INDEX IF NOT EXISTS invitations_token_key ON public.invitations(token);