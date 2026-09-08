import type { NextFunction, Request, Response } from 'express';
import { unauthorized } from './http-error.js';

// Stand-in for real auth so the vertical slice is runnable. Reads the caller's
// identity from the `x-user-id` header and puts it on the request. Layer 1 only.
export const currentUser = (req: Request, _res: Response, next: NextFunction): void => {
  const header = req.header('x-user-id');
  if (!header) {
    next(unauthorized('Missing x-user-id header.'));
    return;
  }
  req.userId = header;
  next();
};

// Non-null accessor for controllers running behind `currentUser`.
export const requireUserId = (req: Request): string => {
  if (!req.userId) {
    throw unauthorized('Missing x-user-id header.');
  }
  return req.userId;
};
