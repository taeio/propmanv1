// API routes for single note (GET, PUT, DELETE)
import type { NextApiResponse } from "next";
import { initAuth } from "../../../../lib/authMiddleware";
import { storage } from "../../../../../server/storage";
import { compose, requireCsrf, requireAuth, requireRole, validateBody, withRateLimit } from "../../../../../server/middleware";
import { AuthenticatedRequest } from "../../../../../server/types";
import { NoteUpdateSchema } from "../../../../../shared/validation";

async function handleGet(req: AuthenticatedRequest, res: NextApiResponse) {
  const userId = req.user!.id;
  const noteId = parseInt(req.query.id as string);
  if (isNaN(noteId)) {
    return res.status(400).json({ message: "Invalid note ID" });
  }
  
  const note = await storage.getNote(noteId, userId);
  if (!note) {
    return res.status(404).json({ message: "Note not found" });
  }
  return res.json(note);
}

async function handlePut(req: AuthenticatedRequest, res: NextApiResponse) {
  const userId = req.user!.id;
  const noteId = parseInt(req.query.id as string);
  if (isNaN(noteId)) {
    return res.status(400).json({ message: "Invalid note ID" });
  }
  
  const note = await storage.updateNote(noteId, userId, req.body);
  if (!note) {
    return res.status(404).json({ message: "Note not found" });
  }
  return res.json(note);
}

async function handleDelete(req: AuthenticatedRequest, res: NextApiResponse) {
  const userId = req.user!.id;
  const noteId = parseInt(req.query.id as string);
  if (isNaN(noteId)) {
    return res.status(400).json({ message: "Invalid note ID" });
  }
  
  await storage.deleteNote(noteId, userId);
  return res.status(204).end();
}

export default async function handler(
  req: AuthenticatedRequest,
  res: NextApiResponse
) {
  try {
    await initAuth(req, res);

    if (req.method === "GET") {
      return compose(
        withRateLimit({ windowMs: 60000, maxRequests: 100, routePattern: '/api/data/notes/[id]' }),
        requireAuth,
        requireRole("property_manager")
      )(handleGet)(req, res);
    }

    if (req.method === "PUT") {
      return compose(
        withRateLimit({ windowMs: 60000, maxRequests: 30, routePattern: '/api/data/notes/[id]' }),
        requireCsrf,
        requireAuth,
        requireRole("property_manager"),
        validateBody(NoteUpdateSchema)
      )(handlePut)(req, res);
    }

    if (req.method === "DELETE") {
      return compose(
        withRateLimit({ windowMs: 60000, maxRequests: 30, routePattern: '/api/data/notes/[id]' }),
        requireCsrf,
        requireAuth,
        requireRole("property_manager")
      )(handleDelete)(req, res);
    }

    return res.status(405).json({ message: "Method not allowed" });
  } catch (error) {
    console.error("Note API error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
