import type { NextApiRequest, NextApiResponse } from 'next';
import { generateCsrfToken } from '../../../server/csrf';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const token = generateCsrfToken(req, res);
  return res.status(200).json({ csrfToken: token });
}
