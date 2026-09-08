import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { InfiniteData, QueryKey } from '@tanstack/react-query';
import { createPost, likePost, unlikePost } from '../api/posts.api';
import type { CreatePostInput } from '../api/posts.api';
import { keys } from '../lib/queryKeys';
import type { Page, Post, TimelineItem } from '../types/models';

type TimelineCache = InfiniteData<Page<TimelineItem>> | undefined;

// Apply `patch` to one post wherever it appears across cached infinite pages.
const patchPostInPages = (
  data: TimelineCache,
  postId: string,
  patch: (post: TimelineItem) => TimelineItem,
): TimelineCache => {
  if (!data) return data;
  return {
    ...data,
    pages: data.pages.map((page) => ({
      ...page,
      items: page.items.map((item) => (item.id === postId ? patch(item) : item)),
    })),
  };
};

export const useCreatePost = () => {
  const qc = useQueryClient();
  return useMutation<Post, Error, CreatePostInput>({
    mutationFn: async (input: CreatePostInput) => createPost(input),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: keys.timelineRoot });
      // link/github previews finish enriching server-side a moment after insert;
      // pull the completed version without holding up the post's first render.
      window.setTimeout(() => {
        void qc.invalidateQueries({ queryKey: keys.timelineRoot });
      }, 3000);
    },
  });
};

interface LikeContext {
  snapshots: Array<[QueryKey, TimelineCache]>;
}

// Shared optimistic toggle for like / unlike.
const useLikeToggle = (liked: boolean) => {
  const qc = useQueryClient();
  return useMutation<void, Error, string, LikeContext>({
    mutationFn: async (postId: string) => (liked ? likePost(postId) : unlikePost(postId)),
    onMutate: async (postId) => {
      await qc.cancelQueries({ queryKey: keys.timelineRoot });
      const snapshots = qc.getQueriesData<TimelineCache>({ queryKey: keys.timelineRoot });
      qc.setQueriesData<TimelineCache>({ queryKey: keys.timelineRoot }, (old) =>
        patchPostInPages(old, postId, (p) => ({
          ...p,
          likedByMe: liked,
          likeCount: p.likeCount + (liked ? 1 : -1),
        })),
      );
      return { snapshots };
    },
    onError: (_err, _postId, ctx) => {
      ctx?.snapshots.forEach(([key, value]) => qc.setQueryData(key, value));
    },
    onSettled: async () => {
      await qc.invalidateQueries({ queryKey: keys.timelineRoot });
    },
  });
};

export const useLikePost = () => useLikeToggle(true);
export const useUnlikePost = () => useLikeToggle(false);
