// Ambient augmentation: the currentUser middleware (Layer 1) attaches the
// authenticated user id to the request. Kept in the HTTP layer's vocabulary.
declare global {
  namespace Express {
    interface Request {
      userId?: string;
    }
  }
}

export {};
