CREATE TABLE public.invitation_projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  invitation_id uuid NOT NULL REFERENCES public.invitations(id) ON DELETE CASCADE,
  project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (invitation_id, project_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.invitation_projects TO authenticated;
GRANT ALL ON public.invitation_projects TO service_role;
ALTER TABLE public.invitation_projects ENABLE ROW LEVEL SECURITY;
CREATE POLICY "admins manage invitation projects" ON public.invitation_projects
  FOR ALL TO authenticated
  USING (private.has_role(auth.uid(), 'admin'))
  WITH CHECK (private.has_role(auth.uid(), 'admin'));

CREATE INDEX invitation_projects_invitation_idx ON public.invitation_projects(invitation_id);
CREATE INDEX invitation_projects_project_idx ON public.invitation_projects(project_id);
CREATE UNIQUE INDEX IF NOT EXISTS invitations_pending_email_key
  ON public.invitations (lower(email)) WHERE status = 'pending';

DROP POLICY IF EXISTS "project people add files" ON public.project_files;
CREATE POLICY "staff add files" ON public.project_files
  FOR INSERT TO authenticated
  WITH CHECK (private.is_staff(auth.uid()));

DROP POLICY IF EXISTS "staff or uploader update files" ON public.project_files;
CREATE POLICY "staff update files" ON public.project_files
  FOR UPDATE TO authenticated
  USING (private.is_staff(auth.uid()))
  WITH CHECK (private.is_staff(auth.uid()));

DROP POLICY IF EXISTS "staff or uploader delete files" ON public.project_files;
CREATE POLICY "staff delete files" ON public.project_files
  FOR DELETE TO authenticated
  USING (private.is_staff(auth.uid()));

DROP POLICY IF EXISTS "project people add versions" ON public.file_versions;
CREATE POLICY "staff add versions" ON public.file_versions
  FOR INSERT TO authenticated
  WITH CHECK (private.is_staff(auth.uid()));

DROP POLICY IF EXISTS "staff or uploader remove versions" ON public.file_versions;
CREATE POLICY "staff remove versions" ON public.file_versions
  FOR DELETE TO authenticated
  USING (private.is_staff(auth.uid()));

CREATE OR REPLACE FUNCTION public.accept_portal_invitation(_token uuid)
RETURNS TABLE(role public.app_role, destination text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  matched_invitation public.invitations%ROWTYPE;
  current_email text;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  SELECT lower(COALESCE(email, '')) INTO current_email
  FROM auth.users
  WHERE id = auth.uid();

  SELECT * INTO matched_invitation
  FROM public.invitations
  WHERE token = _token
  FOR UPDATE;

  IF matched_invitation.id IS NULL THEN
    RAISE EXCEPTION 'Invitation not found';
  END IF;
  IF matched_invitation.status <> 'pending' THEN
    RAISE EXCEPTION 'Invitation is no longer available';
  END IF;
  IF matched_invitation.expires_at <= now() THEN
    UPDATE public.invitations SET status = 'expired' WHERE id = matched_invitation.id;
    RAISE EXCEPTION 'Invitation has expired';
  END IF;
  IF lower(matched_invitation.email) <> current_email THEN
    RAISE EXCEPTION 'Sign in with the invited email address';
  END IF;

  DELETE FROM public.user_roles WHERE user_id = auth.uid();
  INSERT INTO public.user_roles(user_id, role)
  VALUES (auth.uid(), matched_invitation.role);

  DELETE FROM public.project_members
  WHERE user_id = auth.uid()
    AND matched_invitation.role = 'client';

  IF matched_invitation.role = 'client' THEN
    INSERT INTO public.project_members(project_id, user_id)
    SELECT project_id, auth.uid()
    FROM public.invitation_projects
    WHERE invitation_id = matched_invitation.id
    ON CONFLICT (project_id, user_id) DO NOTHING;
  END IF;

  UPDATE public.profiles SET is_active = true WHERE id = auth.uid();
  UPDATE public.invitations
  SET status = 'accepted', accepted_at = now()
  WHERE id = matched_invitation.id;

  RETURN QUERY SELECT matched_invitation.role,
    CASE WHEN matched_invitation.role = 'client' THEN '/client/dashboard' ELSE '/dashboard' END;
END;
$$;
REVOKE ALL ON FUNCTION public.accept_portal_invitation(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.accept_portal_invitation(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.accept_portal_invitation(uuid) TO service_role;