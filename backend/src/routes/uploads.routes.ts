// Layer 1 — HTTP wiring. identity -> multipart parse (1 file, size-capped) -> controller.
import { Router } from 'express';
import multer from 'multer';
import { uploadsController } from '../controllers/uploads.controller.js';
import { currentUser } from '../shared/current-user.js';
import { asyncHandler } from '../shared/async-handler.js';
import { env } from '../config/env.js';

// Buffer in memory, then the service validates and the repository writes to disk.
const parseUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: env.maxUploadBytes, files: 1 },
});

export const uploadsRoutes = Router();

uploadsRoutes.use(currentUser);

// POST /api/uploads  — upload one video file, returns { url, ... }
uploadsRoutes.post(
  '/',
  parseUpload.single('file'),
  asyncHandler(uploadsController.createVideo),
);
