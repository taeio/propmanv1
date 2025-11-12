// Logout route
import type { NextApiRequest, NextApiResponse } from "next";
import { initAuth } from "../../../lib/authMiddleware";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    await initAuth(req, res);
    
    (req as any).logout((err: any) => {
      if (err) {
        console.error("Logout error:", err);
        return res.status(500).json({ error: "Logout failed" });
      }
      
      (req as any).session.destroy((destroyErr: any) => {
        if (destroyErr) {
          console.error("Session destroy error:", destroyErr);
          return res.status(500).json({ error: "Failed to destroy session" });
        }
        
        res.status(200).json({ success: true });
      });
    });
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({ error: "Logout failed" });
  }
}
