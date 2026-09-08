// Layer 1 — HTTP.
// Pulls already-validated data off the request, calls the service, and shapes
// the HTTP response. No business logic, no SQL. All handlers are async arrows.
import type { Request, Response } from 'express';
import { postsService } from '../services/posts.service.js';
import { requireUserId } from '../shared/current-user.js';
import { valid } from '../shared/validate.js';
import { createPostBody, timelineQuery, likeParams } from '../routes/posts.schemas.js';
import type { Post, TimelineItem } from '../models/post.model.js';

// Explicit wire shapes keep Date serialization predictable. `metadata` is
// already plain JSON (built by the enrichment layer), so it passes straight through.
const toPostDto = (post: Post) => ({
  id: post.id,
  authorId: post.authorId,
  postType: post.postType,
  content: post.content,
  metadata: post.metadata,
  likeCount: post.likeCount,
  repostCount: post.repostCount,
  replyCount: post.replyCount,
  createdAt: post.createdAt.toISOString(),
});

const toTimelineDto = (item: TimelineItem) => ({
  ...toPostDto(item),
  authorHandle: item.authorHandle,
});

const create = async (req: Request, res: Response): Promise<void> => {
  const authorId = requireUserId(req);
  const body = valid(res, 'body', createPostBody);

  const post = await postsService.createPost({ authorId, ...body });
  res.status(201).json(toPostDto(post));
};

const timeline = async (req: Request, res: Response): Promise<void> => {
  const userId = requireUserId(req);
  const { limit, before } = valid(res, 'query', timelineQuery);

  const items = await postsService.getTimeline({ userId, limit, before });
  // Paged envelope the client's useInfiniteQuery expects. TODO: wire
  // `before`-based cursors; for now every result is a single page.
  res.status(200).json({ items: items.map(toTimelineDto), nextCursor: null });
};

const like = async (req: Request, res: Response): Promise<void> => {
  const userId = requireUserId(req);
  const { postId } = valid(res, 'params', likeParams);

  const result = await postsService.likePost({ userId, postId });
  res.status(200).json(result);
};

export const postsController = { create, timeline, like };
