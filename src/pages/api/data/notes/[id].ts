// API routes for single note (GET, PUT, DELETE)
import type { NextApiRequest, NextApiResponse } from "next";
import { initAuth } from "../../../../lib/authMiddleware";
import { storage } from "../../../../../server/storage";

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

    const noteId = parseInt(req.query.id as string);
    if (isNaN(noteId)) {
      return res.status(400).json({ message: "Invalid note ID" });
    }

    if (req.method === "GET") {
      const note = await storage.getNote(noteId, userId);
      if (!note) {
        return res.status(404).json({ message: "Note not found" });
      }
      return res.json(note);
    }

    if (req.method === "PUT") {
      const note = await storage.updateNote(noteId, userId, req.body);
      if (!note) {
        return res.status(404).json({ message: "Note not found" });
      }
      return res.json(note);
    }

    if (req.method === "DELETE") {
      await storage.deleteNote(noteId, userId);
      return res.status(204).end();
    }

    return res.status(405).json({ message: "Method not allowed" });
  } catch (error) {
    console.error("Note API error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
