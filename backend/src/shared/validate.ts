import type { NextFunction, Request, Response } from 'express';
import type { ZodTypeAny, TypeOf } from 'zod';

type Source = 'body' | 'query' | 'params';

// Parses one part of the request with a Zod schema. On success the typed value
// is placed on `res.locals[source]` for the controller. On failure it responds
// 400 with the issue list. Layer 1 only — shapes never reach the service.
export const validate =
  (schema: ZodTypeAny, source: Source) =>
  (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req[source]);
    if (!result.success) {
      res.status(400).json({
        error: 'Invalid request',
        issues: result.error.issues.map((issue) => ({
          path: issue.path.join('.'),
          message: issue.message,
        })),
      });
      return;
    }
    res.locals[source] = result.data;
    next();
  };

// Typed accessor for whatever `validate(schema, source)` stored. Pass the same
// schema so the return type is inferred; the value itself is not re-parsed.
export const valid = <S extends ZodTypeAny>(
  res: Response,
  source: Source,
  _schema: S,
): TypeOf<S> => res.locals[source] as TypeOf<S>;
