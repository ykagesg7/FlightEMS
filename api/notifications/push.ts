import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getServiceSupabase } from '../_lib/supabaseService';
interface PushBody {
  userId: string;
  title: string;
  body: string;
  url?: string;
  dedupeKey: string;
  templateKey?: string;
}

/**
 * Web Push delivery stub: records dedupe when VAPID + web-push are configured server-side.
 * In-app notifications remain the primary channel until VAPID_PRIVATE_KEY is set.
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  const authHeader = req.headers.authorization;
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const payload = req.body as PushBody;
  if (!payload?.userId || !payload.title || !payload.dedupeKey) {
    return res.status(400).json({ error: 'Invalid payload' });
  }

  if (!process.env.VAPID_PRIVATE_KEY || !process.env.VAPID_PUBLIC_KEY) {
    return res.status(503).json({ error: 'VAPID keys not configured' });
  }

  try {
    const supabase = getServiceSupabase();

    const { data: existing } = await supabase
      .from('notification_deliveries')
      .select('id')
      .eq('user_id', payload.userId)
      .eq('channel', 'push')
      .eq('dedupe_key', payload.dedupeKey)
      .maybeSingle();

    if (existing) {
      return res.status(200).json({ skipped: true });
    }

    const { data: subs } = await supabase
      .from('push_subscriptions')
      .select('endpoint, p256dh, auth')
      .eq('user_id', payload.userId);

    if (!subs?.length) {
      return res.status(200).json({ skipped: true, reason: 'no_subscription' });
    }

    // Placeholder: full Web Push encryption requires web-push package on server.
    // Subscriptions are stored; cron can be extended when VAPID signing is wired.
    await supabase.from('notification_deliveries').insert({
      user_id: payload.userId,
      channel: 'push',
      template_key: payload.templateKey ?? 'generic',
      dedupe_key: payload.dedupeKey,
      metadata: { pending: true, title: payload.title, endpoints: subs.length },
    });

    return res.status(200).json({ queued: true, endpoints: subs.length });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return res.status(500).json({ error: message });
  }
}
