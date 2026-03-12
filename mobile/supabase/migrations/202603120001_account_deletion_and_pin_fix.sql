-- ============================================================
-- MaTirelire — Migration 003 : correction PIN + suppression comptes
-- ============================================================

CREATE OR REPLACE FUNCTION set_child_pin(child_uuid UUID, plain_pin TEXT)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth, extensions
AS $$
BEGIN
  IF plain_pin IS NULL OR plain_pin !~ '^\d{4}$' THEN
    RAISE EXCEPTION 'Le code PIN doit contenir exactement 4 chiffres.';
  END IF;

  UPDATE children
  SET child_pin_hash = extensions.crypt(plain_pin, extensions.gen_salt('bf')),
      child_pin_updated_at = NOW(),
      updated_at = NOW()
  WHERE id = child_uuid
    AND parent_id = auth.uid();

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Enfant introuvable ou accès refusé.';
  END IF;

  INSERT INTO compliance_logs (type, user_id, metadata)
  VALUES (
    'pin_changed',
    auth.uid(),
    jsonb_build_object('child_id', child_uuid)
  );
END;
$$;

CREATE OR REPLACE FUNCTION delete_child_account(child_uuid UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth, extensions
AS $$
DECLARE
  current_parent_id UUID := auth.uid();
BEGIN
  IF current_parent_id IS NULL THEN
    RAISE EXCEPTION 'Utilisateur non authentifié.';
  END IF;

  DELETE FROM children
  WHERE id = child_uuid
    AND parent_id = current_parent_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Enfant introuvable ou accès refusé.';
  END IF;

  INSERT INTO compliance_logs (type, user_id, metadata)
  VALUES (
    'account_deleted',
    current_parent_id,
    jsonb_build_object('scope', 'child', 'child_id', child_uuid)
  );
END;
$$;

CREATE OR REPLACE FUNCTION delete_parent_account()
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth, extensions
AS $$
DECLARE
  current_parent_id UUID := auth.uid();
BEGIN
  IF current_parent_id IS NULL THEN
    RAISE EXCEPTION 'Utilisateur non authentifié.';
  END IF;

  INSERT INTO compliance_logs (type, user_id, metadata)
  VALUES (
    'account_deleted',
    current_parent_id,
    jsonb_build_object('scope', 'parent')
  );

  DELETE FROM parents
  WHERE id = current_parent_id;

  DELETE FROM auth.users
  WHERE id = current_parent_id;
END;
$$;

GRANT EXECUTE ON FUNCTION delete_child_account(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION delete_parent_account() TO authenticated;
