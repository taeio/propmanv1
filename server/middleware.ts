import { NextApiResponse } from 'next';
import { z, ZodError } from 'zod';
import { AuthenticatedRequest } from './types';
import { RateLimitConfig, rateLimit as createRateLimit } from './rateLimit';

export type ApiHandler = (req: AuthenticatedRequest, res: NextApiResponse) => Promise<void> | void;

export { requireCsrf } from './csrf';

export function validateBody<T extends z.ZodType>(schema: T) {
  return (handler: ApiHandler): ApiHandler => {
    return async (req: AuthenticatedRequest, res: NextApiResponse) => {
      try {
        const validated = schema.parse(req.body);
        req.body = validated;
        return handler(req, res);
      } catch (error) {
        if (error instanceof ZodError) {
          const zodError = error as z.ZodError;
          return res.status(400).json({
            error: 'Validation failed',
            details: zodError.issues.map((e: z.ZodIssue) => ({
              field: e.path.join('.'),
              message: e.message,
            })),
          });
        }
        return res.status(400).json({ error: 'Invalid request body' });
      }
    };
  };
}

export function requireAuth(handler: ApiHandler): ApiHandler {
  return async (req: AuthenticatedRequest, res: NextApiResponse) => {
    if (!req.isAuthenticated || !req.isAuthenticated() || !req.user || !req.user.id) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    return handler(req, res);
  };
}

export function requireRole(...allowedRoles: string[]) {
  return (handler: ApiHandler): ApiHandler => {
    return async (req: AuthenticatedRequest, res: NextApiResponse) => {
      if (!req.isAuthenticated || !req.isAuthenticated()) {
        return res.status(401).json({ error: 'Authentication required' });
      }
      
      const user = req.user;
      if (!user || !allowedRoles.includes(user.role)) {
        return res.status(403).json({ error: 'Insufficient permissions' });
      }
      
      return handler(req, res);
    };
  };
}

export function withRateLimit(config: RateLimitConfig) {
  return (handler: ApiHandler): ApiHandler => {
    const limiter = createRateLimit(config);
    return async (req: AuthenticatedRequest, res: NextApiResponse) => {
      await limiter(req as any, res, async () => {
        await handler(req, res);
      });
    };
  };
}

export function compose(...middlewares: ((handler: ApiHandler) => ApiHandler)[]) {
  return (handler: ApiHandler): ApiHandler => {
    return middlewares.reduceRight(
      (wrappedHandler, middleware) => middleware(wrappedHandler),
      handler
    );
  };
}

export function validateUserId(handler: ApiHandler): ApiHandler {
  return async (req: AuthenticatedRequest, res: NextApiResponse) => {
    const user = req.user;
    if (!user || !user.id) {
      return res.status(401).json({ error: 'User ID not found' });
    }
    return handler(req, res);
  };
}
