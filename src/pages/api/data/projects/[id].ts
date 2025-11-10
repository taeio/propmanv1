// API routes for single project (GET, PUT, DELETE)
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

    const projectId = parseInt(req.query.id as string);
    if (isNaN(projectId)) {
      return res.status(400).json({ message: "Invalid project ID" });
    }

    if (req.method === "GET") {
      const project = await storage.getProject(projectId, userId);
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }
      return res.json(project);
    }

    if (req.method === "PUT") {
      const project = await storage.updateProject(projectId, userId, req.body);
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }
      return res.json(project);
    }

    if (req.method === "DELETE") {
      await storage.deleteProject(projectId, userId);
      return res.status(204).end();
    }

    return res.status(405).json({ message: "Method not allowed" });
  } catch (error) {
    console.error("Project API error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
