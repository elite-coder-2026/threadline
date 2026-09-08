// Express app assembly, no listen() — importable by tests.
import { resolve } from 'node:path';
import express from 'express';
import type { Express } from 'express';
import { apiRoutes } from './routes/index.js';
import { errorMiddleware } from './shared/http-error.js';
import { env } from './config/env.js';
// src/types/express.d.ts is picked up ambiently — it augments Express.Request.

export const createApp = (): Express => {
  const app = express();

  // Dev CORS: the Vite client (localhost:5173) is a different origin, and the
  // custom x-user-id header makes the browser send a preflight OPTIONS request.
  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', process.env['CORS_ORIGIN'] ?? '*');
    res.header('Access-Control-Allow-Methods', 'GET,POST,DELETE,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'content-type,x-user-id');
    if (req.method === 'OPTIONS') {
      res.sendStatus(204);
      return;
    }
    next();
  });

  app.use(express.json());

  app.get('/health', (_req, res) => {
    res.json({ status: 'ok' });
  });

  // User-uploaded video files, served straight from the local upload dir.
  app.use(
    '/uploads',
    express.static(resolve(process.cwd(), env.uploadDir), {
      immutable: true,
      maxAge: '1y',
    }),
  );

  app.use('/api', apiRoutes);

  // Must be last: turns thrown AppError / rejections into HTTP responses.
  app.use(errorMiddleware);

  return app;
};
