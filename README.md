# Thread-line

A small social feed / microblogging app — post text, links, GitHub repos, and
videos; follow people; like and reply. Built as a demonstration of a strict
layered backend architecture with a typed React client.

- **Backend** — Node.js + TypeScript + Express + PostgreSQL, organised into four
  strict layers (HTTP → business logic → data access → domain).
- **Client** — React + Vite + TypeScript, TanStack Query for server state,
  styled-components for styling, React Router for navigation.

## Features

- **Four post types**, each with server-side enrichment:
  - `text` — plain post
  - `link` — fetches the target page and scrapes OpenGraph/Twitter meta (title,
    description, image)
  - `github` — calls the GitHub REST API for stars, language, and description,
    plus the repo's social preview image
  - `video` — upload a file from your device (mp4/webm/ogg/mov); stored on local
    disk and played inline with a native `<video>` element
- **Non-blocking enrichment** — `link` / `github` posts are saved immediately with
  a placeholder card; the real preview is fetched in the background and patched
  in, so posting never waits on a third-party request. Stale placeholders are
  retried on timeline reads.
- **Timeline** — fan-out-on-read feed of your own posts plus everyone you follow,
  sortable by newest or most-liked, with infinite scroll.
- **Likes** — idempotent, optimistic on the client.
- **Comments** — expandable reply threads per post.
- **Floating composer** — a `+` action button pinned to the bottom-left opens the
  post composer in a popover.

## Tech stack

| | |
|---|---|
| Language | TypeScript (ESM, Node ≥ 20) |
| Backend | Express 4, `pg`, Zod (request validation), `node-html-parser` (link scraping), Multer (uploads) |
| Database | PostgreSQL 16/17 |
| Client | React 18, Vite 5, TanStack Query 5, styled-components 6, React Router 6 |
| Dev auth | `x-user-id` header stub (no real auth layer) |

## Project layout

```
backend/
  src/
    routes/          Layer 1 — HTTP wiring + Zod request schemas
    controllers/     Layer 1 — pull validated input, call a service, shape the response
    services/        Layer 2 — business rules; no req/res, no SQL
      enrichment/    per-post-type metadata builders (link, github, video)
    repositories/    Layer 3 — the only place raw SQL lives
    models/          Layer 4 — pure domain types, no logic
    shared/          cross-cutting helpers (errors, url parsing, current user)
    config/          typed, validated view of process.env
    db/              schema.sql + numbered migrations + seed.sql
client/
  src/
    api/             one file per resource; thin fetch wrappers
    hooks/           TanStack Query hooks
    components/
      feed/          Timeline, PostCard, PostComposer, FloatingComposer
      post/          per-type post bodies (LinkPostBody, GithubPostBody, VideoPostBody)
      comment/       reply threads
      common/        Button, Panel, Dropdown, …
    lib/             framework-agnostic helpers
```

## Getting started

### Prerequisites

- Node.js ≥ 20
- PostgreSQL 16+ (or Docker, via the included `compose.yml`)
- `psql` on your `PATH` (used by the `db:init` / `db:seed` scripts)

### 1. Database

```bash
cd backend
cp .env.example .env          # adjust DATABASE_URL if needed

# Option A — Docker
npm run db:up

# Option B — use an existing local Postgres and create the DB/user yourself
#   createuser threadline --pwprompt
#   createdb threadline -O threadline

npm run db:init               # apply db/schema.sql
npm run db:seed               # optional demo data (creates user @ada)
```

Apply the numbered migrations in `backend/db/` in order if you're upgrading an
existing database:

```bash
psql "$DATABASE_URL" -f db/002_comments.sql
psql "$DATABASE_URL" -f db/003_post_types.sql
```

### 2. Backend

```bash
cd backend
npm install
npm run dev                   # tsx watch, serves http://localhost:3000
```

Environment variables (`backend/.env`):

| Variable | Default | Purpose |
|---|---|---|
| `PORT` | `3000` | HTTP port |
| `DATABASE_URL` | — | **required** — Postgres connection string |
| `GITHUB_TOKEN` | _(none)_ | optional PAT; raises the GitHub API limit from 60 → 5,000 req/hr for `github` post enrichment |
| `UPLOAD_DIR` | `uploads` | local directory for uploaded video files |
| `MAX_UPLOAD_BYTES` | `52428800` | upload size cap (50 MB) |
| `PUBLIC_BASE_URL` | `http://localhost:$PORT` | absolute base used to build public URLs for uploaded files |

### 3. Client

```bash
cd client
npm install
cp .env.example .env
npm run dev                   # Vite, serves http://localhost:5173
```

Environment variables (`client/.env`):

| Variable | Purpose |
|---|---|
| `VITE_API_BASE_URL` | backend origin (`http://localhost:3000`) |
| `VITE_DEV_USER_ID` | dev auth stub — must match a seeded user id |
| `VITE_DEV_USER_HANDLE` | display handle for that user |

## API

All routes are under `/api` and require an `x-user-id` header (dev auth stub).

| Method | Path | Description |
|---|---|---|
| `GET` | `/api/posts/timeline?sort=latest\|most_liked&limit=&before=` | fan-out-on-read timeline |
| `POST` | `/api/posts` | create a post (`text` / `link` / `github` / `video`) |
| `POST` | `/api/posts/:postId/like` | like a post (idempotent) |
| `GET` | `/api/posts/:postId/comments` | list replies, oldest first |
| `POST` | `/api/posts/:postId/comments` | add a reply |
| `POST` | `/api/uploads` | upload one video file (`multipart/form-data`, field `file`); returns `{ url, … }` |

Uploaded files are served statically from `/uploads/<filename>`.

## Scripts

**backend**

| Script | Action |
|---|---|
| `npm run dev` | watch mode (`tsx`) |
| `npm run build` | `tsc` → `dist/` |
| `npm start` | run the built server |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run db:up` / `db:down` | start/stop the Docker Postgres |
| `npm run db:init` / `db:seed` | apply schema / seed demo data |

**client**

| Script | Action |
|---|---|
| `npm run dev` | Vite dev server |
| `npm run build` | typecheck + production build |
| `npm run preview` | serve the production build |
| `npm run typecheck` | `tsc --noEmit` |

## Architecture notes

The backend enforces a one-directional dependency flow:

```
routes ─▶ controllers ─▶ services ─▶ repositories ─▶ (database)
                              │
                              ▼
                           models  ◀── imported by every layer, imports nothing
```

- Controllers never contain business logic or SQL.
- Services never see `req` / `res` or HTTP status codes (they throw typed
  `AppError`s that the error middleware maps).
- Repositories are the only place raw SQL is written; they map `snake_case` rows
  to `camelCase` domain types.
- Post metadata is a discriminated union keyed on `postType`, preserved end to end
  from the database row through to the React render component.

## License

Private / unlicensed — personal project.
