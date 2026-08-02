import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getJstDateString, isPublishDateReached } from '../_lib/articlePublishGate';
import { listScheduledArticles } from '../_lib/articlePublishSchedule';
import { getServiceSupabase } from '../_lib/supabaseService';

/**
 * Flip learning_contents.is_published for scheduled drip articles (JST calendar day).
 * Cron: daily ~00:10 JST (15:10 UTC previous calendar day).
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  const authHeader = req.headers.authorization;
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (req.method !== 'GET' && req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const supabase = getServiceSupabase();
    const now = new Date();
    const jstToday = getJstDateString(now);
    const scheduled = listScheduledArticles();
    const dueIds = scheduled.filter((a) => isPublishDateReached(a.publishDate, now)).map((a) => a.id);
    const notDueIds = scheduled
      .filter((a) => !isPublishDateReached(a.publishDate, now))
      .map((a) => a.id);

    let published = 0;
    let unpublished = 0;

    if (dueIds.length > 0) {
      const { data, error } = await supabase
        .from('learning_contents')
        .update({ is_published: true, updated_at: new Date().toISOString() })
        .in('id', dueIds)
        .select('id');
      if (error) {
        return res.status(500).json({ error: error.message, step: 'publish' });
      }
      published = data?.length ?? 0;
    }

    if (notDueIds.length > 0) {
      const { data, error } = await supabase
        .from('learning_contents')
        .update({ is_published: false, updated_at: new Date().toISOString() })
        .in('id', notDueIds)
        .select('id');
      if (error) {
        return res.status(500).json({ error: error.message, step: 'unpublish' });
      }
      unpublished = data?.length ?? 0;
    }

    return res.status(200).json({
      jstToday,
      dueIds,
      notDueIds,
      published,
      unpublished,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return res.status(500).json({ error: message });
  }
}
