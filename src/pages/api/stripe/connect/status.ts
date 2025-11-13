import { NextApiRequest, NextApiResponse } from 'next';
import { getServerStripe } from '@/lib/stripe-server';
import { storage } from '../../../../../server/storage';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const session = (req as any).session;
  if (!session || !session.passport || !session.passport.user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const userId = session.passport.user;

  try {
    const user = await storage.getUser(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (!user.stripeConnectedAccountId) {
      return res.status(200).json({
        connected: false,
        accountId: null,
        detailsSubmitted: false,
        chargesEnabled: false,
        payoutsEnabled: false,
      });
    }

    const stripe = getServerStripe();
    const account = await stripe.accounts.retrieve(user.stripeConnectedAccountId);

    res.status(200).json({
      connected: true,
      accountId: account.id,
      detailsSubmitted: account.details_submitted,
      chargesEnabled: account.charges_enabled,
      payoutsEnabled: account.payouts_enabled,
      country: account.country,
      defaultCurrency: account.default_currency,
    });
  } catch (error: any) {
    console.error('Error checking Stripe status:', error);
    res.status(500).json({ error: error.message || 'Failed to check Stripe status' });
  }
}
