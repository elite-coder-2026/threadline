import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getComments, createComment } from '../api/comments.api';
import { keys } from '../lib/queryKeys';
import type { Comment, Page } from '../types/models';

// Replies for one post. Disabled until the thread is actually opened.
export const useComments = (postId: string, enabled: boolean) =>
  useQuery<Page<Comment>>({
    queryKey: keys.comments(postId),
    queryFn: async () => getComments(postId),
    enabled,
  });

export const useCreateComment = (postId: string) => {
  const qc = useQueryClient();
  return useMutation<Comment, Error, string>({
    mutationFn: async (content: string) => createComment({ postId, content }),
    onSuccess: async () => {
      // Refresh the thread and the feed (post.replyCount changed).
      await qc.invalidateQueries({ queryKey: keys.comments(postId) });
      await qc.invalidateQueries({ queryKey: keys.timelineRoot });
      await qc.invalidateQueries({ queryKey: keys.userPostsRoot });
    },
  });
};
