import styled from 'styled-components';
import { Panel } from './Panel';

interface StatusPanelProps {
  tone?: 'muted' | 'error';
  children: React.ReactNode;
}

// Loading / error / empty states — itself wrapped in the required container.
export const StatusPanel = ({ tone = 'muted', children }: StatusPanelProps): JSX.Element => (
  <Wrap data-tone={tone} role={tone === 'error' ? 'alert' : 'status'}>
    {children}
  </Wrap>
);

const Wrap = styled(Panel)`
  text-align: center;
  color: ${({ theme }) => theme.color.textMuted};

  &[data-tone='error'] {
    color: ${({ theme }) => theme.color.danger};
    border-color: ${({ theme }) => theme.color.danger};
  }
`;
