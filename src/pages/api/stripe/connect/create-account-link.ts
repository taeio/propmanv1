import { NextApiRequest, NextApiResponse } from 'next';
import { getServerStripe } from '@/lib/stripe-server';
import { storage } from '../../../../../server/storage';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const session = (req as any).session;
  if (!session || !session.passport || !session.passport.user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const userId = session.passport.user;

  try {
    const stripe = getServerStripe();
    
    const user = await storage.getUser(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (user.role !== 'property_manager') {
      return res.status(403).json({ error: 'Only property managers can connect Stripe accounts' });
    }

    let accountId = user.stripeConnectedAccountId;

    if (!accountId) {
      const account = await stripe.accounts.create({
        type: 'express',
        country: 'US',
        email: user.email || undefined,
        capabilities: {
          card_payments: { requested: true },
          transfers: { requested: true },
        },
        business_type: 'individual',
      });

      accountId = account.id;
      await storage.updateUserStripeAccount(userId, accountId);
    }

    const accountLink = await stripe.accountLinks.create({
      account: accountId,
      refresh_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/settings?stripe_refresh=true`,
      return_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/settings?stripe_connected=true`,
      type: 'account_onboarding',
    });

    res.status(200).json({ url: accountLink.url });
  } catch (error: any) {
    console.error('Error creating account link:', error);
    res.status(500).json({ error: error.message || 'Failed to create account link' });
  }
}
