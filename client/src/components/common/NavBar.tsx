import styled from 'styled-components';
import { Link } from 'react-router-dom';
import { Panel } from './Panel';
import { UserMenu } from './UserMenu';

interface NavBarProps {
  currentHandle: string;
}

export const NavBar = ({ currentHandle }: NavBarProps): JSX.Element => (
  <Bar>
    <Brand to="/">thread-line</Brand>
    <UserMenu handle={currentHandle} />
  </Bar>
);

const Bar = styled(Panel)`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${({ theme }) => theme.space(3)};
  max-width: 620px;
  margin: ${({ theme }) => theme.space(4)} auto 0;
`;

const Brand = styled(Link)`
  font-weight: 800;
  font-size: 1.1rem;
  color: ${({ theme }) => theme.color.text};
  text-decoration: none;
`;
