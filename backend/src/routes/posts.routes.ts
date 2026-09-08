// Layer 1 — HTTP wiring.
// Maps URLs + methods to: identity middleware -> shape validation -> controller.
import { Router } from 'express';
import { postsController } from '../controllers/posts.controller.js';
import { commentsController } from '../controllers/comments.controller.js';
import { currentUser } from '../shared/current-user.js';
import { asyncHandler } from '../shared/async-handler.js';
import { validate } from '../shared/validate.js';
import { createPostBody, timelineQuery, likeParams } from './posts.schemas.js';
import { commentParams, createCommentBody } from './comments.schemas.js';

export const postsRoutes = Router();

postsRoutes.use(currentUser);

// GET /api/posts/timeline  — fan-out-on-read timeline for the current user
postsRoutes.get(
  '/timeline',
  validate(timelineQuery, 'query'),
  asyncHandler(postsController.timeline),
);

// POST /api/posts  — create a post
postsRoutes.post(
  '/',
  validate(createPostBody, 'body'),
  asyncHandler(postsController.create),
);

// POST /api/posts/:postId/like  — like a post (idempotent)
postsRoutes.post(
  '/:postId/like',
  validate(likeParams, 'params'),
  asyncHandler(postsController.like),
);

// GET /api/posts/:postId/comments  — list replies, oldest first
postsRoutes.get(
  '/:postId/comments',
  validate(commentParams, 'params'),
  asyncHandler(commentsController.list),
);

// POST /api/posts/:postId/comments  — add a reply
postsRoutes.post(
  '/:postId/comments',
  validate(commentParams, 'params'),
  validate(createCommentBody, 'body'),
  asyncHandler(commentsController.create),
);
