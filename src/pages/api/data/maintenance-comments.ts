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
      const { issueId } = req.query;
      const comments = await storage.getMaintenanceComments(Number(issueId), userId);
      return res.json(comments);
    }

    if (req.method === "POST") {
      const commentData = req.body;
      const comment = await storage.createMaintenanceComment({
        ...commentData,
        userId,
      });
      return res.status(201).json(comment);
    }

    if (req.method === "DELETE") {
      const { id } = req.query;
      await storage.deleteMaintenanceComment(Number(id), userId);
      return res.status(204).end();
    }

    return res.status(405).json({ message: "Method not allowed" });
  } catch (error) {
    console.error("Maintenance Comments API error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
