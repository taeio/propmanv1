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
      const issues = await storage.getMaintenanceIssues(userId);
      return res.json(issues);
    }

    if (req.method === "POST") {
      const issueData = req.body;
      const issue = await storage.createMaintenanceIssue({
        ...issueData,
        createdBy: userId,
      });
      return res.status(201).json(issue);
    }

    if (req.method === "PUT") {
      const { id, ...data } = req.body;
      const issue = await storage.updateMaintenanceIssue(id, userId, data);
      if (!issue) {
        return res.status(404).json({ message: "Issue not found" });
      }
      return res.json(issue);
    }

    if (req.method === "DELETE") {
      const { id } = req.query;
      await storage.deleteMaintenanceIssue(Number(id), userId);
      return res.status(204).end();
    }

    return res.status(405).json({ message: "Method not allowed" });
  } catch (error) {
    console.error("Maintenance Issues API error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
