import type { NextApiResponse } from "next";
import { initAuth } from "../../../lib/authMiddleware";
import { storage } from "../../../../server/storage";
import { compose, requireAuth, requireRole, validateBody, withRateLimit } from "../../../../server/middleware";
import { AuthenticatedRequest } from "../../../../server/types";
import { MaintenanceIssueSchema, MaintenanceIssueUpdateSchema } from "../../../../shared/validation";

async function handleGet(req: AuthenticatedRequest, res: NextApiResponse): Promise<void> {
  const userId = req.user!.id;
  const issues = await storage.getMaintenanceIssues(userId);
  res.json(issues);
}

async function handlePost(req: AuthenticatedRequest, res: NextApiResponse): Promise<void> {
  const userId = req.user!.id;
  const issueData = req.body;
  
  const project = await storage.getProject(issueData.projectId, userId);
  if (!project) {
    res.status(403).json({ message: "Forbidden: Project not found or access denied" });
    return;
  }
  
  const issue = await storage.createMaintenanceIssue({
    ...issueData,
    createdBy: userId,
  });
  res.status(201).json(issue);
}

async function handlePut(req: AuthenticatedRequest, res: NextApiResponse): Promise<void> {
  const userId = req.user!.id;
  const { id, ...data } = req.body;
  if (!id || isNaN(Number(id))) {
    res.status(400).json({ message: "Invalid issue ID" });
    return;
  }
  const issue = await storage.updateMaintenanceIssue(Number(id), userId, data);
  if (!issue) {
    res.status(404).json({ message: "Issue not found" });
    return;
  }
  res.json(issue);
}

async function handleDelete(req: AuthenticatedRequest, res: NextApiResponse): Promise<void> {
  const userId = req.user!.id;
  const { id } = req.query;
  const issueId = Number(id);
  if (isNaN(issueId)) {
    res.status(400).json({ message: "Invalid issue ID" });
    return;
  }
  await storage.deleteMaintenanceIssue(issueId, userId);
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
        withRateLimit({ windowMs: 60000, maxRequests: 100, routePattern: '/api/data/maintenance-issues' }),
        requireAuth
      )(handleGet)(req, res);
    }

    if (req.method === "POST") {
      return compose(
        withRateLimit({ windowMs: 60000, maxRequests: 30, routePattern: '/api/data/maintenance-issues' }),
        requireAuth,
        validateBody(MaintenanceIssueSchema)
      )(handlePost)(req, res);
    }

    if (req.method === "PUT") {
      return compose(
        withRateLimit({ windowMs: 60000, maxRequests: 30, routePattern: '/api/data/maintenance-issues' }),
        requireAuth,
        requireRole("property_manager"),
        validateBody(MaintenanceIssueUpdateSchema)
      )(handlePut)(req, res);
    }

    if (req.method === "DELETE") {
      return compose(
        withRateLimit({ windowMs: 60000, maxRequests: 30, routePattern: '/api/data/maintenance-issues' }),
        requireAuth,
        requireRole("property_manager")
      )(handleDelete)(req, res);
    }

    return res.status(405).json({ message: "Method not allowed" });
  } catch (error) {
    console.error("Maintenance Issues API error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
