import { NextApiRequest, NextApiResponse } from "next";

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

const store: RateLimitStore = {};

const CLEANUP_INTERVAL = 60000; // Clean up old entries every minute

setInterval(() => {
  const now = Date.now();
  Object.keys(store).forEach(key => {
    if (store[key].resetTime < now) {
      delete store[key];
    }
  });
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
    const identifier = getClientIdentifier(req);
    const routePattern = config.routePattern || normalizeRoute(req.url);
    const key = `${identifier}:${req.method}:${routePattern}`;
    const now = Date.now();

    if (!store[key]) {
      store[key] = {
        count: 1,
        resetTime: now + config.windowMs,
      };
      res.setHeader('X-RateLimit-Limit', config.maxRequests.toString());
      res.setHeader('X-RateLimit-Remaining', (config.maxRequests - 1).toString());
      res.setHeader('X-RateLimit-Reset', store[key].resetTime.toString());
      return next();
    }

    if (now > store[key].resetTime) {
      store[key] = {
        count: 1,
        resetTime: now + config.windowMs,
      };
      res.setHeader('X-RateLimit-Limit', config.maxRequests.toString());
      res.setHeader('X-RateLimit-Remaining', (config.maxRequests - 1).toString());
      res.setHeader('X-RateLimit-Reset', store[key].resetTime.toString());
      return next();
    }

    if (store[key].count >= config.maxRequests) {
      const retryAfter = Math.ceil((store[key].resetTime - now) / 1000);
      res.setHeader('Retry-After', retryAfter.toString());
      res.setHeader('X-RateLimit-Limit', config.maxRequests.toString());
      res.setHeader('X-RateLimit-Remaining', '0');
      res.setHeader('X-RateLimit-Reset', store[key].resetTime.toString());
      
      return res.status(429).json({
        error: config.message || 'Too many requests, please try again later.',
        retryAfter,
      });
    }

    store[key].count++;
    
    res.setHeader('X-RateLimit-Limit', config.maxRequests.toString());
    res.setHeader('X-RateLimit-Remaining', (config.maxRequests - store[key].count).toString());
    res.setHeader('X-RateLimit-Reset', store[key].resetTime.toString());
    
    return next();
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
