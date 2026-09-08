// Layer 2 helper — isolated, testable enrichment for `github` posts.
import type { GithubMetadata } from '../../models/post.model.js';
import { parseGithubRepo } from '../../shared/url.js';
import { env } from '../../config/env.js';

const TIMEOUT_MS = 3000;

interface GithubRepoResponse {
  description: string | null;
  stargazers_count: number;
  language: string | null;
}

// GitHub serves the repo's social-preview card here; the first path segment is
// just a cache key, so any value works and no extra API call is needed.
const socialImage = (owner: string, repo: string): string | null =>
  owner && repo ? `https://opengraph.githubassets.com/1/${owner}/${repo}` : null;

export const githubFallback = (url: string, owner: string, repo: string): GithubMetadata => ({
  url,
  owner,
  repo,
  image: socialImage(owner, repo),
  description: null,
  stars: null,
  language: null,
  enrichmentStatus: 'failed',
});

// eslint-disable-next-line no-console
const log = (...args: unknown[]): void => console.log('[enrichGithubPost]', ...args);

export const enrichGithubPost = async (url: string): Promise<GithubMetadata> => {
  const ref = parseGithubRepo(url);
  log('called', { url, ref, authenticated: Boolean(env.githubToken) });

  // Validation already guaranteed this, but stay defensive.
  if (!ref) {
    log('SKIPPED — url is not github.com/<owner>/<repo>', { url });
    return githubFallback(url, '', '');
  }

  const apiUrl = `https://api.github.com/repos/${ref.owner}/${ref.repo}`;
  try {
    const headers: Record<string, string> = {
      accept: 'application/vnd.github+json',
      'user-agent': 'thread-line-linkbot/1.0',
    };
    if (env.githubToken) headers['authorization'] = `Bearer ${env.githubToken}`;

    const res = await fetch(apiUrl, { signal: AbortSignal.timeout(TIMEOUT_MS), headers });
    log('response', {
      apiUrl,
      status: res.status,
      rateLimitRemaining: res.headers.get('x-ratelimit-remaining'),
      rateLimitReset: res.headers.get('x-ratelimit-reset'),
    });

    if (!res.ok) {
      const bodyText = await res.text().catch(() => '<unreadable>');
      log('FAILED — non-2xx from GitHub API', {
        status: res.status,
        body: bodyText.slice(0, 500),
      });
      return githubFallback(url, ref.owner, ref.repo);
    }

    const body = (await res.json()) as GithubRepoResponse;
    log('OK', { owner: ref.owner, repo: ref.repo, stars: body.stargazers_count });
    return {
      url,
      owner: ref.owner,
      repo: ref.repo,
      image: socialImage(ref.owner, ref.repo),
      description: body.description ?? null,
      stars: typeof body.stargazers_count === 'number' ? body.stargazers_count : null,
      language: body.language ?? null,
      enrichmentStatus: 'ok',
    };
  } catch (err) {
    log('ERROR — fetch threw', {
      apiUrl,
      name: err instanceof Error ? err.name : typeof err,
      message: err instanceof Error ? err.message : String(err),
    });
    return githubFallback(url, ref.owner, ref.repo);
  }
};
