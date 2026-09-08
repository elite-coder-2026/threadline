import type { SortOrder } from '../types/models';

// Centralised query-key factory so mutations can target caches precisely.
export const keys = {
  timelineRoot: ['timeline'] as const,
  timeline: (sort: SortOrder) => ['timeline', sort] as const,
  profile: (handle: string) => ['profile', handle] as const,
  userPostsRoot: ['userPosts'] as const,
  userPosts: (handle: string) => ['userPosts', handle] as const,
  comments: (postId: string) => ['comments', postId] as const,
};
