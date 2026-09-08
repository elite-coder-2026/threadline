// Layer 1 — combines every feature router under /api.
import { Router } from 'express';
import { postsRoutes } from './posts.routes.js';
import { uploadsRoutes } from './uploads.routes.js';

export const apiRoutes = Router();

apiRoutes.use('/posts', postsRoutes);
apiRoutes.use('/uploads', uploadsRoutes);
