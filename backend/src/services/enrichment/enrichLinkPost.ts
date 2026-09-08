// Layer 2 helper — isolated, testable enrichment for `link` posts.
// Fetches the page server-side once, at creation time, so the client never has
// to scrape Open Graph tags on render.
import { parse } from 'node-html-parser';
import type { LinkMetadata } from '../../models/post.model.js';
import { domainOf } from '../../shared/url.js';

const TIMEOUT_MS = 3000;

export const linkFallback = (url: string): LinkMetadata => ({
  url,
  domain: domainOf(url),
  title: null,
  description: null,
  image: null,
  enrichmentStatus: 'failed',
});

export const enrichLinkPost = async (url: string): Promise<LinkMetadata> => {
  try {
    const res = await fetch(url, {
      signal: AbortSignal.timeout(TIMEOUT_MS),
      headers: { 'user-agent': 'thread-line-linkbot/1.0', accept: 'text/html' },
    });
    if (!res.ok) return linkFallback(url);

    const root = parse(await res.text());
    const meta = (selector: string): string | null => {
      const value = root.querySelector(selector)?.getAttribute('content')?.trim();
      return value ? value : null;
    };
    const docTitle = root.querySelector('title')?.text.trim();

    const title =
      meta('meta[property="og:title"]') ??
      meta('meta[name="twitter:title"]') ??
      (docTitle ? docTitle : null);
    const description =
      meta('meta[property="og:description"]') ??
      meta('meta[name="twitter:description"]') ??
      meta('meta[name="description"]');
    const image =
      meta('meta[property="og:image"]') ?? meta('meta[name="twitter:image"]');

    return { url, domain: domainOf(url), title, description, image, enrichmentStatus: 'ok' };
  } catch {
    return linkFallback(url);
  }
};
