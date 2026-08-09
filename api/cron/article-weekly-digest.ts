import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getDigestForIsoWeek } from '../_lib/articlePublishSchedule';
import { getIsoWeekJst, getNextIsoWeekJst } from '../_lib/cohortWeek';
import { dispatchWeeklyArticleDigestEmails } from '../_lib/notificationEmail';
import { getServiceSupabase } from '../_lib/supabaseService';

/**
 * Weekly article digest (X-style): Sunday evening preview of coming week +
 * reminder of the finishing week.
 * Audience (temporary): profiles with email, except explicit email_notifications OFF.
 * Cron: Sunday 17:00 JST = Sunday 08:00 UTC → 0 8 * * 0
 *
 * Optional query: ?isoWeek=2026-W33 forces the *upcoming* week (still requires CRON_SECRET).
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
    const now = new Date();
    const forced =
      typeof req.query.isoWeek === 'string' && /^\d{4}-W\d{2}$/.test(req.query.isoWeek)
        ? req.query.isoWeek
        : null;
    const isoWeek = forced ?? getNextIsoWeekJst(now);
    const digest = getDigestForIsoWeek(isoWeek);

    if (!digest) {
      return res.status(200).json({
        isoWeek,
        skipped: true,
        reason: 'no_digest_for_week',
      });
    }

    const firstPublish = digest.articles[0]?.publishDate;
    const remindWeek = firstPublish
      ? getIsoWeekJst(new Date(Date.parse(`${firstPublish}T12:00:00+09:00`) - 7 * 86400000))
      : getIsoWeekJst(now);
    const previousDigest = getDigestForIsoWeek(remindWeek);

    if (!process.env.BREVO_API_KEY) {
      return res.status(200).json({
        isoWeek,
        remindWeek,
        skipped: true,
        reason: 'brevo_not_configured',
        articleCount: digest.articles.length,
        reminderCount: previousDigest?.articles.length ?? 0,
      });
    }

    const supabase = getServiceSupabase();
    const email = await dispatchWeeklyArticleDigestEmails(supabase, digest, previousDigest);

    return res.status(200).json({
      isoWeek,
      remindWeek,
      seriesTitle: digest.seriesTitle,
      articleCount: digest.articles.length,
      reminderCount: previousDigest?.articles.length ?? 0,
      email,
      brevoConfigured: true,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return res.status(500).json({ error: message });
  }
}
