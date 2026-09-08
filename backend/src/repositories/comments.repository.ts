// Layer 3 — Data Access. Parameterized SQL only; one query concern per method.
import { query } from '../db/pool.js';
import type { Comment } from '../models/comment.model.js';

interface CommentRow {
  id: string;
  post_id: string;
  author_id: string;
  author_handle: string;
  content: string;
  created_at: Date;
}

const rowToComment = (row: CommentRow): Comment => ({
  id: row.id,
  postId: row.post_id,
  authorId: row.author_id,
  authorHandle: row.author_handle,
  content: row.content,
  createdAt: row.created_at,
});

const insertComment = async (
  postId: string,
  authorId: string,
  content: string,
): Promise<Comment> => {
  const { rows } = await query<CommentRow>(
    `WITH inserted AS (
       INSERT INTO comments (post_id, author_id, content)
       VALUES ($1, $2, $3)
       RETURNING id, post_id, author_id, content, created_at
     )
     SELECT i.id, i.post_id, i.author_id, i.content, i.created_at,
            u.handle AS author_handle
       FROM inserted i
       JOIN users u ON u.id = i.author_id`,
    [postId, authorId, content],
  );
  return rowToComment(rows[0] as CommentRow);
};

const getCommentsForPost = async (postId: string): Promise<Comment[]> => {
  const { rows } = await query<CommentRow>(
    `SELECT c.id, c.post_id, c.author_id, c.content, c.created_at,
            u.handle AS author_handle
       FROM comments c
       JOIN users u ON u.id = c.author_id
      WHERE c.post_id = $1
      ORDER BY c.created_at ASC`,
    [postId],
  );
  return rows.map(rowToComment);
};

const incrementReplyCount = async (postId: string): Promise<void> => {
  await query(
    `UPDATE posts SET reply_count = reply_count + 1 WHERE id = $1`,
    [postId],
  );
};

export const commentsRepository = {
  insertComment,
  getCommentsForPost,
  incrementReplyCount,
};
