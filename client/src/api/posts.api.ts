// Posts resource. One file per resource; every call is an async arrow.
import { httpGet, httpPost, httpDelete } from '../lib/httpClient';
import type { Page, Post, SortOrder, TimelineItem } from '../types/models';

// Discriminated creation input — mirrors the backend Zod union.
export type CreatePostInput =
  | { postType: 'text'; content: string }
  | { postType: 'link'; content?: string; url: string }
  | { postType: 'github'; content?: string; url: string }
  | { postType: 'video'; content?: string; url: string };

const PAGE_SIZE = 20;

interface TimelinePageArgs {
  sort: SortOrder;
  cursor?: string | undefined;
}

export const getTimelinePage = async ({
  sort,
  cursor,
}: TimelinePageArgs): Promise<Page<TimelineItem>> => {
  const params = new URLSearchParams({ sort, limit: String(PAGE_SIZE) });
  if (cursor) params.set('before', cursor);
  return httpGet<Page<TimelineItem>>(`/api/posts/timeline?${params.toString()}`);
};

export const createPost = async (input: CreatePostInput): Promise<Post> =>
  httpPost<Post>('/api/posts', input);

export const likePost = async (postId: string): Promise<void> => {
  await httpPost<{ liked: boolean }>(`/api/posts/${postId}/like`);
};

export const unlikePost = async (postId: string): Promise<void> => {
  await httpDelete<{ liked: boolean }>(`/api/posts/${postId}/like`);
};

interface UserPostsArgs {
  handle: string;
  cursor?: string | undefined;
}

export const getUserPosts = async ({ handle, cursor }: UserPostsArgs): Promise<Page<Post>> => {
  const params = new URLSearchParams({ limit: String(PAGE_SIZE) });
  if (cursor) params.set('before', cursor);
  return httpGet<Page<Post>>(`/api/users/${handle}/posts?${params.toString()}`);
};
