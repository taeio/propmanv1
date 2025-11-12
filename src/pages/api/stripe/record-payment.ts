import type { NextApiRequest, NextApiResponse } from "next";
import { initAuth } from "../../../lib/authMiddleware";
import { storage } from "../../../../server/storage";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    await initAuth(req, res);

    if (!(req as any).isAuthenticated()) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const user = (req as any).user;
    const { clientId, amount, paymentIntentId } = req.body;

    if (!clientId || !amount) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    await storage.addPayment({
      userId: user.id,
      clientId,
      amount,
      paymentDate: new Date(),
      notes: `Stripe payment: ${paymentIntentId || "N/A"}`,
    });

    res.status(200).json({ success: true });
  } catch (error: any) {
    console.error("Error recording payment:", error);
    res.status(500).json({ error: error.message || "Failed to record payment" });
  }
}
