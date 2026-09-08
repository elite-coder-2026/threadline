// Layer 1 — HTTP. Parse validated input, call the service, shape the response.
import type { Request, Response } from 'express';
import { commentsService } from '../services/comments.service.js';
import { requireUserId } from '../shared/current-user.js';
import { valid } from '../shared/validate.js';
import { commentParams, createCommentBody } from '../routes/comments.schemas.js';
import type { Comment } from '../models/comment.model.js';

const toCommentDto = (comment: Comment) => ({
  id: comment.id,
  postId: comment.postId,
  authorId: comment.authorId,
  authorHandle: comment.authorHandle,
  content: comment.content,
  createdAt: comment.createdAt.toISOString(),
});

const list = async (req: Request, res: Response): Promise<void> => {
  requireUserId(req);
  const { postId } = valid(res, 'params', commentParams);

  const comments = await commentsService.listComments({ postId });
  res.status(200).json({ items: comments.map(toCommentDto), nextCursor: null });
};

const create = async (req: Request, res: Response): Promise<void> => {
  const authorId = requireUserId(req);
  const { postId } = valid(res, 'params', commentParams);
  const { content } = valid(res, 'body', createCommentBody);

  const comment = await commentsService.addComment({ postId, authorId, content });
  res.status(201).json(toCommentDto(comment));
};

export const commentsController = { list, create };
