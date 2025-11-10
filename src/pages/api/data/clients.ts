// API routes for clients (GET all, POST)
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
      const clients = await storage.getClients(userId);
      return res.json(clients);
    }

    if (req.method === "POST") {
      const clientData = req.body;
      const client = await storage.createClient({
        ...clientData,
        userId,
      });
      return res.status(201).json(client);
    }

    return res.status(405).json({ message: "Method not allowed" });
  } catch (error) {
    console.error("Clients API error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
