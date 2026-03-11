-- ============================================================
--  MaTirelire — Migration 001 : Schéma initial
--  © 2025 OzzMhnee — CONFIDENTIEL
--
--  Corrige :
--  - Colonne `username` manquante sur parents
--  - Policies RLS INSERT/UPDATE manquantes sur parents
--  - Toutes les tables avec RLS complet
-- ============================================================

-- Extension UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─── ENUMS ───────────────────────────────────────────────────
CREATE TYPE transaction_type AS ENUM (
  'mission_reward',
  'manual_deposit',
  'manual_withdrawal',
  'goal_purchase'
);

CREATE TYPE mission_status AS ENUM (
  'pending',
  'completed',
  'validated',
  'rejected'
);

CREATE TYPE achievement_type AS ENUM (
  'badge',
  'avatar',
  'theme'
);

CREATE TYPE compliance_event_type AS ENUM (
  'consent_given',
  'account_created',
  'account_deleted',
  'data_exported',
  'pin_changed'
);

-- ─── TABLE : parents ──────────────────────────────────────────
CREATE TABLE parents (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email      TEXT UNIQUE NOT NULL,
  -- username pour connexion par pseudonyme (en plus de l'email)
  username   TEXT UNIQUE,
  settings   JSONB NOT NULL DEFAULT '{"language":"fr","notifications":true,"theme":"light"}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT valid_email    CHECK (email    ~* '^[A-Za-z0-9._%+\-]+@[A-Za-z0-9.\-]+\.[A-Za-z]{2,}$'),
  CONSTRAINT valid_username CHECK (username IS NULL OR (LENGTH(username) BETWEEN 3 AND 30 AND username ~ '^[a-zA-Z0-9_\-]+$'))
);

CREATE INDEX idx_parents_username ON parents(username) WHERE username IS NOT NULL;

ALTER TABLE parents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "parents_select_own"
  ON parents FOR SELECT
  USING (auth.uid() = id);

-- ⚠️ Permet l'INSERT uniquement si l'id correspond à l'utilisateur authentifié
CREATE POLICY "parents_insert_own"
  ON parents FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "parents_update_own"
  ON parents FOR UPDATE
  USING (auth.uid() = id);

-- ─── TABLE : consents (preuve RGPD immuable) ─────────────────
CREATE TABLE consents (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id        UUID NOT NULL REFERENCES parents(id) ON DELETE CASCADE,
  consent_version  TEXT NOT NULL,
  consent_text     TEXT NOT NULL,           -- texte légal intégral accepté
  consent_method   TEXT NOT NULL,           -- 'email_code' | 'pin' | 'magic_link'
  email            TEXT NOT NULL,
  ip_address       INET,
  user_agent       TEXT,
  consented_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT valid_version CHECK (consent_version ~ '^\d+\.\d+$')
);

CREATE INDEX idx_consents_parent ON consents(parent_id);
CREATE INDEX idx_consents_date   ON consents(consented_at DESC);

ALTER TABLE consents ENABLE ROW LEVEL SECURITY;

-- Lecture uniquement — aucune modification (preuve immuable)
CREATE POLICY "consents_select_own"
  ON consents FOR SELECT
  USING (parent_id = auth.uid());

CREATE POLICY "consents_insert_own"
  ON consents FOR INSERT
  WITH CHECK (parent_id = auth.uid());

-- ─── TABLE : children ────────────────────────────────────────
CREATE TABLE children (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id         UUID NOT NULL REFERENCES parents(id) ON DELETE CASCADE,
  pseudonym         TEXT NOT NULL,
  birth_year        INTEGER CHECK (birth_year >= 2000 AND birth_year <= EXTRACT(YEAR FROM CURRENT_DATE)::integer),
  avatar_id         TEXT NOT NULL DEFAULT 'default',
  theme_id          TEXT NOT NULL DEFAULT 'blue',
  level             INTEGER NOT NULL DEFAULT 1 CHECK (level >= 1),
  experience        INTEGER NOT NULL DEFAULT 0 CHECK (experience >= 0),
  settings          JSONB NOT NULL DEFAULT '{"font":"arial","language":"fr"}'::jsonb,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  -- Pas de nom, prénom, adresse (minimisation RGPD)
  CONSTRAINT valid_pseudonym CHECK (LENGTH(pseudonym) BETWEEN 2 AND 30)
);

CREATE INDEX idx_children_parent ON children(parent_id);

ALTER TABLE children ENABLE ROW LEVEL SECURITY;

CREATE POLICY "children_all_by_parent"
  ON children FOR ALL
  USING (parent_id = auth.uid())
  WITH CHECK (parent_id = auth.uid());

-- ─── TABLE : transactions (ledger immuable) ──────────────────
CREATE TABLE transactions (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id     UUID NOT NULL REFERENCES children(id) ON DELETE CASCADE,
  type         transaction_type NOT NULL,
  amount       DECIMAL(10,2) NOT NULL,    -- peut être négatif (retrait)
  description  TEXT NOT NULL,
  reference_id UUID,                       -- ID mission ou wishlist liés
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by   UUID REFERENCES parents(id) ON DELETE SET NULL
);

CREATE INDEX idx_transactions_child ON transactions(child_id, created_at DESC);

ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "transactions_select_by_parent"
  ON transactions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM children
      WHERE children.id = transactions.child_id
        AND children.parent_id = auth.uid()
    )
  );

CREATE POLICY "transactions_insert_by_parent"
  ON transactions FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM children
      WHERE children.id = transactions.child_id
        AND children.parent_id = auth.uid()
    )
  );
-- Pas d'UPDATE ni DELETE : le ledger est immuable

-- Vue : solde calculé en temps réel via SUM
CREATE VIEW child_balances AS
SELECT
  child_id,
  COALESCE(SUM(amount), 0)::DECIMAL(10,2) AS balance
FROM transactions
GROUP BY child_id;

-- ─── TABLE : missions ────────────────────────────────────────
CREATE TABLE missions (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id    UUID NOT NULL REFERENCES parents(id)   ON DELETE CASCADE,
  child_id     UUID NOT NULL REFERENCES children(id)  ON DELETE CASCADE,
  title        TEXT NOT NULL CHECK (LENGTH(title) BETWEEN 2 AND 100),
  description  TEXT,
  reward       DECIMAL(10,2) NOT NULL CHECK (reward > 0 AND reward <= 9999.99),
  status       mission_status NOT NULL DEFAULT 'pending',
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  validated_at TIMESTAMPTZ,
  validated_by UUID REFERENCES parents(id),
  -- Cohérence de workflow
  CONSTRAINT valid_workflow CHECK (
    NOT (status = 'completed'  AND completed_at IS NULL) AND
    NOT (status = 'validated'  AND validated_at IS NULL) AND
    NOT (status = 'validated'  AND validated_by IS NULL)
  )
);

CREATE INDEX idx_missions_child_status ON missions(child_id, status, created_at DESC);
CREATE INDEX idx_missions_parent       ON missions(parent_id);

ALTER TABLE missions ENABLE ROW LEVEL SECURITY;

-- Le parent voit toutes ses missions
CREATE POLICY "missions_select_parent"
  ON missions FOR SELECT
  USING (parent_id = auth.uid());

-- L'enfant (via le parent connecté) peut voir ses propres missions
CREATE POLICY "missions_select_child"
  ON missions FOR SELECT
  USING (
    child_id IN (SELECT id FROM children WHERE parent_id = auth.uid())
  );

CREATE POLICY "missions_all_parent"
  ON missions FOR ALL
  USING (parent_id = auth.uid())
  WITH CHECK (parent_id = auth.uid());

-- ─── TABLE : wishlists ───────────────────────────────────────
CREATE TABLE wishlists (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id           UUID NOT NULL REFERENCES children(id) ON DELETE CASCADE,
  product_name       TEXT NOT NULL CHECK (LENGTH(product_name) BETWEEN 1 AND 200),
  product_image_url  TEXT,
  product_price      DECIMAL(10,2) NOT NULL CHECK (product_price > 0),
  product_currency   TEXT NOT NULL DEFAULT 'EUR',
  product_source     TEXT,                -- 'amazon', 'cdiscount', etc.
  product_ref        TEXT,                -- référence externe
  added_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  purchased_at       TIMESTAMPTZ,
  notes              TEXT
);

CREATE INDEX idx_wishlists_child ON wishlists(child_id, added_at DESC);

ALTER TABLE wishlists ENABLE ROW LEVEL SECURITY;

CREATE POLICY "wishlists_all_by_parent"
  ON wishlists FOR ALL
  USING (
    child_id IN (SELECT id FROM children WHERE parent_id = auth.uid())
  )
  WITH CHECK (
    child_id IN (SELECT id FROM children WHERE parent_id = auth.uid())
  );

-- Vue : progression wishlist avec balance courante
CREATE VIEW wishlist_progress AS
SELECT
  w.*,
  COALESCE(b.balance, 0)                                    AS current_balance,
  ROUND((COALESCE(b.balance, 0) / w.product_price) * 100, 2) AS progress_percent,
  COALESCE(b.balance, 0) >= w.product_price                 AS can_afford
FROM wishlists w
LEFT JOIN child_balances b ON b.child_id = w.child_id;

-- ─── TABLE : achievements ────────────────────────────────────
CREATE TABLE achievements (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id    UUID NOT NULL REFERENCES children(id) ON DELETE CASCADE,
  type        achievement_type NOT NULL,
  item_id     TEXT NOT NULL,
  unlocked_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (child_id, item_id)
);

CREATE INDEX idx_achievements_child ON achievements(child_id);

ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "achievements_select_by_parent"
  ON achievements FOR SELECT
  USING (
    child_id IN (SELECT id FROM children WHERE parent_id = auth.uid())
  );

CREATE POLICY "achievements_insert_by_parent"
  ON achievements FOR INSERT
  WITH CHECK (
    child_id IN (SELECT id FROM children WHERE parent_id = auth.uid())
  );

-- ─── TABLE : compliance_logs (audit RGPD immuable) ───────────
CREATE TABLE compliance_logs (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type       compliance_event_type NOT NULL,
  user_id    UUID NOT NULL,
  metadata   JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_compliance_user ON compliance_logs(user_id, created_at DESC);

ALTER TABLE compliance_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "compliance_select_own"
  ON compliance_logs FOR SELECT
  USING (user_id = auth.uid());

-- INSERT ouvert aux fonctions Edge (service role) uniquement
-- Pas d'UPDATE ni DELETE (immuable pour audit)
