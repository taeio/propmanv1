// API routes for single client (GET, PUT, DELETE)
import type { NextApiResponse } from "next";
import { initAuth } from "../../../../lib/authMiddleware";
import { storage } from "../../../../../server/storage";
import { compose, requireAuth, requireRole, validateBody } from "../../../../../server/middleware";
import { AuthenticatedRequest } from "../../../../../server/types";
import { ClientUpdateSchema } from "../../../../../shared/validation";

async function handleGet(req: AuthenticatedRequest, res: NextApiResponse) {
  const userId = req.user!.id;
  const clientId = parseInt(req.query.id as string);
  if (isNaN(clientId)) {
    return res.status(400).json({ message: "Invalid client ID" });
  }
  
  const client = await storage.getClient(clientId, userId);
  if (!client) {
    return res.status(404).json({ message: "Client not found" });
  }
  return res.json(client);
}

async function handlePut(req: AuthenticatedRequest, res: NextApiResponse) {
  const userId = req.user!.id;
  const clientId = parseInt(req.query.id as string);
  if (isNaN(clientId)) {
    return res.status(400).json({ message: "Invalid client ID" });
  }
  
  const client = await storage.updateClient(clientId, userId, req.body);
  if (!client) {
    return res.status(404).json({ message: "Client not found" });
  }
  return res.json(client);
}

async function handleDelete(req: AuthenticatedRequest, res: NextApiResponse) {
  const userId = req.user!.id;
  const clientId = parseInt(req.query.id as string);
  if (isNaN(clientId)) {
    return res.status(400).json({ message: "Invalid client ID" });
  }
  
  await storage.deleteClient(clientId, userId);
  return res.status(204).end();
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

    if (req.method === "PUT") {
      return compose(
        requireAuth,
        requireRole("property_manager"),
        validateBody(ClientUpdateSchema)
      )(handlePut)(req, res);
    }

    if (req.method === "DELETE") {
      return compose(requireAuth, requireRole("property_manager"))(handleDelete)(req, res);
    }

    return res.status(405).json({ message: "Method not allowed" });
  } catch (error) {
    console.error("Client API error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
