import styled from 'styled-components';
import { Panel } from '../common/Panel';
import { StatusPanel } from '../common/StatusPanel';
import { CommentCard } from './CommentCard';
import { CommentComposer } from './CommentComposer';
import { useComments } from '../../hooks/useComments';

interface CommentThreadProps {
  postId: string;
  /** Thread only fetches once the parent PostCard has expanded it. */
  open: boolean;
}

export const CommentThread = ({ postId, open }: CommentThreadProps): JSX.Element => {
  const { data, status, error } = useComments(postId, open);
  const comments = data?.items ?? [];

  return (
    <Wrap>
      <CommentComposer postId={postId} />

      {status === 'pending' && <StatusPanel>Loading replies…</StatusPanel>}
      {status === 'error' && (
        <StatusPanel tone="error">Couldn’t load replies: {error.message}</StatusPanel>
      )}
      {status === 'success' && comments.length === 0 && (
        <StatusPanel>No replies yet — be the first.</StatusPanel>
      )}
      {comments.length > 0 && (
        <List>
          {comments.map((comment) => (
            <CommentCard key={comment.id} comment={comment} />
          ))}
        </List>
      )}
    </Wrap>
  );
};

const Wrap = styled(Panel)`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.space(2)};
  background: ${({ theme }) => theme.color.bg};
`;

const List = styled.ul`
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.space(2)};
`;
