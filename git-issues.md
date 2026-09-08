# GitHub post preview — what was actually wrong

## Symptom

Two posts that both pointed at GitHub repos rendered differently:

- `github.com/elite-coder-2026/dev-conn` → rich card **with a preview image**
- `github.com/elite-coder-2026/learnhub` → plain text card, **no image** ("no preview")

## Root cause

**The two posts are different post *types*. Nothing was failing.**

| Post | `post_type` | Rendered by | Has image? |
|------|-------------|-------------|------------|
| `dev-conn` | `link` | `LinkPostBody` | Yes — `metadata.image` |
| `learnhub` | `github` | `GithubPostBody` | No — component had no `<img>` at all |

- `dev-conn` was created with post type **Link**. `enrichLinkPost` fetched the page,
  scraped its OpenGraph tags, and stored
  `image: "https://opengraph.githubassets.com/…"`, `title: "GitHub - elite-coder-2026/dev-conn"`.
  `LinkPostBody` renders that image as a thumbnail → looks like a full preview.
- `learnhub` was created with post type **GitHub**. `enrichGithubPost` called
  `GET https://api.github.com/repos/elite-coder-2026/learnhub` and **succeeded** —
  `enrichmentStatus: "ok"`, `stars: 0`, `language: "TypeScript"`, full `description`.
  But the GitHub REST API does not return a social image, and `GithubPostBody.tsx`
  had **no image element**, so the card was only ever text. Next to the link card
  it looked broken/empty.

### Evidence (pulled from the live DB + API, not guessed)

```
id ab78a2c0…  post_type = github   url .../learnhub
  metadata: { repo, owner, stars: 0, language: "TypeScript",
              description: "Production-grade full-stack LMS…",
              enrichmentStatus: "ok" }          ← enrichment WORKED

id 6ae9121d…  post_type = link     url .../dev-conn
  metadata: { image: "https://opengraph.githubassets.com/…",
              title: "GitHub - elite-coder-2026/dev-conn",
              domain: "github.com",
              enrichmentStatus: "ok" }
```

`GET /api/posts/timeline` returned complete, `"ok"` metadata for **both** posts.

## What it was NOT

- **Not** a failed GitHub API call — the call for `learnhub` returned 200 with full data.
- **Not** GitHub rate limiting — `enrichmentStatus` was `"ok"`, not `"failed"`.
- **Not** lost/fire-and-forget background enrichment — the row was fully enriched.
- **Not** a stale client cache.

Those were earlier hypotheses; inspecting the actual rows ruled them out.

## Fix applied

Give the GitHub card the same preview image the link card gets, with no extra API call
(GitHub serves the repo's social card at `opengraph.githubassets.com/<anything>/<owner>/<repo>`;
the first path segment is only a cache key):

| File | Change |
|------|--------|
| `backend/src/models/post.model.ts` | `GithubMetadata` gains `image: string \| null` |
| `client/src/types/models.ts` | same field on the client mirror type |
| `backend/src/services/enrichment/enrichGithubPost.ts` | sets `image = https://opengraph.githubassets.com/1/<owner>/<repo>` on both the success and fallback paths; also added `[enrichGithubPost]` logging (parsed owner/repo, API status, `x-ratelimit-*` headers, response body on non-2xx, thrown-error name+message) |
| `client/src/components/post/GithubPostBody.tsx` | renders `metadata.image` as a `<Thumb>` at the top of the card |
| `backend/src/services/posts.service.ts` | `[createPost] enrichment branch` + `[enrichInBackground]` logging so the chosen enrichment path for every new post is visible |

### DB backfill

Existing `github` rows predate the `image` field, so they were patched in place:

```sql
UPDATE posts
SET metadata = metadata || jsonb_build_object(
  'image',
  'https://opengraph.githubassets.com/1/' || (metadata->>'owner') || '/' || (metadata->>'repo')
)
WHERE post_type = 'github' AND metadata ? 'owner' AND NOT (metadata ? 'image');
-- UPDATE 2  (react, learnhub)
```

## To verify

1. Restart the backend, hard-refresh the client.
2. `learnhub` now shows GitHub's preview image, same as `dev-conn`.
3. New GitHub posts: backend logs show
   `[createPost] enrichment branch { postType: 'github', … }` followed by
   `[enrichGithubPost] response { status: 200, rateLimitRemaining: … }`.

## Unrelated note

`GITHUB_TOKEN` is not set in `backend/.env`. The GitHub API is currently limited to
60 requests/hour unauthenticated. Not the cause of this issue, but worth setting
(a scopeless classic token raises it to 5,000/hour; the code already uses it).
