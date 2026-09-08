import { z } from 'zod';

// Layer 1 request-shape contracts for comments. HTTP payload shape only.
export const commentParams = z.object({
  postId: z.string().uuid('postId must be a UUID'),
});

export const createCommentBody = z.object({
  content: z.string().min(1, 'content is required'),
});

export type CommentParams = z.infer<typeof commentParams>;
export type CreateCommentBody = z.infer<typeof createCommentBody>;
