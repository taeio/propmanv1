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

    const id = parseInt(req.query.id as string, 10);

    if (req.method === "GET") {
      const payment = await storage.getPayment(id, userId);
      if (!payment) {
        return res.status(404).json({ error: "Payment not found" });
      }
      return res.json(payment);
    }

    if (req.method === "PUT") {
      const paymentData = req.body;
      const payment = await storage.updatePayment(id, userId, paymentData);
      if (!payment) {
        return res.status(404).json({ error: "Payment not found" });
      }
      return res.json(payment);
    }

    if (req.method === "DELETE") {
      await storage.deletePayment(id, userId);
      return res.status(204).end();
    }

    return res.status(405).json({ message: "Method not allowed" });
  } catch (error) {
    console.error("Payments API error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
