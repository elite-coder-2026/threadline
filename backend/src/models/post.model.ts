// Layer 4 — Domain. Pure shapes, no logic, imports nothing.

export type PostType = 'text' | 'link' | 'github' | 'video';

/** Whether server-side enrichment managed to fetch the type-specific data. */
export type EnrichmentStatus = 'ok' | 'failed';

export interface LinkMetadata {
  url: string;
  domain: string;
  title: string | null;
  description: string | null;
  image: string | null;
  enrichmentStatus: EnrichmentStatus;
}

export interface GithubMetadata {
  url: string;
  owner: string;
  repo: string;
  /** GitHub's social preview image (opengraph.githubassets.com), or null. */
  image: string | null;
  description: string | null;
  stars: number | null;
  language: string | null;
  enrichmentStatus: EnrichmentStatus;
}

export type VideoProvider = 'file';

export interface VideoMetadata {
  url: string;
  provider: VideoProvider;
  /** The uploaded file URL — played directly in a <video> element. */
  embedUrl: string;
  thumbnail: string | null;
  title: string | null;
}

interface PostBase {
  id: string;
  authorId: string;
  content: string;
  likeCount: number;
  repostCount: number;
  replyCount: number;
  createdAt: Date;
}

// Discriminated union: `postType` is the discriminant, `metadata` shape follows it.
export type Post =
  | (PostBase & { postType: 'text'; metadata: null })
  | (PostBase & { postType: 'link'; metadata: LinkMetadata })
  | (PostBase & { postType: 'github'; metadata: GithubMetadata })
  | (PostBase & { postType: 'video'; metadata: VideoMetadata });

/** Any post's metadata, keyed off the discriminant. */
export type PostMetadata = Post['metadata'];

// (A | B) & C distributes, so the discriminant + metadata pairing is preserved.
export type TimelineItem = Post & { authorHandle: string };
