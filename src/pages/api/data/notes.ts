// API routes for notes (GET all, POST)
import type { NextApiRequest, NextApiResponse } from "next";
import { initAuth } from "../../../lib/authMiddleware";
import { storage } from "../../../../server/storage";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    await initAuth(req, res);

    if (!(req as any).isAuthenticated || !(req as any).isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const userId = (req as any).user?.claims?.sub;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (req.method === "GET") {
      const notes = await storage.getNotes(userId);
      return res.json(notes);
    }

    if (req.method === "POST") {
      const noteData = req.body;
      const note = await storage.createNote({
        ...noteData,
        userId,
      });
      return res.status(201).json(note);
    }

    return res.status(405).json({ message: "Method not allowed" });
  } catch (error) {
    console.error("Notes API error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
