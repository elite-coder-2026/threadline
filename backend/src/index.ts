// Process entry point: build the app and start listening.
import { createApp } from './app.js';
import { env } from './config/env.js';
import { pool } from './db/pool.js';

const app = createApp();

const server = app.listen(env.port, () => {
  // eslint-disable-next-line no-console
  console.log(`thread-line listening on http://localhost:${env.port}`);
});

const shutdown = (signal: string): void => {
  // eslint-disable-next-line no-console
  console.log(`\n${signal} received, shutting down.`);
  server.close(() => {
    pool.end().finally(() => process.exit(0));
  });
};

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
