import { useMutation, useQueryClient } from '@tanstack/react-query';
import { followUser, unfollowUser } from '../api/follows.api';
import { keys } from '../lib/queryKeys';
import type { Profile } from '../types/models';

interface FollowContext {
  previous: Profile | undefined;
}

// Optimistic follow/unfollow: flips followedByMe and nudges followerCount,
// then reconciles with the server on settle.
const useFollowToggle = (handle: string, follow: boolean) => {
  const qc = useQueryClient();
  return useMutation<void, Error, string, FollowContext>({
    mutationFn: async (userId: string) => (follow ? followUser(userId) : unfollowUser(userId)),
    onMutate: async () => {
      await qc.cancelQueries({ queryKey: keys.profile(handle) });
      const previous = qc.getQueryData<Profile>(keys.profile(handle));
      if (previous) {
        qc.setQueryData<Profile>(keys.profile(handle), {
          ...previous,
          followedByMe: follow,
          followerCount: previous.followerCount + (follow ? 1 : -1),
        });
      }
      return { previous };
    },
    onError: (_err, _userId, ctx) => {
      if (ctx?.previous) qc.setQueryData(keys.profile(handle), ctx.previous);
    },
    onSettled: async () => {
      await qc.invalidateQueries({ queryKey: keys.profile(handle) });
    },
  });
};

export const useFollow = (handle: string) => useFollowToggle(handle, true);
export const useUnfollow = (handle: string) => useFollowToggle(handle, false);
