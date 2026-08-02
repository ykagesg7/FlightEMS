import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getDigestForIsoWeek } from '../_lib/articlePublishSchedule';
import { getIsoWeekJst } from '../_lib/cohortWeek';
import { dispatchWeeklyArticleDigestEmails } from '../_lib/notificationEmail';
import { getServiceSupabase } from '../_lib/supabaseService';

/**
 * Weekly article digest (X-style) to users with email + new_content ON.
 * Cron: Monday 08:00 JST = Sunday 23:00 UTC → 0 23 * * 0
 *
 * Optional query: ?isoWeek=2026-W32 to force a week (still requires CRON_SECRET).
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
    const forced =
      typeof req.query.isoWeek === 'string' && /^\d{4}-W\d{2}$/.test(req.query.isoWeek)
        ? req.query.isoWeek
        : null;
    const isoWeek = forced ?? getIsoWeekJst(new Date());
    const digest = getDigestForIsoWeek(isoWeek);

    if (!digest) {
      return res.status(200).json({
        isoWeek,
        skipped: true,
        reason: 'no_digest_for_week',
      });
    }

    if (!process.env.BREVO_API_KEY) {
      return res.status(200).json({
        isoWeek,
        skipped: true,
        reason: 'brevo_not_configured',
        articleCount: digest.articles.length,
      });
    }

    const supabase = getServiceSupabase();
    const email = await dispatchWeeklyArticleDigestEmails(supabase, digest);

    return res.status(200).json({
      isoWeek,
      seriesTitle: digest.seriesTitle,
      articleCount: digest.articles.length,
      email,
      brevoConfigured: true,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return res.status(500).json({ error: message });
  }
}
