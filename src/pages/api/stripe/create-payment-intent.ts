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

    const client = await storage.getClient(user.clientId, user.id);
    if (!client) {
      return res.status(404).json({ error: "Client record not found" });
    }

    if (client.rentAmount <= 0) {
      return res.status(400).json({ error: "Invalid rent amount" });
    }

    const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
    if (!stripeSecretKey) {
      return res.status(500).json({ error: "Stripe not configured" });
    }

    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: "2025-10-29.clover",
    });

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(client.rentAmount * 100),
      currency: "usd",
      automatic_payment_methods: {
        enabled: true,
      },
      metadata: {
        userId: user.id,
        clientId: client.id.toString(),
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
