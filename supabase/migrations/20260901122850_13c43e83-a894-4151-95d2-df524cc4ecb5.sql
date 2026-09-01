DELETE FROM public.user_roles a
USING public.user_roles b
WHERE a.user_id = b.user_id
  AND a.created_at < b.created_at;

ALTER TABLE public.user_roles
  DROP CONSTRAINT IF EXISTS user_roles_user_id_role_key;
ALTER TABLE public.user_roles
  ADD CONSTRAINT user_roles_one_role_per_user UNIQUE (user_id);

CREATE OR REPLACE FUNCTION public.complete_portal_invitation(
  _token uuid,
  _user_id uuid,
  _email text
)
RETURNS TABLE(role public.app_role, destination text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  matched_invitation public.invitations%ROWTYPE;
BEGIN
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
  IF lower(matched_invitation.email) <> lower(_email) THEN
    RAISE EXCEPTION 'Sign in with the invited email address';
  END IF;

  INSERT INTO public.user_roles(user_id, role)
  VALUES (_user_id, matched_invitation.role)
  ON CONFLICT (user_id) DO UPDATE SET role = excluded.role;

  IF matched_invitation.role = 'client' THEN
    DELETE FROM public.project_members WHERE user_id = _user_id;
    INSERT INTO public.project_members(project_id, user_id)
    SELECT project_id, _user_id
    FROM public.invitation_projects
    WHERE invitation_id = matched_invitation.id
    ON CONFLICT (project_id, user_id) DO NOTHING;
  END IF;

  UPDATE public.profiles SET is_active = true WHERE id = _user_id;
  UPDATE public.invitations
  SET status = 'accepted', accepted_at = now()
  WHERE id = matched_invitation.id;

  RETURN QUERY SELECT matched_invitation.role,
    CASE WHEN matched_invitation.role = 'client' THEN '/client/dashboard' ELSE '/dashboard' END;
END;
$$;
REVOKE ALL ON FUNCTION public.complete_portal_invitation(uuid, uuid, text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.complete_portal_invitation(uuid, uuid, text) FROM anon;
REVOKE ALL ON FUNCTION public.complete_portal_invitation(uuid, uuid, text) FROM authenticated;
GRANT EXECUTE ON FUNCTION public.complete_portal_invitation(uuid, uuid, text) TO service_role;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE user_count integer;
BEGIN
  PERFORM pg_advisory_xact_lock(17022026);

  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.raw_user_meta_data ->> 'name', split_part(COALESCE(NEW.email,''), '@', 1)),
    COALESCE(NEW.raw_user_meta_data ->> 'avatar_url', NEW.raw_user_meta_data ->> 'picture')
  )
  ON CONFLICT (id) DO NOTHING;

  SELECT count(*) INTO user_count FROM public.user_roles;
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, CASE WHEN user_count = 0 THEN 'admin'::public.app_role ELSE 'client'::public.app_role END)
  ON CONFLICT (user_id) DO NOTHING;

  RETURN NEW;
END;
$$;