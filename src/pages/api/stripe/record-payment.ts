import type { NextApiRequest, NextApiResponse } from "next";
import Stripe from "stripe";
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
    const { paymentIntentId } = req.body;

    if (!paymentIntentId) {
      return res.status(400).json({ error: "Missing payment intent ID" });
    }

    if (!user.clientId) {
      return res.status(400).json({ error: "Your account is not linked to a client record" });
    }

    const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
    if (!stripeSecretKey) {
      return res.status(500).json({ error: "Stripe not configured" });
    }

    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: "2025-10-29.clover",
    });

    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status !== "succeeded") {
      return res.status(400).json({ error: "Payment not confirmed by Stripe" });
    }

    if (paymentIntent.metadata.userId !== user.id) {
      return res.status(403).json({ error: "Payment does not belong to this user" });
    }

    const amount = paymentIntent.amount / 100;

    await storage.createPayment({
      userId: user.id,
      clientId: user.clientId,
      amount,
      paymentDate: new Date(),
      notes: `Stripe payment: ${paymentIntentId}`,
    });

    res.status(200).json({ success: true });
  } catch (error: any) {
    console.error("Error recording payment:", error);
    res.status(500).json({ error: error.message || "Failed to record payment" });
  }
}
