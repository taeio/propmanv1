// Login route - initiates OAuth flow
import type { NextApiRequest, NextApiResponse } from "next";
import passport from "passport";
import { initAuth, getPassportMiddleware } from "../../../lib/authMiddleware";

// Track registered strategies
const registeredStrategies = new Set<string>();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    await initAuth(req, res);
    
    const { strategy, strategyName } = await getPassportMiddleware(req.headers.host || "");
    
    // Register strategy if not already registered
    if (!registeredStrategies.has(strategyName)) {
      passport.use(strategy);
      registeredStrategies.add(strategyName);
    }

    passport.authenticate(strategyName, {
      prompt: "login consent",
      scope: ["openid", "email", "profile", "offline_access"],
    })(req as any, res as any);
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Authentication failed" });
  }
}
