import { useRef, useState } from 'react';
import type { KeyboardEvent } from 'react';
import styled from 'styled-components';
import { useClickOutside } from '../../hooks/useClickOutside';
import { Panel } from './Panel';

export interface DropdownOption<T extends string> {
  value: T;
  label: string;
}

interface DropdownProps<T extends string> {
  value: T;
  options: ReadonlyArray<DropdownOption<T>>;
  onChange: (value: T) => void;
  /** Accessible name for the control. */
  label: string;
}

// Custom dropdown — deliberately NOT a native <select>/<option>. A div-based
// listbox with local open state and a click-outside handler to close. This is
// the reusable base every other dropdown in the app is built on.
export const Dropdown = <T extends string>({
  value,
  options,
  onChange,
  label,
}: DropdownProps<T>): JSX.Element => {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  useClickOutside(rootRef, () => setOpen(false), open);

  const current = options.find((o) => o.value === value);

  const choose = (next: T): void => {
    onChange(next);
    setOpen(false);
  };

  const onTriggerKeyDown = (e: KeyboardEvent<HTMLButtonElement>): void => {
    if (e.key === 'Escape') setOpen(false);
    if ((e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ') && !open) {
      e.preventDefault();
      setOpen(true);
    }
  };

  const onOptionKeyDown = (e: KeyboardEvent<HTMLDivElement>, next: T): void => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      choose(next);
    }
    if (e.key === 'Escape') setOpen(false);
  };

  return (
    <Root ref={rootRef}>
      <Trigger
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={label}
        onClick={() => setOpen((v) => !v)}
        onKeyDown={onTriggerKeyDown}
      >
        <span>{current?.label ?? label}</span>
        <Caret aria-hidden>{open ? '▲' : '▼'}</Caret>
      </Trigger>

      {open && (
        <Menu as="div" role="listbox" aria-label={label}>
          {options.map((option) => (
            <Option
              key={option.value}
              role="option"
              tabIndex={0}
              aria-selected={option.value === value}
              data-selected={option.value === value}
              onClick={() => choose(option.value)}
              onKeyDown={(e) => onOptionKeyDown(e, option.value)}
            >
              {option.label}
            </Option>
          ))}
        </Menu>
      )}
    </Root>
  );
};

const Root = styled.div`
  position: relative;
  display: inline-block;
`;

const Trigger = styled.button`
  display: inline-flex;
  align-items: center;
  gap: ${({ theme }) => theme.space(2)};
  padding: ${({ theme }) => `${theme.space(2)} ${theme.space(3)}`};
  border: ${({ theme }) => theme.border};
  border-radius: ${({ theme }) => theme.radiusSmall};
  background: ${({ theme }) => theme.color.surface};
  color: ${({ theme }) => theme.color.text};
  cursor: pointer;

  &:hover {
    background: ${({ theme }) => theme.color.hover};
  }
`;

const Caret = styled.span`
  font-size: 0.6em;
  color: ${({ theme }) => theme.color.textMuted};
`;

const Menu = styled(Panel)`
  position: absolute;
  z-index: 20;
  top: calc(100% + 6px);
  left: 0;
  min-width: 100%;
  padding: ${({ theme }) => theme.space(1)};
  display: flex;
  flex-direction: column;
  gap: 2px;
  box-shadow: 0 8px 24px rgba(20, 24, 31, 0.12);
`;

const Option = styled.div`
  padding: ${({ theme }) => `${theme.space(2)} ${theme.space(3)}`};
  border-radius: ${({ theme }) => theme.radiusSmall};
  cursor: pointer;
  white-space: nowrap;

  &:hover,
  &:focus-visible {
    background: ${({ theme }) => theme.color.hover};
    outline: none;
  }

  &[data-selected='true'] {
    color: ${({ theme }) => theme.color.primary};
    font-weight: 600;
  }
`;
