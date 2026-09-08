// Pure URL helpers. No layer — shared by Layer 1 validation (posts.schemas.ts)
// and Layer 2 enrichment, same role as shared/http-error.ts.
import type { VideoProvider } from '../models/post.model.js';

const parse = (raw: string): URL | null => {
  try {
    return new URL(raw);
  } catch {
    return null;
  }
};

export const domainOf = (raw: string): string => {
  const u = parse(raw);
  return u ? u.hostname.replace(/^www\./, '') : raw;
};

export interface GithubRepoRef {
  owner: string;
  repo: string;
}

export const parseGithubRepo = (raw: string): GithubRepoRef | null => {
  const u = parse(raw);
  if (!u || !/(^|\.)github\.com$/.test(u.hostname)) return null;
  const parts = u.pathname.split('/').filter(Boolean);
  if (parts.length < 2) return null;
  const [owner, repoRaw] = parts as [string, string, ...string[]];
  const repo = repoRaw.replace(/\.git$/, '');
  if (!owner || !repo) return null;
  return { owner, repo };
};

export const isGithubRepoUrl = (raw: string): boolean => parseGithubRepo(raw) !== null;

const FILE_EXT = /\.(mp4|webm|ogg|ogv|mov|m4v)(\?.*)?$/i;

export interface VideoRef {
  provider: VideoProvider;
  id: string | null;
}

// Video posts are uploaded files only — a direct video-file URL, nothing else.
export const detectVideo = (raw: string): VideoRef | null => {
  if (parse(raw) && FILE_EXT.test(raw)) return { provider: 'file', id: null };
  return null;
};
