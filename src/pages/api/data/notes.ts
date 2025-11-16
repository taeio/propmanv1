// API routes for notes (GET all, POST)
import type { NextApiResponse } from "next";
import { initAuth } from "../../../lib/authMiddleware";
import { storage } from "../../../../server/storage";
import { compose, requireAuth, requireRole, validateBody, withRateLimit } from "../../../../server/middleware";
import { AuthenticatedRequest } from "../../../../server/types";
import { NoteSchema } from "../../../../shared/validation";

async function handleGet(req: AuthenticatedRequest, res: NextApiResponse) {
  const userId = req.user!.id;
  const notes = await storage.getNotes(userId);
  return res.json(notes);
}

async function handlePost(req: AuthenticatedRequest, res: NextApiResponse) {
  const userId = req.user!.id;
  const noteData = req.body;
  const note = await storage.createNote({
    ...noteData,
    userId,
  });
  return res.status(201).json(note);
}

export default async function handler(
  req: AuthenticatedRequest,
  res: NextApiResponse
) {
  try {
    await initAuth(req, res);

    if (req.method === "GET") {
      return compose(
        withRateLimit({ windowMs: 60000, maxRequests: 100, routePattern: '/api/data/notes' }),
        requireAuth,
        requireRole("property_manager")
      )(handleGet)(req, res);
    }

    if (req.method === "POST") {
      return compose(
        withRateLimit({ windowMs: 60000, maxRequests: 30, routePattern: '/api/data/notes' }),
        requireAuth,
        requireRole("property_manager"),
        validateBody(NoteSchema)
      )(handlePost)(req, res);
    }

    return res.status(405).json({ message: "Method not allowed" });
  } catch (error) {
    console.error("Notes API error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
