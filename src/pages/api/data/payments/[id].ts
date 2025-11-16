import type { NextApiResponse } from "next";
import { initAuth } from "../../../../lib/authMiddleware";
import { storage } from "../../../../../server/storage";
import { compose, requireAuth, requireRole, validateBody, withRateLimit } from "../../../../../server/middleware";
import { AuthenticatedRequest } from "../../../../../server/types";
import { PaymentSchema } from "../../../../../shared/validation";

async function handleGet(req: AuthenticatedRequest, res: NextApiResponse): Promise<void> {
  const userId = req.user!.id;
  const id = parseInt(req.query.id as string, 10);
  
  const payment = await storage.getPayment(id, userId);
  if (!payment) {
    res.status(404).json({ error: "Payment not found" });
    return;
  }
  res.json(payment);
}

async function handlePut(req: AuthenticatedRequest, res: NextApiResponse): Promise<void> {
  const userId = req.user!.id;
  const id = parseInt(req.query.id as string, 10);
  const paymentData = req.body;
  
  const payment = await storage.updatePayment(id, userId, paymentData);
  if (!payment) {
    res.status(404).json({ error: "Payment not found" });
    return;
  }
  res.json(payment);
}

async function handleDelete(req: AuthenticatedRequest, res: NextApiResponse): Promise<void> {
  const userId = req.user!.id;
  const id = parseInt(req.query.id as string, 10);
  
  await storage.deletePayment(id, userId);
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
        withRateLimit({ windowMs: 60000, maxRequests: 100, routePattern: '/api/data/payments/[id]' }),
        requireAuth,
        requireRole("property_manager")
      )(handleGet)(req, res);
    }

    if (req.method === "PUT") {
      return compose(
        withRateLimit({ windowMs: 60000, maxRequests: 30, routePattern: '/api/data/payments/[id]' }),
        requireAuth,
        requireRole("property_manager"),
        validateBody(PaymentSchema.partial())
      )(handlePut)(req, res);
    }

    if (req.method === "DELETE") {
      return compose(
        withRateLimit({ windowMs: 60000, maxRequests: 30, routePattern: '/api/data/payments/[id]' }),
        requireAuth,
        requireRole("property_manager")
      )(handleDelete)(req, res);
    }

    return res.status(405).json({ message: "Method not allowed" });
  } catch (error) {
    console.error("Payments API error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
