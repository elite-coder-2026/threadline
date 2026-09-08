// Layer 1 — HTTP. Pull the parsed file off the request, call the service,
// shape the response. Multipart parsing itself is middleware (see the route).
import type { Request, Response } from 'express';
import { uploadsService } from '../services/uploads.service.js';
import { requireUserId } from '../shared/current-user.js';
import { unprocessable } from '../shared/http-error.js';

const createVideo = async (req: Request, res: Response): Promise<void> => {
  requireUserId(req);

  const file = req.file;
  if (!file) {
    throw unprocessable('Expected a video file in the "file" field.');
  }

  const uploaded = await uploadsService.saveVideo({
    originalName: file.originalname,
    contentType: file.mimetype,
    bytes: file.buffer,
  });
  res.status(201).json(uploaded);
};

export const uploadsController = { createVideo };
