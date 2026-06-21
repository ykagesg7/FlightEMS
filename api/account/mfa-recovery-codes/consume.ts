import { createClient } from '@supabase/supabase-js';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import {
  consumeRecoveryCode,
  deleteAllRecoveryCodesForUser,
  removeAllVerifiedMfaFactors,
  userHasVerifiedTotpFactor,
} from '../../_lib/mfaRecoveryCodesCore';
import { getServiceSupabase } from '../../_lib/supabaseService';

interface ConsumeBody {
  code?: string;
}

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
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const accessToken = authHeader.slice('Bearer '.length);
  const body = (typeof req.body === 'string' ? JSON.parse(req.body) : req.body) as ConsumeBody;
  const code = body.code?.trim();
  if (!code) {
    return res.status(400).json({ error: 'Recovery code is required' });
  }

  try {
    const anonClient = getSupabaseAnonClient(accessToken);
    const { data: { user }, error: userError } = await anonClient.auth.getUser();
    if (userError || !user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const service = getServiceSupabase();
    const hasMfa = await userHasVerifiedTotpFactor(service, user.id);
    if (!hasMfa) {
      return res.status(400).json({ error: 'Two-factor authentication is not enabled' });
    }

    const result = await consumeRecoveryCode(service, user.id, code);
    if (result.ok === false) {
      const message =
        result.reason === 'none_left'
          ? '有効なリカバリーコードがありません'
          : 'リカバリーコードが正しくありません';
      return res.status(400).json({ error: message });
    }

    await removeAllVerifiedMfaFactors(service, user.id);
    await deleteAllRecoveryCodesForUser(service, user.id);

    return res.status(200).json({ consumed: true, mfaRemoved: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return res.status(500).json({ error: message });
  }
}
