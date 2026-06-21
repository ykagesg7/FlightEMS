import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
import { getServiceSupabase } from '../_lib/supabaseService';

const CONFIRM_PHRASE = 'アカウントを削除';

interface DeleteBody {
  confirmPhrase?: string;
  password?: string;
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
  const body = (typeof req.body === 'string' ? JSON.parse(req.body) : req.body) as DeleteBody;

  if (body.confirmPhrase !== CONFIRM_PHRASE) {
    return res.status(400).json({ error: 'Invalid confirm phrase' });
  }

  try {
    const anonClient = getSupabaseAnonClient(accessToken);
    const { data: { user }, error: userError } = await anonClient.auth.getUser();
    if (userError || !user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const hasEmailIdentity = user.identities?.some((identity) => identity.provider === 'email');
    if (hasEmailIdentity) {
      if (!body.password) {
        return res.status(400).json({ error: 'Password required for email accounts' });
      }
      const email = user.email;
      if (!email) {
        return res.status(400).json({ error: 'Email not found' });
      }
      const { error: reauthError } = await anonClient.auth.signInWithPassword({
        email,
        password: body.password,
      });
      if (reauthError) {
        return res.status(401).json({ error: 'Invalid password' });
      }
    }

    const service = getServiceSupabase();
    const { error: deleteError } = await service.auth.admin.deleteUser(user.id);
    if (deleteError) {
      return res.status(502).json({ error: deleteError.message });
    }

    return res.status(200).json({ deleted: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return res.status(500).json({ error: message });
  }
}
