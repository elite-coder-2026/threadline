import type { NextFunction, Request, Response } from 'express';

// Services (Layer 2) throw AppError to signal an outcome. They do NOT know
// this becomes an HTTP status — the error middleware (Layer 1) maps it.
export class AppError extends Error {
  readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = 'AppError';
    this.status = status;
  }
}

export const notFound = (message: string): AppError => new AppError(404, message);
export const unprocessable = (message: string): AppError => new AppError(422, message);
export const unauthorized = (message: string): AppError => new AppError(401, message);

// Express error-handling middleware. Mounted last, in app.ts.
export const errorMiddleware = (
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void => {
  if (err instanceof AppError) {
    res.status(err.status).json({ error: err.message });
    return;
  }
  // multer rejects oversized / malformed uploads with a MulterError — a client
  // problem, not a 500.
  if (err instanceof Error && err.name === 'MulterError') {
    const tooBig = 'code' in err && err.code === 'LIMIT_FILE_SIZE';
    res.status(tooBig ? 413 : 422).json({
      error: tooBig ? 'The uploaded file is too large.' : `Upload rejected: ${err.message}`,
    });
    return;
  }
  // eslint-disable-next-line no-console
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal Server Error' });
};
