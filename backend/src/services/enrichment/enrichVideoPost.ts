// Layer 2 helper — isolated transform for `video` posts. Video posts are
// uploaded files only, so metadata is just the file URL itself; no network.
import type { VideoMetadata } from '../../models/post.model.js';

export const enrichVideoPost = async (url: string): Promise<VideoMetadata> => ({
  url,
  provider: 'file',
  embedUrl: url,
  thumbnail: null,
  title: null,
});
