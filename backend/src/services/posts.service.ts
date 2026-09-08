// Layer 2 — Business Logic.
// Enforces domain rules. Calls repositories to read/write. Has NO knowledge of
// HTTP: no req/res, no status codes as numbers-with-meaning beyond AppError.
import { postsRepository } from '../repositories/posts.repository.js';
import type { Post, PostMetadata, TimelineItem } from '../models/post.model.js';
import { notFound, unprocessable } from '../shared/http-error.js';
import { enrichLinkPost, linkFallback } from './enrichment/enrichLinkPost.js';
import { enrichGithubPost, githubFallback } from './enrichment/enrichGithubPost.js';
import { enrichVideoPost } from './enrichment/enrichVideoPost.js';
import { parseGithubRepo } from '../shared/url.js';

const MAX_POST_LENGTH = 500;
const DEFAULT_TIMELINE_LIMIT = 20;
const MAX_TIMELINE_LIMIT = 100;

// Discriminated: text needs body content, the rest need a URL (caption optional).
export type CreatePostInput =
  | { authorId: string; postType: 'text'; content: string }
  | { authorId: string; postType: 'link'; content: string; url: string }
  | { authorId: string; postType: 'github'; content: string; url: string }
  | { authorId: string; postType: 'video'; content: string; url: string };

// Per-type enrichment dispatch. Each branch delegates to one small function so a
// new post type adds a case here and nothing else in this file changes.
const buildMetadata = async (input: CreatePostInput): Promise<PostMetadata> => {
  switch (input.postType) {
    case 'text':
      return null;
    case 'link':
      return enrichLinkPost(input.url);
    case 'github':
      return enrichGithubPost(input.url);
    case 'video':
      return enrichVideoPost(input.url);
  }
};

// `link` / `github` enrichment makes an external HTTP call. Instead of blocking
// post creation on it, we insert with this instant, no-network placeholder and
// fill in the real preview a moment later (see `enrichInBackground`).
const DEFERRED_TYPES = new Set<CreatePostInput['postType']>(['link', 'github']);

const placeholderMetadata = (input: CreatePostInput): PostMetadata => {
  switch (input.postType) {
    case 'link':
      return linkFallback(input.url);
    case 'github': {
      const ref = parseGithubRepo(input.url);
      return githubFallback(input.url, ref?.owner ?? '', ref?.repo ?? '');
    }
    default:
      return null;
  }
};

const enrichInBackground = async (
  postId: string,
  input: CreatePostInput,
): Promise<void> => {
  try {
    const metadata = await buildMetadata(input);
    await postsRepository.updateMetadata(postId, metadata);
    // eslint-disable-next-line no-console
    console.log('[enrichInBackground] done', {
      postId,
      postType: input.postType,
      status:
        metadata && 'enrichmentStatus' in metadata ? metadata.enrichmentStatus : 'n/a',
    });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('[enrichInBackground] threw', {
      postId,
      message: err instanceof Error ? err.message : String(err),
    });
    // The placeholder metadata stays in place — nothing else to do.
  }
};

// A deferred enrichment can be lost (backend restart, transient error, GitHub
// rate limit). When the timeline serves a link/github post that's still a
// placeholder, retry it once — throttled per post so a permanently-broken URL
// isn't refetched on every load.
const RETRY_COOLDOWN_MS = 60_000;
const lastEnrichAttempt = new Map<string, number>();

const retryStalePreviews = (items: TimelineItem[]): void => {
  const now = Date.now();
  for (const item of items) {
    if (item.postType !== 'link' && item.postType !== 'github') continue;
    if (item.metadata.enrichmentStatus !== 'failed') continue;
    if (now - (lastEnrichAttempt.get(item.id) ?? 0) < RETRY_COOLDOWN_MS) continue;

    lastEnrichAttempt.set(item.id, now);
    const base = {
      authorId: item.authorId,
      content: item.content,
      url: item.metadata.url,
    };
    void enrichInBackground(
      item.id,
      item.postType === 'github'
        ? { ...base, postType: 'github' }
        : { ...base, postType: 'link' },
    );
  }
};

interface GetTimelineInput {
  userId: string;
  limit?: number | undefined;
  before?: Date | undefined;
}

interface LikePostInput {
  userId: string;
  postId: string;
}

const createPost = async (input: CreatePostInput): Promise<Post> => {
  const content = input.content.trim();
  // Text posts still require a non-empty body; other types allow an empty caption.
  if (input.postType === 'text' && content.length === 0) {
    throw unprocessable('A post cannot be empty.');
  }
  if (content.length > MAX_POST_LENGTH) {
    throw unprocessable(`A post cannot exceed ${MAX_POST_LENGTH} characters.`);
  }

  // For text/video, metadata is built with no network call. For link/github the
  // real preview is fetched after the insert so the post appears immediately.
  const deferred = DEFERRED_TYPES.has(input.postType);
  // eslint-disable-next-line no-console
  console.log('[createPost] enrichment branch', {
    postType: input.postType,
    url: 'url' in input ? input.url : null,
    deferred,
  });
  const metadata = deferred ? placeholderMetadata(input) : await buildMetadata(input);

  const post = await postsRepository.insertPost({
    authorId: input.authorId,
    content,
    postType: input.postType,
    metadata,
  });

  if (deferred) {
    void enrichInBackground(post.id, input);
  }
  return post;
};

const getTimeline = async ({
  userId,
  limit,
  before,
}: GetTimelineInput): Promise<TimelineItem[]> => {
  const safeLimit = Math.min(
    Math.max(limit ?? DEFAULT_TIMELINE_LIMIT, 1),
    MAX_TIMELINE_LIMIT,
  );
  const items = await postsRepository.getTimelineForUser(userId, safeLimit, before);
  retryStalePreviews(items);
  return items;
};

const likePost = async ({ userId, postId }: LikePostInput): Promise<{ liked: boolean }> => {
  const post = await postsRepository.getPostById(postId);
  if (!post) {
    throw notFound('Post not found.');
  }
  const liked = await postsRepository.insertLike(userId, postId);
  // Only move the counter when the like is new — keeps the action idempotent.
  if (liked) {
    await postsRepository.incrementLikeCount(postId);
  }
  return { liked };
};

export const postsService = {
  createPost,
  getTimeline,
  likePost,
};
