import { NextApiRequest, NextApiResponse } from "next";
import Stripe from "stripe";
import { storage } from "../../../../server/storage";
import { IncomingMessage } from "http";

export const config = {
  api: {
    bodyParser: false,
  },
};

async function buffer(req: IncomingMessage): Promise<Buffer> {
  const chunks: Buffer[] = [];
  
  return new Promise((resolve, reject) => {
    req.on("data", (chunk: Buffer | string) => {
      chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
    });
    
    req.on("end", () => {
      resolve(Buffer.concat(chunks));
    });
    
    req.on("error", (err) => {
      reject(err);
    });
  });
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!stripeSecretKey || !webhookSecret) {
    console.error("Stripe configuration missing");
    return res.status(500).json({ error: "Stripe not configured" });
  }

  const stripe = new Stripe(stripeSecretKey, {
    apiVersion: "2025-10-29.clover",
  });

  const buf = await buffer(req);
  const sig = req.headers["stripe-signature"];

  if (!sig) {
    return res.status(400).json({ error: "Missing stripe-signature header" });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(buf, sig, webhookSecret);
  } catch (err: any) {
    console.error("Webhook signature verification failed:", err.message);
    return res.status(400).json({ error: `Webhook Error: ${err.message}` });
  }

  try {
    switch (event.type) {
      case "payment_intent.succeeded": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        await handlePaymentSuccess(paymentIntent);
        break;
      }

      case "payment_intent.payment_failed": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        await handlePaymentFailure(paymentIntent);
        break;
      }

      case "charge.refunded": {
        const charge = event.data.object as Stripe.Charge;
        await handleRefund(charge);
        break;
      }

      case "charge.dispute.created": {
        const dispute = event.data.object as Stripe.Dispute;
        await handleDispute(dispute);
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    res.status(200).json({ received: true });
  } catch (error: any) {
    console.error("Error processing webhook:", error);
    res.status(500).json({ error: "Webhook processing failed" });
  }
}

async function handlePaymentSuccess(paymentIntent: Stripe.PaymentIntent) {
  const { userId, clientId } = paymentIntent.metadata;

  if (!userId || !clientId) {
    console.error("Missing metadata in payment intent:", paymentIntent.id);
    return;
  }

  const existingPayment = await storage.getPaymentByStripeId(paymentIntent.id);
  
  if (!existingPayment) {
    await storage.createPayment({
      userId,
      clientId: parseInt(clientId),
      amount: paymentIntent.amount / 100,
      paymentDate: new Date(paymentIntent.created * 1000),
      notes: `Stripe payment: ${paymentIntent.id} (webhook)`,
      stripePaymentIntentId: paymentIntent.id,
      status: "succeeded",
    });
    console.log(`Payment recorded from webhook: ${paymentIntent.id}`);
  } else {
    await storage.updatePaymentStatus(existingPayment.id, userId, "succeeded");
    console.log(`Payment status updated to succeeded: ${paymentIntent.id}`);
  }
}

async function handlePaymentFailure(paymentIntent: Stripe.PaymentIntent) {
  const { userId, clientId } = paymentIntent.metadata;

  if (!userId || !clientId) {
    console.error("Missing metadata in payment intent:", paymentIntent.id);
    return;
  }

  const existingPayment = await storage.getPaymentByStripeId(paymentIntent.id);
  
  if (existingPayment) {
    await storage.updatePaymentStatus(existingPayment.id, userId, "failed");
    console.log(`Payment marked as failed: ${paymentIntent.id}`);
  } else {
    await storage.createPayment({
      userId,
      clientId: parseInt(clientId),
      amount: paymentIntent.amount / 100,
      paymentDate: new Date(paymentIntent.created * 1000),
      notes: `Failed payment: ${paymentIntent.id} - ${paymentIntent.last_payment_error?.message || "Unknown error"}`,
      stripePaymentIntentId: paymentIntent.id,
      status: "failed",
    });
    console.log(`Failed payment recorded: ${paymentIntent.id}`);
  }
}

async function handleRefund(charge: Stripe.Charge) {
  const paymentIntentId = charge.payment_intent as string;
  
  if (!paymentIntentId) {
    console.error("No payment intent ID in charge:", charge.id);
    return;
  }

  const payment = await storage.getPaymentByStripeId(paymentIntentId);
  
  if (payment) {
    await storage.updatePaymentStatus(payment.id, payment.userId, "refunded");
    console.log(`Payment marked as refunded: ${paymentIntentId}`);
  } else {
    console.warn(`Payment record not found for refund: ${paymentIntentId}. This may be a payment that was not recorded in the database. Charge ID: ${charge.id}`);
  }
}

async function handleDispute(dispute: Stripe.Dispute) {
  const chargeId = dispute.charge as string;
  const paymentIntentId = dispute.payment_intent as string;
  
  if (!paymentIntentId) {
    console.error("No payment intent ID in dispute:", dispute.id);
    return;
  }

  const payment = await storage.getPaymentByStripeId(paymentIntentId);
  
  if (payment) {
    await storage.updatePaymentStatus(payment.id, payment.userId, "disputed");
    console.log(`Payment marked as disputed: ${paymentIntentId}`);
  } else {
    console.warn(`Payment record not found for dispute: ${paymentIntentId}. This may be a payment that was not recorded in the database. Dispute ID: ${dispute.id}, Charge ID: ${chargeId}`);
  }
}
