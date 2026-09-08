import { z } from 'zod';
import { detectVideo, isGithubRepoUrl } from '../shared/url.js';

// Layer 1 request-shape contracts. These describe HTTP payloads only —
// business rules (max length, "must exist", enrichment) live in the service.

const caption = z.string().max(500, 'caption cannot exceed 500 characters');

const textPost = z.object({
  postType: z.literal('text'),
  content: z.string().min(1, 'content is required').max(500),
});

const linkPost = z.object({
  postType: z.literal('link'),
  content: caption.optional().default(''),
  url: z.string().url('a valid URL is required'),
});

const githubPost = z.object({
  postType: z.literal('github'),
  content: caption.optional().default(''),
  url: z
    .string()
    .url('a valid URL is required')
    .refine(isGithubRepoUrl, 'must be a github.com/owner/repo URL'),
});

const videoPost = z.object({
  postType: z.literal('video'),
  content: caption.optional().default(''),
  url: z
    .string()
    .url('a valid URL is required')
    .refine((u) => detectVideo(u) !== null, 'must be an uploaded video file'),
});

// Back-compat: an old client posts `{ content }` with no postType — treat it as text.
export const createPostBody = z.preprocess(
  (value) =>
    value && typeof value === 'object' && !Array.isArray(value) && !('postType' in value)
      ? { ...(value as Record<string, unknown>), postType: 'text' }
      : value,
  z.discriminatedUnion('postType', [textPost, linkPost, githubPost, videoPost]),
);

export const timelineQuery = z.object({
  limit: z.coerce.number().int().positive().optional(),
  before: z.coerce.date().optional(),
});

export const likeParams = z.object({
  postId: z.string().uuid('postId must be a UUID'),
});

export type CreatePostBody = z.infer<typeof createPostBody>;
export type TimelineQuery = z.infer<typeof timelineQuery>;
export type LikeParams = z.infer<typeof likeParams>;
