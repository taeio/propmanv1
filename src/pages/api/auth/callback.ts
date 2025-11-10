// OAuth callback route
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
      successReturnToOrRedirect: "/",
      failureRedirect: "/api/auth/login",
    })(req as any, res as any);
  } catch (error) {
    console.error("Callback error:", error);
    res.status(500).json({ error: "Authentication callback failed" });
  }
}
