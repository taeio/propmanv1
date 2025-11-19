import { NextApiRequest, NextApiResponse } from "next";
import { storage } from "./storage";

const CLEANUP_INTERVAL = 5 * 60 * 1000; // Clean up old entries every 5 minutes

setInterval(async () => {
  try {
    await storage.cleanupExpiredRateLimits();
  } catch (error) {
    console.error('[Rate Limit] Cleanup error:', error);
  }
}, CLEANUP_INTERVAL);

export interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
  message?: string;
  routePattern?: string;
}

function getClientIdentifier(req: NextApiRequest): string {
  const forwarded = req.headers['x-forwarded-for'];
  const ip = typeof forwarded === 'string' 
    ? forwarded.split(',')[0].trim()
    : req.socket.remoteAddress || 'unknown';
  
  const userId = (req as any).user?.id;
  
  return userId ? `user:${userId}` : `ip:${ip}`;
}

function normalizeRoute(url: string | undefined): string {
  if (!url) return '/unknown';
  
  const pathname = url.split('?')[0];
  
  const segments = pathname.split('/').filter(Boolean);
  
  const staticSegments = new Set([
    'api', 'auth', 'data', 'stripe', 'user', 'connect',
    'login', 'register', 'logout', 'profile', 'hello',
    'create-payment-intent', 'record-payment', 'webhooks',
    'create-account-link', 'status',
    'clients', 'projects', 'notes', 'payments',
    'maintenance-issues', 'maintenance-comments'
  ]);
  
  const normalized = segments.map((segment) => {
    if (staticSegments.has(segment)) {
      return segment;
    }
    
    return '[id]';
  }).join('/');
  
  return `/${normalized}`;
}

export function rateLimit(config: RateLimitConfig) {
  return async (req: NextApiRequest, res: NextApiResponse, next: () => void | Promise<void>) => {
    try {
      const identifier = getClientIdentifier(req);
      const routePattern = config.routePattern || normalizeRoute(req.url);
      const key = `${identifier}:${req.method}:${routePattern}`;
      const now = Date.now();
      const resetTime = new Date(now + config.windowMs);

      const count = await storage.incrementRateLimit(key, resetTime);
      const limit = await storage.getRateLimit(key);
      
      if (!limit) {
        return next();
      }

      const resetTimeMs = limit.resetTime.getTime();
      
      res.setHeader('X-RateLimit-Limit', config.maxRequests.toString());
      res.setHeader('X-RateLimit-Remaining', Math.max(0, config.maxRequests - count).toString());
      res.setHeader('X-RateLimit-Reset', resetTimeMs.toString());

      if (count > config.maxRequests) {
        const retryAfter = Math.ceil((resetTimeMs - now) / 1000);
        res.setHeader('Retry-After', retryAfter.toString());
        
        return res.status(429).json({
          error: config.message || 'Too many requests, please try again later.',
          retryAfter,
        });
      }

      return next();
    } catch (error) {
      console.error('[Rate Limit] Error:', error);
      return next();
    }
  };
}

export const strictRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 5,
  message: 'Too many attempts, please try again later.',
});

export const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 10,
  message: 'Too many authentication attempts, please try again later.',
});

export const apiGetRateLimit = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  maxRequests: 100,
  message: 'Too many GET requests, please slow down.',
});

export const apiPostRateLimit = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  maxRequests: 30,
  message: 'Too many POST requests, please slow down.',
});

export const paymentRateLimit = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  maxRequests: 10,
  message: 'Too many payment requests, please try again later.',
});
