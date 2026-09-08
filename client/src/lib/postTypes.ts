import type { DropdownOption } from '../components/common/Dropdown';
import type { PostType } from '../types/models';

// Options for the PostComposer type selector (rendered via the custom Dropdown).
export const POST_TYPE_OPTIONS: ReadonlyArray<DropdownOption<PostType>> = [
  { value: 'text', label: 'Text' },
  { value: 'link', label: 'Link' },
  { value: 'github', label: 'GitHub' },
  { value: 'video', label: 'Video' },
];

const parseUrl = (raw: string): URL | null => {
  try {
    return new URL(raw);
  } catch {
    return null;
  }
};

export const isGithubRepoUrl = (raw: string): boolean => {
  const u = parseUrl(raw);
  if (!u || !/(^|\.)github\.com$/.test(u.hostname)) return false;
  return u.pathname.split('/').filter(Boolean).length >= 2;
};

// Per-type composer copy + client-side URL check (backend re-validates).
// `video` is intentionally absent — video posts are file-upload only.
export const URL_FIELD: Record<
  Exclude<PostType, 'text' | 'video'>,
  { label: string; placeholder: string; isValid: (url: string) => boolean }
> = {
  link: {
    label: 'Link URL',
    placeholder: 'https://example.com/article',
    isValid: (url) => parseUrl(url) !== null,
  },
  github: {
    label: 'GitHub repo URL',
    placeholder: 'https://github.com/owner/repo',
    isValid: isGithubRepoUrl,
  },
};
