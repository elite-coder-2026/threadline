// Layer 3 — Data Access.
// Only place raw SQL lives. Parameterized queries via pg. One query concern per
// method. Maps snake_case rows -> camelCase domain types. No business logic.
import { query } from '../db/pool.js';
import type {
  GithubMetadata,
  LinkMetadata,
  Post,
  PostMetadata,
  PostType,
  TimelineItem,
  VideoMetadata,
} from '../models/post.model.js';

interface PostRow {
  id: string;
  author_id: string;
  content: string;
  post_type: PostType;
  metadata: unknown; // JSONB — pg returns it already parsed (object or null)
  like_count: number;
  repost_count: number;
  reply_count: number;
  created_at: Date;
}

interface TimelineRow extends PostRow {
  author_handle: string;
}

// Re-derive the discriminated union from the row. We control every write, so the
// metadata cast per branch is trusted.
const rowToPost = (row: PostRow): Post => {
  const base = {
    id: row.id,
    authorId: row.author_id,
    content: row.content,
    likeCount: row.like_count,
    repostCount: row.repost_count,
    replyCount: row.reply_count,
    createdAt: row.created_at,
  };
  switch (row.post_type) {
    case 'text':
      return { ...base, postType: 'text', metadata: null };
    case 'link':
      return { ...base, postType: 'link', metadata: row.metadata as LinkMetadata };
    case 'github':
      return { ...base, postType: 'github', metadata: row.metadata as GithubMetadata };
    case 'video':
      return { ...base, postType: 'video', metadata: row.metadata as VideoMetadata };
    default:
      throw new Error(`Unsupported post_type in row ${row.id}: ${String(row.post_type)}`);
  }
};

const COLUMNS =
  'id, author_id, content, post_type, metadata, like_count, repost_count, reply_count, created_at';

const rowToTimelineItem = (row: TimelineRow): TimelineItem => ({
  ...rowToPost(row),
  authorHandle: row.author_handle,
});

interface NewPost {
  authorId: string;
  content: string;
  postType: PostType;
  metadata: PostMetadata;
}

const insertPost = async ({
  authorId,
  content,
  postType,
  metadata,
}: NewPost): Promise<Post> => {
  const { rows } = await query<PostRow>(
    `INSERT INTO posts (author_id, content, post_type, metadata)
     VALUES ($1, $2, $3, $4)
     RETURNING ${COLUMNS}`,
    // node-pg serialises a plain object to JSONB; null stays NULL.
    [authorId, content, postType, metadata],
  );
  // RETURNING on a single-row INSERT always yields exactly one row.
  return rowToPost(rows[0] as PostRow);
};

// Used by deferred enrichment to swap the placeholder preview for the real one.
const updateMetadata = async (postId: string, metadata: PostMetadata): Promise<void> => {
  await query(`UPDATE posts SET metadata = $2 WHERE id = $1`, [postId, metadata]);
};

const getPostById = async (postId: string): Promise<Post | null> => {
  const { rows } = await query<PostRow>(
    `SELECT ${COLUMNS} FROM posts WHERE id = $1`,
    [postId],
  );
  const row = rows[0];
  return row ? rowToPost(row) : null;
};

// Fan-out-on-read: assemble the timeline at query time from the posts of
// everyone the user follows, plus the user's own posts.
const getTimelineForUser = async (
  userId: string,
  limit: number,
  before?: Date,
): Promise<TimelineItem[]> => {
  const params: unknown[] = [userId, limit];
  let beforeClause = '';
  if (before) {
    params.push(before);
    beforeClause = `AND p.created_at < $3`;
  }

  const { rows } = await query<TimelineRow>(
    `SELECT p.id, p.author_id, p.content, p.post_type, p.metadata,
            p.like_count, p.repost_count, p.reply_count, p.created_at,
            u.handle AS author_handle
       FROM posts p
       JOIN users u ON u.id = p.author_id
      WHERE (
              p.author_id = $1
              OR p.author_id IN (
                SELECT followee_id FROM follows WHERE follower_id = $1
              )
            )
        AND p.post_type IN ('text', 'link', 'github', 'video')
        ${beforeClause}
      ORDER BY p.created_at DESC
      LIMIT $2`,
    params,
  );
  return rows.map(rowToTimelineItem);
};

// Idempotent: returns true only when a new like row was actually created.
const insertLike = async (userId: string, postId: string): Promise<boolean> => {
  const { rowCount } = await query(
    `INSERT INTO likes (user_id, post_id)
     VALUES ($1, $2)
     ON CONFLICT (user_id, post_id) DO NOTHING`,
    [userId, postId],
  );
  return (rowCount ?? 0) > 0;
};

const incrementLikeCount = async (postId: string): Promise<void> => {
  await query(
    `UPDATE posts SET like_count = like_count + 1 WHERE id = $1`,
    [postId],
  );
};

export const postsRepository = {
  insertPost,
  updateMetadata,
  getPostById,
  getTimelineForUser,
  insertLike,
  incrementLikeCount,
};
