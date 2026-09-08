// Layer 2 — Business Logic. No HTTP, no SQL.
import { commentsRepository } from '../repositories/comments.repository.js';
import { postsRepository } from '../repositories/posts.repository.js';
import type { Comment } from '../models/comment.model.js';
import { notFound, unprocessable } from '../shared/http-error.js';

const MAX_COMMENT_LENGTH = 500;

interface AddCommentInput {
  postId: string;
  authorId: string;
  content: string;
}

interface ListCommentsInput {
  postId: string;
}

const addComment = async ({ postId, authorId, content }: AddCommentInput): Promise<Comment> => {
  const trimmed = content.trim();
  if (trimmed.length === 0) {
    throw unprocessable('A comment cannot be empty.');
  }
  if (trimmed.length > MAX_COMMENT_LENGTH) {
    throw unprocessable(`A comment cannot exceed ${MAX_COMMENT_LENGTH} characters.`);
  }

  const post = await postsRepository.getPostById(postId);
  if (!post) {
    throw notFound('Post not found.');
  }

  const comment = await commentsRepository.insertComment(postId, authorId, trimmed);
  await commentsRepository.incrementReplyCount(postId);
  return comment;
};

const listComments = async ({ postId }: ListCommentsInput): Promise<Comment[]> => {
  const post = await postsRepository.getPostById(postId);
  if (!post) {
    throw notFound('Post not found.');
  }
  return commentsRepository.getCommentsForPost(postId);
};

export const commentsService = {
  addComment,
  listComments,
};
