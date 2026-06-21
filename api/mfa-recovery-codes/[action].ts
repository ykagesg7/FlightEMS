import { createClient } from '@supabase/supabase-js';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import {
  consumeRecoveryCode,
  countUnusedRecoveryCodes,
  deleteAllRecoveryCodesForUser,
  generatePlainRecoveryCodes,
  removeAllVerifiedMfaFactors,
  storeRecoveryCodesForUser,
  userHasVerifiedTotpFactor,
} from '../_lib/mfaRecoveryCodesCore';
import { getServiceSupabase } from '../_lib/supabaseService';

type RecoveryAction = 'generate' | 'consume' | 'status' | 'clear';

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

function getAction(req: VercelRequest): RecoveryAction | null {
  const raw = req.query.action;
  const value = Array.isArray(raw) ? raw[0] : raw;
  if (
    value === 'generate' ||
    value === 'consume' ||
    value === 'status' ||
    value === 'clear'
  ) {
    return value;
  }

  const path = (req.url ?? '').split('?')[0];
  const match = path.match(/\/mfa-recovery-codes\/(generate|consume|status|clear)$/);
  if (match) {
    return match[1] as RecoveryAction;
  }

  return null;
}

async function requireUser(req: VercelRequest, res: VercelResponse) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Unauthorized' });
    return null;
  }

  const accessToken = authHeader.slice('Bearer '.length);
  const anonClient = getSupabaseAnonClient(accessToken);
  const { data: { user }, error: userError } = await anonClient.auth.getUser();
  if (userError || !user) {
    res.status(401).json({ error: 'Unauthorized' });
    return null;
  }

  return { anonClient, user };
}

async function requireAal2(
  anonClient: ReturnType<typeof getSupabaseAnonClient>,
  res: VercelResponse,
): Promise<boolean> {
  const { data: aalData, error: aalError } = await anonClient.auth.mfa.getAuthenticatorAssuranceLevel();
  if (aalError) {
    res.status(403).json({ error: aalError.message });
    return false;
  }
  if (aalData.currentLevel !== 'aal2') {
    res.status(403).json({ error: 'MFA verification required' });
    return false;
  }
  return true;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const action = getAction(req);
  if (!action) {
    return res.status(404).json({ error: 'Not found' });
  }

  try {
    switch (action) {
      case 'generate':
        return handleGenerate(req, res);
      case 'consume':
        return handleConsume(req, res);
      case 'status':
        return handleStatus(req, res);
      case 'clear':
        return handleClear(req, res);
      default:
        return res.status(404).json({ error: 'Not found' });
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return res.status(500).json({ error: message });
  }
}

async function handleGenerate(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const session = await requireUser(req, res);
  if (!session) {
    return;
  }

  const ok = await requireAal2(session.anonClient, res);
  if (!ok) {
    return;
  }

  const service = getServiceSupabase();
  const hasMfa = await userHasVerifiedTotpFactor(service, session.user.id);
  if (!hasMfa) {
    return res.status(400).json({ error: 'Two-factor authentication is not enabled' });
  }

  const plainCodes = generatePlainRecoveryCodes();
  await storeRecoveryCodesForUser(service, session.user.id, plainCodes);
  return res.status(200).json({ codes: plainCodes });
}

async function handleConsume(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const session = await requireUser(req, res);
  if (!session) {
    return;
  }

  const body = (typeof req.body === 'string' ? JSON.parse(req.body) : req.body) as ConsumeBody;
  const code = body.code?.trim();
  if (!code) {
    return res.status(400).json({ error: 'Recovery code is required' });
  }

  const service = getServiceSupabase();
  const hasMfa = await userHasVerifiedTotpFactor(service, session.user.id);
  if (!hasMfa) {
    return res.status(400).json({ error: 'Two-factor authentication is not enabled' });
  }

  const result = await consumeRecoveryCode(service, session.user.id, code);
  if (result.ok === false) {
    const message =
      result.reason === 'none_left'
        ? '有効なリカバリーコードがありません'
        : 'リカバリーコードが正しくありません';
    return res.status(400).json({ error: message });
  }

  await removeAllVerifiedMfaFactors(service, session.user.id);
  await deleteAllRecoveryCodesForUser(service, session.user.id);
  return res.status(200).json({ consumed: true, mfaRemoved: true });
}

async function handleStatus(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const session = await requireUser(req, res);
  if (!session) {
    return;
  }

  const service = getServiceSupabase();
  const hasMfa = await userHasVerifiedTotpFactor(service, session.user.id);
  if (!hasMfa) {
    return res.status(200).json({ remaining: 0, hasMfa: false });
  }

  const remaining = await countUnusedRecoveryCodes(service, session.user.id);
  return res.status(200).json({ remaining, hasMfa: true });
}

async function handleClear(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const session = await requireUser(req, res);
  if (!session) {
    return;
  }

  const ok = await requireAal2(session.anonClient, res);
  if (!ok) {
    return;
  }

  const service = getServiceSupabase();
  await deleteAllRecoveryCodesForUser(service, session.user.id);
  return res.status(200).json({ cleared: true });
}
