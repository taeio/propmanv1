import Stripe from 'stripe';

let stripe: Stripe | null = null;

export const getServerStripe = (): Stripe => {
  if (!stripe) {
    const secretKey = process.env.STRIPE_SECRET_KEY;
    if (!secretKey) {
      throw new Error('Missing STRIPE_SECRET_KEY environment variable');
    }
    stripe = new Stripe(secretKey, {
      apiVersion: '2025-10-29.clover',
    });
  }
  return stripe;
};
