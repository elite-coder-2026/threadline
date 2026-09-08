import type { NextFunction, Request, Response } from 'express';

type AsyncController = (req: Request, res: Response) => Promise<void>;

// Wraps an async arrow controller so a rejected promise is forwarded to the
// Express error middleware instead of crashing the process.
export const asyncHandler =
  (controller: AsyncController) =>
  (req: Request, res: Response, next: NextFunction): void => {
    controller(req, res).catch(next);
  };
