import type { NextApiResponse } from "next";
import Stripe from "stripe";
import { initAuth } from "../../../lib/authMiddleware";
import { storage } from "../../../../server/storage";
import { compose, requireAuth, validateBody, withRateLimit } from "../../../../server/middleware";
import { AuthenticatedRequest } from "../../../../server/types";
import { StripeRecordPaymentSchema } from "../../../../shared/validation";

async function handlePost(req: AuthenticatedRequest, res: NextApiResponse): Promise<void> {
  const user = req.user!;
  const { paymentIntentId } = req.body;

  if (!user.clientId) {
    res.status(400).json({ error: "Your account is not linked to a client record" });
    return;
  }

  const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
  if (!stripeSecretKey) {
    res.status(500).json({ error: "Stripe not configured" });
    return;
  }

  const stripe = new Stripe(stripeSecretKey, {
    apiVersion: "2025-10-29.clover",
  });

  const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

  if (paymentIntent.status !== "succeeded") {
    res.status(400).json({ error: "Payment not confirmed by Stripe" });
    return;
  }

  if (paymentIntent.metadata.userId !== user.id) {
    res.status(403).json({ error: "Payment does not belong to this user" });
    return;
  }

  const amount = paymentIntent.amount / 100;

  await storage.createPayment({
    userId: user.id,
    clientId: user.clientId,
    amount,
    paymentDate: new Date(),
    notes: `Stripe payment: ${paymentIntentId}`,
    stripePaymentIntentId: paymentIntentId,
    status: "succeeded",
  });

  res.status(200).json({ success: true });
}

export default async function handler(
  req: AuthenticatedRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    await initAuth(req, res);
    return compose(
      withRateLimit({ windowMs: 5 * 60 * 1000, maxRequests: 10 }),
      requireAuth,
      validateBody(StripeRecordPaymentSchema)
    )(handlePost)(req, res);
  } catch (error: any) {
    console.error("Error recording payment:", error);
    res.status(500).json({ error: error.message || "Failed to record payment" });
  }
}
