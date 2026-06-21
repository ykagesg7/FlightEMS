import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getPreviousIsoWeekJst } from '../_lib/cohortWeek';
import {
  buildCohortDedupeKey,
  dispatchEmailsForInAppDedupe,
  type EmailDispatchSummary,
} from '../_lib/notificationEmail';
import { getServiceSupabase } from '../_lib/supabaseService';

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
    const closedWeek = getPreviousIsoWeekJst(now);
    const todaySuffix = now.toISOString().slice(0, 10);
    const monthSuffix = todaySuffix.slice(0, 7);

    const { error: computeError } = await supabase.rpc('compute_cohort_weekly_scores', {
      p_iso_week: closedWeek,
    });
    if (computeError) {
      return res.status(500).json({ error: computeError.message, step: 'compute' });
    }

    const { data: awarded, error: awardError } = await supabase.rpc('award_cohort_weekly_top3', {
      p_iso_week: closedWeek,
    });
    if (awardError) {
      return res.status(500).json({ error: awardError.message, step: 'award' });
    }

    const { data: missionCount, error: missionError } = await supabase.rpc(
      'enqueue_cohort_notifications',
      {
        p_template_key: 'weekly_mission_start',
        p_iso_week: closedWeek,
        p_dedupe_suffix: null,
      },
    );
    if (missionError) {
      return res.status(500).json({ error: missionError.message, step: 'enqueue_mission' });
    }

    const { data: regCount, error: regError } = await supabase.rpc('enqueue_cohort_notifications', {
      p_template_key: 'cohort_registration_reminder',
      p_iso_week: null,
      p_dedupe_suffix: todaySuffix,
    });
    if (regError) {
      return res.status(500).json({ error: regError.message, step: 'enqueue_reg' });
    }

    const { data: postCount, error: postError } = await supabase.rpc('enqueue_cohort_notifications', {
      p_template_key: 'post_written_cta',
      p_iso_week: null,
      p_dedupe_suffix: monthSuffix,
    });
    if (postError) {
      return res.status(500).json({ error: postError.message, step: 'enqueue_post' });
    }

    let emailWeekly: EmailDispatchSummary = { attempted: 0, sent: 0, skipped: 0, failed: 0 };
    let emailRegistration: EmailDispatchSummary = emailWeekly;
    let emailPostWritten: EmailDispatchSummary = emailWeekly;

    if (process.env.BREVO_API_KEY) {
      emailWeekly = await dispatchEmailsForInAppDedupe(
        supabase,
        buildCohortDedupeKey('weekly_mission_start', closedWeek, null),
        'weekly_mission_start',
      );
      emailRegistration = await dispatchEmailsForInAppDedupe(
        supabase,
        buildCohortDedupeKey('cohort_registration_reminder', null, todaySuffix),
        'cohort_registration_reminder',
      );
      emailPostWritten = await dispatchEmailsForInAppDedupe(
        supabase,
        buildCohortDedupeKey('post_written_cta', null, monthSuffix),
        'post_written_cta',
      );
    }

    return res.status(200).json({
      closedWeek,
      awarded,
      missionNotifications: missionCount,
      cohortRegistrationReminders: regCount,
      postWrittenCta: postCount,
      email: {
        weeklyMission: emailWeekly,
        registration: emailRegistration,
        postWritten: emailPostWritten,
        brevoConfigured: Boolean(process.env.BREVO_API_KEY),
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return res.status(500).json({ error: message });
  }
}
