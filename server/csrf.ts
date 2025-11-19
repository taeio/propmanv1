import { NextApiRequest, NextApiResponse } from 'next';
import Tokens from 'csrf';
import { serialize, parse } from 'cookie';
import { AuthenticatedRequest } from './types';
import { ApiHandler } from './middleware';

const tokens = new Tokens();
const CSRF_SECRET_COOKIE = '_csrf_secret';
const CSRF_TOKEN_HEADER = 'x-csrf-token';

export function generateCsrfToken(req: NextApiRequest, res: NextApiResponse): string {
  const cookies = parse(req.headers.cookie || '');
  let secret = cookies[CSRF_SECRET_COOKIE];

  if (!secret) {
    secret = tokens.secretSync();
    const cookie = serialize(CSRF_SECRET_COOKIE, secret, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    });
    res.setHeader('Set-Cookie', cookie);
  }

  return tokens.create(secret);
}

function verifyCsrfToken(req: NextApiRequest): boolean {
  const cookies = parse(req.headers.cookie || '');
  const secret = cookies[CSRF_SECRET_COOKIE];
  const token = req.headers[CSRF_TOKEN_HEADER] as string;

  if (!secret || !token) {
    return false;
  }

  return tokens.verify(secret, token);
}

export function requireCsrf(handler: ApiHandler): ApiHandler {
  return async (req: AuthenticatedRequest, res: NextApiResponse) => {
    const method = req.method?.toUpperCase();
    
    if (method === 'GET' || method === 'HEAD' || method === 'OPTIONS') {
      return handler(req, res);
    }

    if (!verifyCsrfToken(req)) {
      return res.status(403).json({ error: 'Invalid CSRF token' });
    }

    return handler(req, res);
  };
}
