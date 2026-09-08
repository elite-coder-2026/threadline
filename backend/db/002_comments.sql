-- Comments (replies). Idempotent migration.
--   psql "$DATABASE_URL" -f db/002_comments.sql
ALTER TABLE posts ADD COLUMN IF NOT EXISTS reply_count INTEGER NOT NULL DEFAULT 0;

CREATE TABLE IF NOT EXISTS comments (
    id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id    UUID NOT NULL REFERENCES posts (id) ON DELETE CASCADE,
    author_id  UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    content    TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_comments_post_created_at
    ON comments (post_id, created_at);

-- Backfill reply_count for any rows created before this migration.
UPDATE posts p
   SET reply_count = c.n
  FROM (SELECT post_id, COUNT(*)::int AS n FROM comments GROUP BY post_id) c
 WHERE c.post_id = p.id AND p.reply_count <> c.n;
