// Layer 2 — Business Logic. Validates the upload, names it safely, delegates the
// write to the repository, and returns the public URL. No HTTP, no fs calls.
import { randomUUID } from 'node:crypto';
import { extname } from 'node:path';
import { uploadsRepository } from '../repositories/uploads.repository.js';
import type { UploadedFile } from '../models/upload.model.js';
import { unprocessable } from '../shared/http-error.js';
import { env } from '../config/env.js';

// content-type -> canonical extension. Keeps stored names predictable and
// prevents attacker-controlled extensions.
const ALLOWED: ReadonlyMap<string, string> = new Map([
  ['video/mp4', '.mp4'],
  ['video/webm', '.webm'],
  ['video/ogg', '.ogv'],
  ['video/quicktime', '.mov'],
]);
const ALLOWED_EXT = new Set(['.mp4', '.webm', '.ogv', '.ogg', '.mov', '.m4v']);

interface SaveVideoInput {
  originalName: string;
  contentType: string;
  bytes: Buffer;
}

const resolveExtension = (contentType: string, originalName: string): string | null => {
  const byType = ALLOWED.get(contentType);
  if (byType) return byType;
  const byName = extname(originalName).toLowerCase();
  return ALLOWED_EXT.has(byName) ? byName : null;
};

const saveVideo = async ({
  originalName,
  contentType,
  bytes,
}: SaveVideoInput): Promise<UploadedFile> => {
  if (bytes.length === 0) {
    throw unprocessable('The uploaded file is empty.');
  }
  if (bytes.length > env.maxUploadBytes) {
    const mb = Math.round(env.maxUploadBytes / (1024 * 1024));
    throw unprocessable(`Video exceeds the ${mb}MB upload limit.`);
  }

  const ext = resolveExtension(contentType, originalName);
  if (!ext) {
    throw unprocessable('Only mp4, webm, ogg, or mov video files are supported.');
  }

  const filename = `${randomUUID()}${ext}`;
  await uploadsRepository.saveFile(filename, bytes);

  return {
    url: `${env.publicBaseUrl}/uploads/${filename}`,
    filename,
    contentType,
    sizeBytes: bytes.length,
  };
};

export const uploadsService = { saveVideo };
