// Auth middleware helper for Next.js API routes
import { getSession, getPassportMiddleware as getPassportMw } from "../../server/replitAuth";
import passport from "passport";
import type { NextApiRequest, NextApiResponse } from "next";

// Re-export for convenience
export { getPassportMiddleware } from "../../server/replitAuth";

// Initialize session and passport for API routes
export function initAuth(req: NextApiRequest, res: NextApiResponse): Promise<void> {
  return new Promise((resolve, reject) => {
    const sessionMiddleware = getSession();
    sessionMiddleware(req as any, res as any, (err: any) => {
      if (err) return reject(err);
      
      passport.initialize()(req as any, res as any, (err2: any) => {
        if (err2) return reject(err2);
        
        passport.session()(req as any, res as any, (err3: any) => {
          if (err3) return reject(err3);
          resolve();
        });
      });
    });
  });
}

// Serialize/deserialize user for passport
passport.serializeUser((user: Express.User, cb) => cb(null, user));
passport.deserializeUser((user: Express.User, cb) => cb(null, user));

// Helper function to require authentication in API routes
export async function requireAuth(req: NextApiRequest, res: NextApiResponse): Promise<{ id: string } | null> {
  await initAuth(req, res);
  
  if (!(req as any).isAuthenticated || !(req as any).isAuthenticated()) {
    res.status(401).json({ error: "Unauthorized" });
    return null;
  }

  const userId = (req as any).user?.claims?.sub;
  if (!userId) {
    res.status(401).json({ error: "Unauthorized" });
    return null;
  }
  
  return { id: userId };
}
