-- Multiple post types. Idempotent migration.
--   psql "$DATABASE_URL" -f db/003_post_types.sql
ALTER TABLE posts ADD COLUMN IF NOT EXISTS post_type TEXT NOT NULL DEFAULT 'text'
  CHECK (post_type IN ('text', 'link', 'github', 'video'));

ALTER TABLE posts ADD COLUMN IF NOT EXISTS metadata JSONB;

-- Existing rows are plain text with no metadata; the defaults above cover them.
