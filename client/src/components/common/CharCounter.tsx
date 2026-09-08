import styled from 'styled-components';

interface CharCounterProps {
  remaining: number;
}

export const CharCounter = ({ remaining }: CharCounterProps): JSX.Element => (
  <Pill data-over={remaining < 0} data-warn={remaining >= 0 && remaining <= 20}>
    {remaining}
  </Pill>
);

const Pill = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 44px;
  padding: 2px 8px;
  border-radius: 999px;
  border: ${({ theme }) => theme.border};
  font-size: 0.85em;
  font-variant-numeric: tabular-nums;
  color: ${({ theme }) => theme.color.textMuted};

  &[data-warn='true'] {
    color: ${({ theme }) => theme.color.text};
  }
  &[data-over='true'] {
    color: ${({ theme }) => theme.color.danger};
    border-color: ${({ theme }) => theme.color.danger};
    font-weight: 700;
  }
`;
