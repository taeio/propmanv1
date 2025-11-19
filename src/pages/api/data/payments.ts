import type { NextApiResponse } from "next";
import { initAuth } from "../../../lib/authMiddleware";
import { storage } from "../../../../server/storage";
import { compose, requireCsrf, requireAuth, requireRole, validateBody, withRateLimit } from "../../../../server/middleware";
import { AuthenticatedRequest } from "../../../../server/types";
import { PaymentSchema } from "../../../../shared/validation";

async function handleGet(req: AuthenticatedRequest, res: NextApiResponse) {
  const userId = req.user!.id;
  const payments = await storage.getPayments(userId);
  return res.json(payments);
}

async function handlePost(req: AuthenticatedRequest, res: NextApiResponse) {
  const userId = req.user!.id;
  const paymentData = req.body;
  const payment = await storage.createPayment({
    ...paymentData,
    userId,
  });
  return res.status(201).json(payment);
}

export default async function handler(
  req: AuthenticatedRequest,
  res: NextApiResponse
) {
  try {
    await initAuth(req, res);

    if (req.method === "GET") {
      return compose(
        withRateLimit({ windowMs: 60000, maxRequests: 100, routePattern: '/api/data/payments' }),
        requireAuth,
        requireRole("property_manager")
      )(handleGet)(req, res);
    }

    if (req.method === "POST") {
      return compose(
        withRateLimit({ windowMs: 60000, maxRequests: 30, routePattern: '/api/data/payments' }),
        requireCsrf,
        requireAuth,
        requireRole("property_manager"),
        validateBody(PaymentSchema)
      )(handlePost)(req, res);
    }

    return res.status(405).json({ message: "Method not allowed" });
  } catch (error) {
    console.error("Payments API error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
