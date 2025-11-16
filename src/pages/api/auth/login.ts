import type { NextApiRequest, NextApiResponse } from "next";
import passport from "passport";
import { initAuth } from "../../../lib/authMiddleware";
import { setupLocalAuth } from "../../../../server/localAuth";
import { authRateLimit } from "../../../../server/rateLimit";

let isLocalStrategyRegistered = false;

async function loginHandler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    await initAuth(req, res);
    
    if (!isLocalStrategyRegistered) {
      setupLocalAuth();
      isLocalStrategyRegistered = true;
    }

    passport.authenticate("local", (err: Error, user: Express.User, info: any) => {
      if (err) {
        console.error("Authentication error:", err);
        return res.status(500).json({ error: "Authentication failed" });
      }

      if (!user) {
        return res.status(401).json({ error: info?.message || "Invalid credentials" });
      }

      (req as any).login(user, (loginErr: Error) => {
        if (loginErr) {
          console.error("Login error:", loginErr);
          return res.status(500).json({ error: "Login failed" });
        }

        res.status(200).json({
          id: user.id,
          username: user.username,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: (user as any).role,
        });
      });
    })(req, res);
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Authentication failed" });
  }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  return new Promise<void>((resolve) => {
    authRateLimit(req, res, async () => {
      await loginHandler(req, res);
      resolve();
    });
  });
}
