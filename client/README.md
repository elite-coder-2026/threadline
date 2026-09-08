# thread-line client

React + TypeScript front end for the thread-line social app. Talks to the
4-layer REST backend in `../` (posts, timeline, likes, follows).

## Stack

- **Vite** + React 18, **TypeScript strict** (`strict`, `noImplicitAny`,
  `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`)
- **@tanstack/react-query v5** for every backend call — no raw `useEffect + fetch`
- **styled-components v6** (`DefaultTheme` typed via `src/styled.d.ts`)
- **react-router-dom v6**

## House rules (enforced by review)

1. **No naked components.** Every component renders `<Panel>` / `styled(Panel)` /
   `<Panel as="…">` as its outer element — visible padding, border, rounded corners.
   See `src/components/common/Panel.tsx`.
2. **No native `<select>` / `<option>`.** All dropdowns are built from
   `src/components/common/Dropdown.tsx` — a `div`-based listbox with local `open`
   state and a click-outside handler (`src/hooks/useClickOutside.ts`).
   `FeedSortDropdown` and `UserMenu` are thin presets over it.
3. **Async = arrow.** Every API call, query/mutation fn, and awaiting event
   handler is `const x = async () => {}`. No `async function` declarations.
   Grep gate: `grep -rn "async function" src` → no matches.
4. **Strict TS, no implicit any.** `npm run typecheck` must be clean.

## Run

```bash
npm install
cp .env.example .env      # set VITE_API_BASE_URL, VITE_DEV_USER_ID, VITE_DEV_USER_HANDLE
npm run typecheck         # strict, zero errors
npm run dev               # http://localhost:5173
```

Auth is a stub: `src/lib/httpClient.ts` sends `x-user-id: <VITE_DEV_USER_ID>` on
every request, matching the backend's `currentUser` middleware. Use a seeded id
(ADA = `11111111-1111-1111-1111-111111111111`).

## Layout (`src/`)

```
src/
├── main.tsx                       QueryClientProvider → ThemeProvider → GlobalStyle → App
├── App.tsx                        routes: / (Timeline), /u/:handle (ProfilePage)
├── theme.ts  styled.d.ts          design tokens + DefaultTheme augmentation
├── vite-env.d.ts                  typed import.meta.env
├── styles/global.ts
├── types/models.ts                User, Post, TimelineItem, Profile, SortOrder, Page<T>
├── lib/
│   ├── httpClient.ts              fetch wrapper (async arrows), ApiError, x-user-id
│   ├── queryClient.ts  queryKeys.ts  formatTime.ts
├── api/
│   ├── posts.api.ts               getTimelinePage, createPost, likePost, unlikePost, getUserPosts
│   └── follows.api.ts             getProfile, followUser, unfollowUser
├── hooks/
│   ├── useClickOutside.ts
│   ├── useTimeline.ts             useInfiniteQuery, keyed per sort order
│   ├── useUserPosts.ts            useInfiniteQuery, keyed per handle
│   ├── usePostMutations.ts        useCreatePost, useLikePost/useUnlikePost (optimistic cache writes)
│   ├── useProfile.ts
│   └── useFollowMutations.ts      useFollow/useUnfollow (optimistic)
└── components/
    ├── common/
    │   ├── Panel.tsx              REQUIRED container (Panel, PanelTight)
    │   ├── Dropdown.tsx           custom div-based listbox — the no-<select> base
    │   ├── Button.tsx  CharCounter.tsx  StatusPanel.tsx
    │   ├── UserMenu.tsx           Dropdown preset (user menu)
    │   └── NavBar.tsx
    ├── feed/
    │   ├── Timeline.tsx           wires useTimeline + FeedSortDropdown + PostComposer + PostCard list + IntersectionObserver
    │   ├── FeedSortDropdown.tsx   Dropdown preset: Latest / Most liked
    │   ├── PostComposer.tsx       280-char textarea, client validation, useCreatePost
    │   └── PostCard.tsx           author / content / time / LikeButton / reply count
    ├── post/LikeButton.tsx        reads likedByMe from props; no local liked state
    └── profile/
        ├── ProfilePage.tsx        route shell: useProfile + useUserPosts
        ├── ProfileHeader.tsx      counts + FollowButton
        └── FollowButton.tsx
```

## State flow: "did I like this post?"

`likedByMe` and `likeCount` are **not** component state. They are fields on each
timeline entry, and the single source of truth is the **React Query cache** for
`['timeline', sort]`.

- `PostCard` → `LikeButton` receive the `post` object as a prop and render
  `post.likedByMe` / `post.likeCount` directly. `LikeButton` has no `useState`.
- Clicking fires `useLikePost` / `useUnlikePost` (`src/hooks/usePostMutations.ts`).
  `onMutate` cancels in-flight timeline queries, snapshots every matching cache
  entry, then rewrites that post across **all** cached infinite pages
  (`patchPostInPages`) — flipping `likedByMe` and adjusting `likeCount`. The UI
  updates instantly because the cache changed, not because a component held state.
- `onError` restores the snapshots (rollback). `onSettled` calls
  `invalidateQueries(['timeline'])` so the server response reconciles the cache.

Net: no prop-drilling of like state, no local toggle that can drift from the
server, and every `PostCard` showing that post (feed and profile) stays in sync
because they all read the same cache.

## Backend endpoints this client expects

`GET /api/posts/timeline?sort=&before=&limit=` · `POST /api/posts` ·
`POST|DELETE /api/posts/:id/like` · `GET /api/users/:handle/posts` ·
`GET /api/profiles/:handle` · `POST|DELETE /api/follows/:userId`.

Timeline/post payloads are expected to include `likedByMe: boolean` and
`replyCount: number` (add via `LEFT JOIN likes` on the current user). Until the
backend exposes those, they default to `false` / `0` and the unlike path is
simply never taken.
