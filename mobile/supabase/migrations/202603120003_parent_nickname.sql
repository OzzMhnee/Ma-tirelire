-- Ajout de la colonne parent_nickname sur la table children
ALTER TABLE children ADD COLUMN IF NOT EXISTS parent_nickname TEXT;
