import { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import { PostComposer } from './PostComposer';
import { useClickOutside } from '../../hooks/useClickOutside';

// The composer no longer lives inline in the feed — it's launched from a
// floating action button pinned to the bottom-left of the viewport.
export const FloatingComposer = (): JSX.Element => {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  const close = (): void => setOpen(false);
  useClickOutside(rootRef, close, open);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent): void => {
      if (e.key === 'Escape') close();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);

  return (
    <Root ref={rootRef}>
      {open && (
        <Popover role="dialog" aria-label="Create a post">
          <PostComposer onPosted={close} />
        </Popover>
      )}

      <Fab
        type="button"
        aria-expanded={open}
        aria-label={open ? 'Close composer' : 'Create a post'}
        onClick={() => setOpen((v) => !v)}
      >
        <span aria-hidden>{open ? '×' : '+'}</span>
      </Fab>
    </Root>
  );
};

const Root = styled.div`
  position: fixed;
  bottom: ${({ theme }) => theme.space(5)};
  left: ${({ theme }) => theme.space(5)};
  z-index: 50;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: ${({ theme }) => theme.space(3)};
`;

const Popover = styled.div`
  width: min(420px, calc(100vw - ${({ theme }) => theme.space(6)}));
  max-height: min(70vh, 640px);
  overflow-y: auto;
  box-shadow: 0 12px 40px rgba(20, 24, 31, 0.18);
  border-radius: ${({ theme }) => theme.radiusSmall};
`;

const Fab = styled.button`
  width: 56px;
  height: 56px;
  border-radius: 999px;
  border: ${({ theme }) => theme.border};
  background: ${({ theme }) => theme.color.primary};
  color: ${({ theme }) => theme.color.primaryText};
  font-size: 1.8rem;
  line-height: 1;
  cursor: pointer;
  box-shadow: 0 6px 20px rgba(20, 24, 31, 0.22);
  display: grid;
  place-items: center;

  &:hover {
    filter: brightness(1.05);
  }
`;
