// Layer 3 — Data Access. The "database" here is the local filesystem: this is
// the only place that touches disk for uploads.
import { mkdir, writeFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { env } from '../config/env.js';

const uploadRoot = resolve(process.cwd(), env.uploadDir);

const saveFile = async (filename: string, bytes: Buffer): Promise<void> => {
  await mkdir(uploadRoot, { recursive: true });
  await writeFile(join(uploadRoot, filename), bytes);
};

export const uploadsRepository = { saveFile, uploadRoot };
