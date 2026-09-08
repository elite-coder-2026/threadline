# thread-line

A small Node.js + TypeScript backend built as a **strict 4-layer architecture**.
Each layer has one job and imports **only** from the layer directly below it.

```
HTTP request
   │
   ▼
Layer 1  Routes / Controllers   src/routes, src/controllers
         parse + validate shape, call a service, format the response
   │  (plain args / DTOs — no req/res below this line)
   ▼
Layer 2  Services               src/services
         business rules ("no empty post", "like increments a counter once")
   │  (domain method calls — no SQL below this line)
   ▼
Layer 3  Repositories           src/repositories
         parameterized SQL via pg, one query concern per method, rows → types
   │  (typed domain objects)
   ▼
Layer 4  Models / Types         src/models
         interfaces for Post, User, Follow, Like — shape only, no logic
```

Rules enforced in this repo:

- `strict: true` (plus `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`).
- Every async function is an **arrow function** — no `async function` declarations.
- No layer skipping: a controller never touches `pg`; a service never sees `req`/`res`;
  a repository holds no business rules; a model imports nothing.
- `src/db/pool.ts` (the pg pool) is infrastructure and is imported **only** by
  repositories — plus `src/index.ts`, the bootstrap, which closes it on shutdown.

## Run it

```bash
cp .env.example .env
npm install
npm run db:up                 # Postgres 16 in Docker
npm run db:init               # loads db/schema.sql
npm run db:seed               # 2 users; ALAN follows ADA
npm run dev                   # http://localhost:3000
```

`db:init` / `db:seed` use `psql` against `$DATABASE_URL`. If you don't have `psql`
locally: `docker compose exec -T db psql -U threadline -d threadline < db/schema.sql`.

IDs from the seed:

- `ADA`  = `11111111-1111-1111-1111-111111111111`
- `ALAN` = `22222222-2222-2222-2222-222222222222`

## The vertical slice

Auth is stubbed: send your user id in the `x-user-id` header.

```bash
# create a post as ADA
curl -X POST localhost:3000/api/posts \
  -H 'content-type: application/json' \
  -H 'x-user-id: 11111111-1111-1111-1111-111111111111' \
  -d '{"content":"hello world"}'

# ALAN's fan-out-on-read timeline (ALAN follows ADA) — newest first
curl localhost:3000/api/posts/timeline \
  -H 'x-user-id: 22222222-2222-2222-2222-222222222222'

# ALAN likes that post (idempotent: repeat → {"liked":false}, count unchanged)
curl -X POST localhost:3000/api/posts/<POST_ID>/like \
  -H 'x-user-id: 22222222-2222-2222-2222-222222222222'
```

Expected failures: empty content → `422`, missing `x-user-id` → `401`,
malformed body → `400`, like on a non-existent post → `404`.

## Build

```bash
npm run build      # tsc, strict — zero errors is the proof the layering holds
```

## Adding a feature (e.g. "reposts") — same four steps

1. **Model** — `src/models/repost.model.ts`: `interface Repost { userId; postId; createdAt }`.
   `Post` already carries `repostCount`.
2. **Repository** — add `insertRepost(userId, postId)` and `incrementRepostCount(postId)`
   to `posts.repository.ts` (or a new `reposts.repository.ts`). One parameterized query each,
   no rules.
3. **Service** — `reposts.service.ts`: the rule "a repost creates a feed entry and bumps the
   counter once" — orchestrate the repo calls, throw `AppError` for bad states. No SQL, no HTTP.
4. **Controller / Route** — `reposts.controller.ts` + `reposts.routes.ts`: a Zod schema for
   `:postId`, call `repostsService.repost(...)`, return `201`. Mount it in `src/routes/index.ts`.

The request still flows route → service → repository → model, one hop at a time.
