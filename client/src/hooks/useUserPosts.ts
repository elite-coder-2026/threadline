import { useInfiniteQuery } from '@tanstack/react-query';
import { getUserPosts } from '../api/posts.api';
import { keys } from '../lib/queryKeys';
import type { Page, Post } from '../types/models';

export const useUserPosts = (handle: string) =>
  useInfiniteQuery<Page<Post>>({
    queryKey: keys.userPosts(handle),
    initialPageParam: undefined as string | undefined,
    queryFn: async ({ pageParam }) =>
      getUserPosts({ handle, cursor: pageParam as string | undefined }),
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    enabled: handle.length > 0,
  });
