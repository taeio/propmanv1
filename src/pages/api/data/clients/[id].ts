// API routes for single client (GET, PUT, DELETE)
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

    const clientId = parseInt(req.query.id as string);
    if (isNaN(clientId)) {
      return res.status(400).json({ message: "Invalid client ID" });
    }

    if (req.method === "GET") {
      const client = await storage.getClient(clientId, userId);
      if (!client) {
        return res.status(404).json({ message: "Client not found" });
      }
      return res.json(client);
    }

    if (req.method === "PUT") {
      const client = await storage.updateClient(clientId, userId, req.body);
      if (!client) {
        return res.status(404).json({ message: "Client not found" });
      }
      return res.json(client);
    }

    if (req.method === "DELETE") {
      await storage.deleteClient(clientId, userId);
      return res.status(204).end();
    }

    return res.status(405).json({ message: "Method not allowed" });
  } catch (error) {
    console.error("Client API error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
