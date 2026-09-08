// UI-side domain types. Mirror the backend DTOs (dates arrive as ISO strings).

export interface User {
  id: string;
  handle: string;
  displayName: string;
}

export type PostType = 'text' | 'link' | 'github' | 'video';
export type EnrichmentStatus = 'ok' | 'failed';

export interface LinkMetadata {
  url: string;
  domain: string;
  title: string | null;
  description: string | null;
  image: string | null;
  enrichmentStatus: EnrichmentStatus;
}

export interface GithubMetadata {
  url: string;
  owner: string;
  repo: string;
  image: string | null;
  description: string | null;
  stars: number | null;
  language: string | null;
  enrichmentStatus: EnrichmentStatus;
}

export type VideoProvider = 'file';

export interface VideoMetadata {
  url: string;
  provider: VideoProvider;
  embedUrl: string;
  thumbnail: string | null;
  title: string | null;
}

interface PostBase {
  id: string;
  authorId: string;
  authorHandle: string;
  content: string;
  likeCount: number;
  replyCount: number;
  repostCount: number;
  /** Whether the current (x-user-id) user has liked this post. */
  likedByMe: boolean;
  createdAt: string;
}

// Discriminated union — `postType` selects the `metadata` shape.
export type Post =
  | (PostBase & { postType: 'text'; metadata: null })
  | (PostBase & { postType: 'link'; metadata: LinkMetadata })
  | (PostBase & { postType: 'github'; metadata: GithubMetadata })
  | (PostBase & { postType: 'video'; metadata: VideoMetadata });

/** Timeline entries are Posts today; kept distinct for future feed-only fields. */
export type TimelineItem = Post;

export interface Comment {
  id: string;
  postId: string;
  authorId: string;
  authorHandle: string;
  content: string;
  createdAt: string;
}

export interface Profile {
  user: User;
  followerCount: number;
  followingCount: number;
  followedByMe: boolean;
}

export type SortOrder = 'latest' | 'most_liked';

export interface Page<T> {
  items: T[];
  nextCursor: string | null;
}
