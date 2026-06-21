import { createClient } from '@supabase/supabase-js';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import {
  countUnusedRecoveryCodes,
  userHasVerifiedTotpFactor,
} from '../../_lib/mfaRecoveryCodesCore';
import { getServiceSupabase } from '../../_lib/supabaseService';

function getSupabaseAnonClient(accessToken: string) {
  const url = process.env.VITE_SUPABASE_URL ?? process.env.SUPABASE_URL;
  const anonKey = process.env.VITE_SUPABASE_ANON_KEY ?? process.env.SUPABASE_ANON_KEY;
  if (!url || !anonKey) {
    throw new Error('Supabase anon credentials missing');
  }
  return createClient(url, anonKey, {
    global: { headers: { Authorization: `Bearer ${accessToken}` } },
  });
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const accessToken = authHeader.slice('Bearer '.length);

  try {
    const anonClient = getSupabaseAnonClient(accessToken);
    const { data: { user }, error: userError } = await anonClient.auth.getUser();
    if (userError || !user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const service = getServiceSupabase();
    const hasMfa = await userHasVerifiedTotpFactor(service, user.id);
    if (!hasMfa) {
      return res.status(200).json({ remaining: 0, hasMfa: false });
    }

    const remaining = await countUnusedRecoveryCodes(service, user.id);
    return res.status(200).json({ remaining, hasMfa: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return res.status(500).json({ error: message });
  }
}
