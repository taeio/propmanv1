import { NextApiRequest } from 'next';

export interface AuthenticatedUser {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  clientId?: number | null;
  stripeConnectedAccountId?: string | null;
}

export interface AuthenticatedRequest extends NextApiRequest {
  user?: AuthenticatedUser;
  isAuthenticated(): boolean;
  login(user: AuthenticatedUser, done: (err: any) => void): void;
  logout(done: (err: any) => void): void;
}
