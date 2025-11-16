// API routes for clients (GET all, POST)
import type { NextApiResponse } from "next";
import { initAuth } from "../../../lib/authMiddleware";
import { storage } from "../../../../server/storage";
import { compose, requireAuth, requireRole, validateBody } from "../../../../server/middleware";
import { AuthenticatedRequest } from "../../../../server/types";
import { ClientSchema } from "../../../../shared/validation";

async function handleGet(req: AuthenticatedRequest, res: NextApiResponse) {
  const userId = req.user!.id;
  const clients = await storage.getClients(userId);
  return res.json(clients);
}

async function handlePost(req: AuthenticatedRequest, res: NextApiResponse) {
  const userId = req.user!.id;
  const clientData = req.body;
  const client = await storage.createClient({
    ...clientData,
    userId,
  });
  return res.status(201).json(client);
}

export default async function handler(
  req: AuthenticatedRequest,
  res: NextApiResponse
) {
  try {
    await initAuth(req, res);

    if (req.method === "GET") {
      return compose(requireAuth, requireRole("property_manager"))(handleGet)(req, res);
    }

    if (req.method === "POST") {
      return compose(
        requireAuth,
        requireRole("property_manager"),
        validateBody(ClientSchema)
      )(handlePost)(req, res);
    }

    return res.status(405).json({ message: "Method not allowed" });
  } catch (error) {
    console.error("Clients API error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
