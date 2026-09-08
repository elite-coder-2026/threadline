-- Minimal seed: two users, B follows A. Run after schema.sql:
--   psql "$DATABASE_URL" -f db/seed.sql
INSERT INTO users (id, handle, display_name) VALUES
    ('11111111-1111-1111-1111-111111111111', 'ada',  'Ada Lovelace'),
    ('22222222-2222-2222-2222-222222222222', 'alan', 'Alan Turing')
ON CONFLICT (id) DO NOTHING;

-- alan (follower) follows ada (followee)
INSERT INTO follows (follower_id, followee_id) VALUES
    ('22222222-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111111')
ON CONFLICT DO NOTHING;

-- Handy ids:
--   ADA  = 11111111-1111-1111-1111-111111111111
--   ALAN = 22222222-2222-2222-2222-222222222222
