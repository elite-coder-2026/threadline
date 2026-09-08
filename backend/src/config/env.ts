import 'dotenv/config';

// Typed, validated-once view of process.env. Infra concern — not a layer.
const required = (name: string): string => {
  const value = process.env[name];
  if (value === undefined || value === '') {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
};

const optional = (name: string): string | undefined => {
  const value = process.env[name];
  return value === undefined || value === '' ? undefined : value;
};

const port = Number(process.env['PORT'] ?? 3000);

export const env = {
  port,
  databaseUrl: required('DATABASE_URL'),
  // Optional: raises the GitHub API rate limit for `github` post enrichment.
  githubToken: optional('GITHUB_TOKEN'),
  // Local-disk store for user-uploaded video files.
  uploadDir: process.env['UPLOAD_DIR'] ?? 'uploads',
  maxUploadBytes: Number(process.env['MAX_UPLOAD_BYTES'] ?? 50 * 1024 * 1024),
  // Absolute base used to build public URLs for uploaded files.
  publicBaseUrl: process.env['PUBLIC_BASE_URL'] ?? `http://localhost:${port}`,
} as const;
