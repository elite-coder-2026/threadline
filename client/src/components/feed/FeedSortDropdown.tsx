import { Dropdown } from '../common/Dropdown';
import type { DropdownOption } from '../common/Dropdown';
import type { SortOrder } from '../../types/models';

const OPTIONS: ReadonlyArray<DropdownOption<SortOrder>> = [
  { value: 'latest', label: 'Latest' },
  { value: 'most_liked', label: 'Most liked' },
];

interface FeedSortDropdownProps {
  value: SortOrder;
  onChange: (value: SortOrder) => void;
}

// Thin preset over the reusable Dropdown base — no native <select>.
export const FeedSortDropdown = ({ value, onChange }: FeedSortDropdownProps): JSX.Element => (
  <Dropdown<SortOrder>
    label="Sort posts"
    value={value}
    options={OPTIONS}
    onChange={onChange}
  />
);
