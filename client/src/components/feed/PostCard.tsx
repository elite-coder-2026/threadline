import { useState } from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import { PanelTight } from '../common/Panel';
import { LikeButton } from '../post/LikeButton';
import { CommentThread } from '../comment/CommentThread';
import { LinkPostBody } from '../post/LinkPostBody';
import { GithubPostBody } from '../post/GithubPostBody';
import { VideoPostBody } from '../post/VideoPostBody';
import { formatTime } from '../../lib/formatTime';
import { assertNever } from '../../lib/assertNever';
import type { Post } from '../../types/models';

interface PostCardProps {
  post: Post;
  /** Lets the Timeline render cards as <li> while keeping the container styling. */
  as?: 'div' | 'li' | 'article';
}

// Per-type body. Narrowing on `post.postType` hands each variant its exact
// metadata shape; `assertNever` makes a missing case a compile error.
const TypedBody = ({ post }: { post: Post }): JSX.Element | null => {
  switch (post.postType) {
    case 'text':
      return null;
    case 'link':
      return <LinkPostBody metadata={post.metadata} />;
    case 'github':
      return <GithubPostBody metadata={post.metadata} />;
    case 'video':
      return <VideoPostBody metadata={post.metadata} />;
    default:
      return assertNever(post);
  }
};

// The only local state is UI-level: whether the reply thread is expanded.
// Post data (content, counts, likedByMe) still comes straight from `post`.
export const PostCard = ({ post, as = 'article' }: PostCardProps): JSX.Element => {
  const [threadOpen, setThreadOpen] = useState(false);

  return (
    <Card as={as}>
      <Header>
        <Handle to={`/u/${post.authorHandle}`}>@{post.authorHandle}</Handle>
        <Time dateTime={post.createdAt}>{formatTime(post.createdAt)}</Time>
      </Header>

      {post.postType === 'text' ? (
        <Body>{post.content}</Body>
      ) : (
        post.content.length > 0 && <Body>{post.content}</Body>
      )}

      <TypedBody post={post} />

      <Footer>
        <LikeButton post={post} />
        <ReplyToggle
          type="button"
          onClick={() => setThreadOpen((v) => !v)}
          aria-expanded={threadOpen}
          data-active={threadOpen}
        >
          <span aria-hidden>💬</span> {post.replyCount}
        </ReplyToggle>
      </Footer>

      {threadOpen && <CommentThread postId={post.id} open={threadOpen} />}
    </Card>
  );
};

const Card = styled(PanelTight)`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.space(2)};
  list-style: none;
`;

const Header = styled.div`
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: ${({ theme }) => theme.space(2)};
`;

const Handle = styled(Link)`
  font-weight: 700;
  color: ${({ theme }) => theme.color.text};
  text-decoration: none;

  &:hover {
    text-decoration: underline;
  }
`;

const Time = styled.time`
  color: ${({ theme }) => theme.color.textMuted};
  font-size: 0.85em;
`;

const Body = styled.p`
  margin: 0;
  white-space: pre-wrap;
  word-break: break-word;
`;

const Footer = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.space(3)};
`;

const ReplyToggle = styled.button`
  display: inline-flex;
  align-items: center;
  gap: ${({ theme }) => theme.space(1)};
  padding: ${({ theme }) => `${theme.space(1)} ${theme.space(2)}`};
  border: ${({ theme }) => theme.border};
  border-radius: 999px;
  background: ${({ theme }) => theme.color.surface};
  color: ${({ theme }) => theme.color.textMuted};
  cursor: pointer;
  font-size: 0.9em;
  font-variant-numeric: tabular-nums;

  &:hover {
    background: ${({ theme }) => theme.color.hover};
  }
  &[data-active='true'] {
    color: ${({ theme }) => theme.color.primary};
    border-color: ${({ theme }) => theme.color.primary};
  }
`;
