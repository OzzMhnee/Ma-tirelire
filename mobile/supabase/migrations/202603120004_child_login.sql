-- ============================================================
-- MaTirelire — Migration 004 : Connexion enfant autonome
-- RPCs accessibles en mode anon pour permettre aux enfants
-- de se connecter sans session parent.
-- ============================================================

-- ───────────────────────────────────────────────────────────
-- verify_child_pin_anon : vérifie pseudo + PIN, retourne les données enfant
-- ───────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION verify_child_pin_anon(p_pseudonym TEXT, p_pin TEXT)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE
  v_child RECORD;
BEGIN
  IF p_pseudonym IS NULL OR p_pin IS NULL OR p_pin !~ '^\d{4}$' THEN
    RAISE EXCEPTION 'Pseudo et code PIN (4 chiffres) requis.';
  END IF;

  SELECT * INTO v_child
  FROM children
  WHERE pseudonym = p_pseudonym
    AND child_pin_hash IS NOT NULL
  LIMIT 1;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Identifiants invalides.';
  END IF;

  IF v_child.child_pin_hash != extensions.crypt(p_pin, v_child.child_pin_hash) THEN
    RAISE EXCEPTION 'Identifiants invalides.';
  END IF;

  RETURN json_build_object(
    'id', v_child.id,
    'parent_id', v_child.parent_id,
    'pseudonym', v_child.pseudonym,
    'birth_year', v_child.birth_year,
    'parent_nickname', v_child.parent_nickname,
    'avatar_id', v_child.avatar_id,
    'theme_id', v_child.theme_id,
    'level', v_child.level,
    'experience', v_child.experience,
    'settings', v_child.settings,
    'created_at', v_child.created_at
  );
END;
$$;

-- ───────────────────────────────────────────────────────────
-- get_child_data_anon : retourne missions + solde + wishlist
-- pour un enfant identifié par son UUID.
-- ───────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION get_child_data_anon(p_child_id UUID)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_balance NUMERIC;
  v_missions JSON;
  v_wishlist JSON;
BEGIN
  -- Vérifier que l'enfant existe
  IF NOT EXISTS (SELECT 1 FROM children WHERE id = p_child_id) THEN
    RAISE EXCEPTION 'Enfant introuvable.';
  END IF;

  -- Solde
  SELECT COALESCE(balance, 0) INTO v_balance
  FROM child_balances WHERE child_id = p_child_id;

  -- Missions (pending uniquement)
  SELECT COALESCE(json_agg(row_to_json(m)), '[]'::json)
  INTO v_missions
  FROM (
    SELECT id, parent_id, child_id, title, description, reward, status,
           created_at, completed_at, validated_at, validated_by
    FROM missions
    WHERE child_id = p_child_id AND status IN ('pending', 'completed')
    ORDER BY created_at DESC
  ) m;

  -- Wishlist
  SELECT COALESCE(json_agg(row_to_json(w)), '[]'::json)
  INTO v_wishlist
  FROM (
    SELECT *
    FROM wishlist_progress
    WHERE child_id = p_child_id AND purchased_at IS NULL
    ORDER BY added_at DESC
  ) w;

  RETURN json_build_object(
    'balance', v_balance,
    'missions', v_missions,
    'wishlist', v_wishlist
  );
END;
$$;

-- ───────────────────────────────────────────────────────────
-- child_add_wish_anon : permet à un enfant connecté d'ajouter un souhait
-- ───────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION child_add_wish_anon(
  p_child_id UUID,
  p_name TEXT,
  p_price NUMERIC,
  p_image_url TEXT DEFAULT NULL
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_item RECORD;
BEGIN
  IF NOT EXISTS (SELECT 1 FROM children WHERE id = p_child_id) THEN
    RAISE EXCEPTION 'Enfant introuvable.';
  END IF;

  INSERT INTO wishlists (child_id, product_name, product_price, product_image_url)
  VALUES (p_child_id, p_name, p_price, p_image_url)
  RETURNING * INTO v_item;

  RETURN row_to_json(v_item);
END;
$$;

-- ───────────────────────────────────────────────────────────
-- Grants : accessibles en anon ET authenticated
-- ───────────────────────────────────────────────────────────
GRANT EXECUTE ON FUNCTION verify_child_pin_anon(TEXT, TEXT) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION get_child_data_anon(UUID) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION child_add_wish_anon(UUID, TEXT, NUMERIC, TEXT) TO anon, authenticated;

NOTIFY pgrst, 'reload schema';
