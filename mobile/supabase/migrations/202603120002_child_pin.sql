-- ============================================================
-- MaTirelire — Migration 002 : Code PIN enfant
-- ============================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;

ALTER TABLE children
  ADD COLUMN IF NOT EXISTS child_pin_hash TEXT,
  ADD COLUMN IF NOT EXISTS child_pin_updated_at TIMESTAMPTZ;

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

GRANT EXECUTE ON FUNCTION set_child_pin(UUID, TEXT) TO authenticated;
