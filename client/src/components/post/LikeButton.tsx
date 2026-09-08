import styled from 'styled-components';
import { useLikePost, useUnlikePost } from '../../hooks/usePostMutations';
import type { Post } from '../../types/models';

interface LikeButtonProps {
  post: Post;
}

// Holds NO local liked state. `likedByMe` / `likeCount` are read straight from
// the post object, which lives in the React Query timeline cache. The mutation
// hooks rewrite that cache optimistically; this component just re-renders.
export const LikeButton = ({ post }: LikeButtonProps): JSX.Element => {
  const like = useLikePost();
  const unlike = useUnlikePost();
  const pending = like.isPending || unlike.isPending;

  const toggle = async (): Promise<void> => {
    if (pending) return;
    if (post.likedByMe) {
      await unlike.mutateAsync(post.id);
    } else {
      await like.mutateAsync(post.id);
    }
  };

  return (
    <Btn
      type="button"
      onClick={toggle}
      disabled={pending}
      data-active={post.likedByMe}
      aria-pressed={post.likedByMe}
      aria-label={post.likedByMe ? 'Unlike' : 'Like'}
    >
      <span aria-hidden>{post.likedByMe ? '♥' : '♡'}</span>
      <span>{post.likeCount}</span>
    </Btn>
  );
};

const Btn = styled.button`
  display: inline-flex;
  align-items: center;
  gap: ${({ theme }) => theme.space(1)};
  padding: ${({ theme }) => `${theme.space(1)} ${theme.space(2)}`};
  border: ${({ theme }) => theme.border};
  border-radius: 999px;
  background: ${({ theme }) => theme.color.surface};
  color: ${({ theme }) => theme.color.textMuted};
  cursor: pointer;
  font-variant-numeric: tabular-nums;

  &:hover:not(:disabled) {
    background: ${({ theme }) => theme.color.hover};
  }
  &[data-active='true'] {
    color: ${({ theme }) => theme.color.likeActive};
    border-color: ${({ theme }) => theme.color.likeActive};
  }
  &:disabled {
    opacity: 0.6;
    cursor: default;
  }
`;
