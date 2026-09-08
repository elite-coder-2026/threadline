import { useState } from 'react';
import type { FormEvent } from 'react';
import styled from 'styled-components';
import { Panel } from '../common/Panel';
import { Button } from '../common/Button';
import { CharCounter } from '../common/CharCounter';
import { useCreateComment } from '../../hooks/useComments';

const MAX = 280;

interface CommentComposerProps {
  postId: string;
}

export const CommentComposer = ({ postId }: CommentComposerProps): JSX.Element => {
  const [text, setText] = useState('');
  const create = useCreateComment(postId);

  const tooLong = text.length > MAX;
  const invalid = text.trim().length === 0 || tooLong;

  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    if (invalid || create.isPending) return;
    await create.mutateAsync(text.trim());
    setText('');
  };

  return (
    <Wrap as="form" onSubmit={handleSubmit}>
      <Field
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Write a reply…"
        rows={2}
        aria-label="Reply text"
        aria-invalid={tooLong}
      />
      <Row>
        {create.isError && <Error role="alert">{create.error.message}</Error>}
        <Spacer />
        <CharCounter remaining={MAX - text.length} />
        <Button type="submit" $variant="primary" disabled={invalid || create.isPending}>
          {create.isPending ? 'Replying…' : 'Reply'}
        </Button>
      </Row>
    </Wrap>
  );
};

const Wrap = styled(Panel)`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.space(2)};
  background: ${({ theme }) => theme.color.bg};
`;

const Field = styled.textarea`
  width: 100%;
  resize: vertical;
  padding: ${({ theme }) => theme.space(2)};
  border: ${({ theme }) => theme.border};
  border-radius: ${({ theme }) => theme.radiusSmall};
  font: inherit;
  color: inherit;
  background: ${({ theme }) => theme.color.surface};
  &[aria-invalid='true'] { border-color: ${({ theme }) => theme.color.danger}; }
`;

const Row = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.space(2)};
`;

const Spacer = styled.span`flex: 1;`;

const Error = styled.span`
  color: ${({ theme }) => theme.color.danger};
  font-size: 0.85em;
`;
