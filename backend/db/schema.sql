-- Thread-line schema. Run with:  psql "$DATABASE_URL" -f db/schema.sql
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS users (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    handle       TEXT NOT NULL UNIQUE,
    display_name TEXT NOT NULL,
    created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS posts (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    author_id     UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    content       TEXT NOT NULL,
    post_type     TEXT NOT NULL DEFAULT 'text'
                  CHECK (post_type IN ('text', 'link', 'github', 'video')),
    metadata      JSONB,
    like_count    INTEGER NOT NULL DEFAULT 0,
    repost_count  INTEGER NOT NULL DEFAULT 0,
    reply_count   INTEGER NOT NULL DEFAULT 0,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS comments (
    id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id    UUID NOT NULL REFERENCES posts (id) ON DELETE CASCADE,
    author_id  UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    content    TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS follows (
    follower_id  UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    followee_id  UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY (follower_id, followee_id),
    CHECK (follower_id <> followee_id)
);

CREATE TABLE IF NOT EXISTS likes (
    user_id     UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    post_id     UUID NOT NULL REFERENCES posts (id) ON DELETE CASCADE,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY (user_id, post_id)
);

-- Fan-out-on-read timeline query walks posts by author + recency.
CREATE INDEX IF NOT EXISTS idx_posts_author_created_at
    ON posts (author_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_follows_follower
    ON follows (follower_id);

CREATE INDEX IF NOT EXISTS idx_comments_post_created_at
    ON comments (post_id, created_at);
