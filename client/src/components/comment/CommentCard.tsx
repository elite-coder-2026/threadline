import styled from 'styled-components';
import { Link } from 'react-router-dom';
import { PanelTight } from '../common/Panel';
import { formatTime } from '../../lib/formatTime';
import type { Comment } from '../../types/models';

interface CommentCardProps {
  comment: Comment;
}

export const CommentCard = ({ comment }: CommentCardProps): JSX.Element => (
  <Card as="li">
    <Header>
      <Handle to={`/u/${comment.authorHandle}`}>@{comment.authorHandle}</Handle>
      <Time dateTime={comment.createdAt}>{formatTime(comment.createdAt)}</Time>
    </Header>
    <Body>{comment.content}</Body>
  </Card>
);

const Card = styled(PanelTight)`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.space(1)};
  list-style: none;
  background: ${({ theme }) => theme.color.bg};
`;

const Header = styled.div`
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: ${({ theme }) => theme.space(2)};
`;

const Handle = styled(Link)`
  font-weight: 700;
  font-size: 0.9em;
  color: ${({ theme }) => theme.color.text};
  text-decoration: none;
  &:hover { text-decoration: underline; }
`;

const Time = styled.time`
  color: ${({ theme }) => theme.color.textMuted};
  font-size: 0.8em;
`;

const Body = styled.p`
  margin: 0;
  font-size: 0.95em;
  white-space: pre-wrap;
  word-break: break-word;
`;
