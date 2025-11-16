import type { NextApiResponse } from "next";
import { initAuth } from "../../../lib/authMiddleware";
import { storage } from "../../../../server/storage";
import { compose, requireAuth, requireRole, validateBody, withRateLimit } from "../../../../server/middleware";
import { AuthenticatedRequest } from "../../../../server/types";
import { MaintenanceCommentSchema } from "../../../../shared/validation";

async function handleGet(req: AuthenticatedRequest, res: NextApiResponse): Promise<void> {
  const userId = req.user!.id;
  const { issueId } = req.query;
  const parsedIssueId = Number(issueId);
  if (isNaN(parsedIssueId)) {
    res.status(400).json({ message: "Invalid issue ID" });
    return;
  }
  const comments = await storage.getMaintenanceComments(parsedIssueId, userId);
  res.json(comments);
}

async function handlePost(req: AuthenticatedRequest, res: NextApiResponse): Promise<void> {
  const userId = req.user!.id;
  const commentData = req.body;
  
  const issue = await storage.getMaintenanceIssue(commentData.issueId, userId);
  if (!issue) {
    res.status(403).json({ message: "Forbidden: Issue not found or access denied" });
    return;
  }
  
  const comment = await storage.createMaintenanceComment({
    ...commentData,
    userId,
  });
  res.status(201).json(comment);
}

async function handleDelete(req: AuthenticatedRequest, res: NextApiResponse): Promise<void> {
  const userId = req.user!.id;
  const { id } = req.query;
  const commentId = Number(id);
  if (isNaN(commentId)) {
    res.status(400).json({ message: "Invalid comment ID" });
    return;
  }
  await storage.deleteMaintenanceComment(commentId, userId);
  res.status(204).end();
}

export default async function handler(
  req: AuthenticatedRequest,
  res: NextApiResponse
) {
  try {
    await initAuth(req, res);

    if (req.method === "GET") {
      return compose(
        withRateLimit({ windowMs: 60000, maxRequests: 100 }),
        requireAuth
      )(handleGet)(req, res);
    }

    if (req.method === "POST") {
      return compose(
        withRateLimit({ windowMs: 60000, maxRequests: 30 }),
        requireAuth,
        validateBody(MaintenanceCommentSchema)
      )(handlePost)(req, res);
    }

    if (req.method === "DELETE") {
      return compose(
        withRateLimit({ windowMs: 60000, maxRequests: 30 }),
        requireAuth,
        requireRole("property_manager")
      )(handleDelete)(req, res);
    }

    return res.status(405).json({ message: "Method not allowed" });
  } catch (error) {
    console.error("Maintenance Comments API error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
