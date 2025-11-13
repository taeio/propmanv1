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

    if (!user.clientId) {
      return res.status(400).json({ error: "Your account is not linked to a client record" });
    }

    const client = await storage.getClientById(user.clientId);
    if (!client) {
      return res.status(404).json({ error: "Client record not found" });
    }

    if (client.rentAmount <= 0) {
      return res.status(400).json({ error: "Invalid rent amount" });
    }

    const propertyManager = await storage.getUser(client.userId);
    if (!propertyManager) {
      return res.status(404).json({ error: "Property manager not found" });
    }

    if (!propertyManager.stripeConnectedAccountId) {
      return res.status(400).json({ error: "Property manager has not connected their Stripe account yet. Please contact your property manager." });
    }

    const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
    if (!stripeSecretKey) {
      return res.status(500).json({ error: "Stripe not configured" });
    }

    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: "2025-10-29.clover",
    });

    const account = await stripe.accounts.retrieve(propertyManager.stripeConnectedAccountId);
    if (!account.charges_enabled || !account.payouts_enabled) {
      return res.status(400).json({ 
        error: "Property manager's payment account is not fully set up yet. Please contact your property manager to complete their Stripe setup." 
      });
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
  } catch (error: any) {
    console.error("Error creating payment intent:", error);
    res.status(500).json({ error: error.message || "Failed to create payment intent" });
  }
}
