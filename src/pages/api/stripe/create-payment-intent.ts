import type { NextApiResponse } from "next";
import Stripe from "stripe";
import { initAuth } from "../../../lib/authMiddleware";
import { storage } from "../../../../server/storage";
import { compose, requireAuth, validateBody, withRateLimit } from "../../../../server/middleware";
import { AuthenticatedRequest } from "../../../../server/types";
import { StripePaymentIntentSchema } from "../../../../shared/validation";

async function handlePost(req: AuthenticatedRequest, res: NextApiResponse): Promise<void> {
  const user = req.user!;

  if (!user.clientId) {
    res.status(400).json({ error: "Your account is not linked to a client record" });
    return;
  }

  const client = await storage.getClientById(user.clientId);
  if (!client) {
    res.status(404).json({ error: "Client record not found" });
    return;
  }

  if (client.rentAmount <= 0) {
    res.status(400).json({ error: "Invalid rent amount" });
    return;
  }

  const propertyManager = await storage.getUser(client.userId);
  if (!propertyManager) {
    res.status(404).json({ error: "Property manager not found" });
    return;
  }

  if (!propertyManager.stripeConnectedAccountId) {
    res.status(400).json({ error: "Property manager has not connected their Stripe account yet. Please contact your property manager." });
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

  const account = await stripe.accounts.retrieve(propertyManager.stripeConnectedAccountId);
  if (!account.charges_enabled || !account.payouts_enabled) {
    res.status(400).json({ 
      error: "Property manager's payment account is not fully set up yet. Please contact your property manager to complete their Stripe setup." 
    });
    return;
  }

  const amountInCents = Math.round(client.rentAmount * 100);
  const platformFeePercent = parseFloat(process.env.STRIPE_PLATFORM_FEE_PERCENT || "0.03");
  const platformFee = Math.round(amountInCents * platformFeePercent);

  const paymentIntent = await stripe.paymentIntents.create({
    amount: amountInCents,
    currency: "usd",
    automatic_payment_methods: {
      enabled: true,
    },
    application_fee_amount: platformFee,
    transfer_data: {
      destination: propertyManager.stripeConnectedAccountId,
    },
    metadata: {
      userId: user.id,
      clientId: client.id.toString(),
      propertyManagerId: propertyManager.id,
      description: "Monthly rent payment",
    },
  });

  res.status(200).json({ 
    clientSecret: paymentIntent.client_secret,
    paymentIntentId: paymentIntent.id,
  });
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
      validateBody(StripePaymentIntentSchema)
    )(handlePost)(req, res);
  } catch (error: any) {
    console.error("Error creating payment intent:", error);
    res.status(500).json({ error: error.message || "Failed to create payment intent" });
  }
}
