// API routes for single project (GET, PUT, DELETE)
import type { NextApiResponse } from "next";
import { initAuth } from "../../../../lib/authMiddleware";
import { storage } from "../../../../../server/storage";
import { compose, requireAuth, requireRole, validateBody, withRateLimit } from "../../../../../server/middleware";
import { AuthenticatedRequest } from "../../../../../server/types";
import { ProjectUpdateSchema } from "../../../../../shared/validation";

async function handleGet(req: AuthenticatedRequest, res: NextApiResponse) {
  const userId = req.user!.id;
  const projectId = parseInt(req.query.id as string);
  if (isNaN(projectId)) {
    return res.status(400).json({ message: "Invalid project ID" });
  }
  
  const project = await storage.getProject(projectId, userId);
  if (!project) {
    return res.status(404).json({ message: "Project not found" });
  }
  return res.json(project);
}

async function handlePut(req: AuthenticatedRequest, res: NextApiResponse) {
  const userId = req.user!.id;
  const projectId = parseInt(req.query.id as string);
  if (isNaN(projectId)) {
    return res.status(400).json({ message: "Invalid project ID" });
  }
  
  const project = await storage.updateProject(projectId, userId, req.body);
  if (!project) {
    return res.status(404).json({ message: "Project not found" });
  }
  return res.json(project);
}

async function handleDelete(req: AuthenticatedRequest, res: NextApiResponse) {
  const userId = req.user!.id;
  const projectId = parseInt(req.query.id as string);
  if (isNaN(projectId)) {
    return res.status(400).json({ message: "Invalid project ID" });
  }
  
  await storage.deleteProject(projectId, userId);
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
        withRateLimit({ windowMs: 60000, maxRequests: 100 }),
        requireAuth,
        requireRole("property_manager")
      )(handleGet)(req, res);
    }

    if (req.method === "PUT") {
      return compose(
        withRateLimit({ windowMs: 60000, maxRequests: 30 }),
        requireAuth,
        requireRole("property_manager"),
        validateBody(ProjectUpdateSchema)
      )(handlePut)(req, res);
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
    console.error("Project API error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
