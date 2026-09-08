import { Button } from '../common/Button';
import { useFollow, useUnfollow } from '../../hooks/useFollowMutations';
import type { Profile } from '../../types/models';

interface FollowButtonProps {
  profile: Profile;
}

// Reads followedByMe from the cached Profile; mutations flip it optimistically.
export const FollowButton = ({ profile }: FollowButtonProps): JSX.Element => {
  const handle = profile.user.handle;
  const follow = useFollow(handle);
  const unfollow = useUnfollow(handle);
  const pending = follow.isPending || unfollow.isPending;

  const toggle = async (): Promise<void> => {
    if (pending) return;
    if (profile.followedByMe) {
      await unfollow.mutateAsync(profile.user.id);
    } else {
      await follow.mutateAsync(profile.user.id);
    }
  };

  return (
    <Button
      type="button"
      onClick={toggle}
      disabled={pending}
      $variant={profile.followedByMe ? 'subtle' : 'primary'}
    >
      {profile.followedByMe ? 'Following' : 'Follow'}
    </Button>
  );
};
