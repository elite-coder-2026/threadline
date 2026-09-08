import { useNavigate } from 'react-router-dom';
import { Dropdown } from './Dropdown';
import type { DropdownOption } from './Dropdown';

type MenuAction = 'profile' | 'signout';

interface UserMenuProps {
  handle: string;
}

const OPTIONS: ReadonlyArray<DropdownOption<MenuAction>> = [
  { value: 'profile', label: 'View profile' },
  { value: 'signout', label: 'Sign out' },
];

// Another consumer of the custom Dropdown base — proves it's reusable, and
// keeps the "no native <select>" rule for the user menu too.
export const UserMenu = ({ handle }: UserMenuProps): JSX.Element => {
  const navigate = useNavigate();

  const onChange = (action: MenuAction): void => {
    if (action === 'profile') navigate(`/u/${handle}`);
    if (action === 'signout') console.info('Sign-out is stubbed in this demo.');
  };

  return (
    <Dropdown<MenuAction>
      label={`@${handle} menu`}
      value={'profile'}
      options={OPTIONS}
      onChange={onChange}
    />
  );
};
