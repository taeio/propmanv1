// Logout route
import type { NextApiRequest, NextApiResponse } from "next";
import * as client from "openid-client";
import { initAuth } from "../../../lib/authMiddleware";

const getOidcConfig = async () => {
  return await client.discovery(
    new URL(process.env.ISSUER_URL ?? "https://replit.com/oidc"),
    process.env.REPL_ID!
  );
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    await initAuth(req, res);
    
    (req as any).logout(() => {
      getOidcConfig().then((config) => {
        const logoutUrl = client.buildEndSessionUrl(config, {
          client_id: process.env.REPL_ID!,
          post_logout_redirect_uri: `${req.headers["x-forwarded-proto"] || "https"}://${req.headers.host}`,
        }).href;
        
        res.redirect(logoutUrl);
      });
    });
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({ error: "Logout failed" });
  }
}
