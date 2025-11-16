import type { NextApiRequest, NextApiResponse } from "next";
import passport from "passport";
import { initAuth } from "../../../lib/authMiddleware";
import { setupLocalAuth } from "../../../../server/localAuth";
import { withRateLimit } from "../../../../server/middleware";
import { AuthenticatedRequest } from "../../../../server/types";

let isLocalStrategyRegistered = false;

async function loginHandler(
  req: AuthenticatedRequest,
  res: NextApiResponse
) {
  if (!isLocalStrategyRegistered) {
    setupLocalAuth();
    isLocalStrategyRegistered = true;
  }

  return new Promise<void>((resolve, reject) => {
    try {
      passport.authenticate("local", (err: Error, user: Express.User, info: any) => {
        if (err) {
          console.error("Authentication error:", err);
          res.status(500).json({ error: "Authentication failed" });
          return reject(err);
        }

        if (!user) {
          res.status(401).json({ error: info?.message || "Invalid credentials" });
          return resolve();
        }

        (req as any).login(user, (loginErr: Error) => {
          if (loginErr) {
            console.error("Login error:", loginErr);
            res.status(500).json({ error: "Login failed" });
            return reject(loginErr);
          }

          res.status(200).json({
            id: user.id,
            username: user.username,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            role: (user as any).role,
          });
          resolve();
        });
      })(req, res);
    } catch (error) {
      reject(error);
    }
  });
}

export default async function handler(
  req: AuthenticatedRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    await initAuth(req, res);
    
    return withRateLimit({ 
      windowMs: 15 * 60 * 1000, 
      maxRequests: 10,
      routePattern: '/api/auth/login'
    })(loginHandler)(req, res);
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ error: "Authentication failed" });
  }
}
