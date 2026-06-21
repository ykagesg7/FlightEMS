import type { SupabaseClient } from '@supabase/supabase-js';
import { getServiceSupabase } from './supabaseService';

export type CohortNotificationTemplateKey =
  | 'weekly_mission_start'
  | 'cohort_registration_reminder'
  | 'post_written_cta';

interface NotificationSettingsRow {
  email_notifications_enabled: boolean | null;
  mission_update_enabled: boolean | null;
  announcement_enabled: boolean | null;
}

export interface EmailDispatchSummary {
  attempted: number;
  sent: number;
  skipped: number;
  failed: number;
}

/** Matches SQL in enqueue_cohort_notifications dedupe_key construction. */
export function buildCohortDedupeKey(
  templateKey: CohortNotificationTemplateKey,
  isoWeek: string | null,
  dedupeSuffix: string | null,
): string {
  let key = templateKey;
  if (isoWeek) key += `-${isoWeek}`;
  if (dedupeSuffix) key += `-${dedupeSuffix}`;
  return key;
}

export function getAppBaseUrl(): string {
  const configured = process.env.VITE_APP_URL ?? process.env.APP_URL;
  if (configured) return configured.replace(/\/$/, '');
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return 'https://flight-lms.vercel.app';
}

export function isEmailAllowedForTemplate(
  settings: NotificationSettingsRow | null,
  templateKey: CohortNotificationTemplateKey,
): boolean {
  if (settings?.email_notifications_enabled === false) return false;
  switch (templateKey) {
    case 'weekly_mission_start':
    case 'post_written_cta':
      return settings?.mission_update_enabled !== false;
    case 'cohort_registration_reminder':
      return settings?.announcement_enabled !== false;
    default:
      return true;
  }
}

export function getCohortEmailContent(
  templateKey: CohortNotificationTemplateKey,
  baseUrl: string,
): { subject: string; htmlContent: string } {
  switch (templateKey) {
    case 'weekly_mission_start':
      return {
        subject: 'Flight Academy — 今週の週次ミッション',
        htmlContent: `
          <p>新しい週次ミッションが始まりました。</p>
          <p>同じ試験月の仲間と並走しましょう。</p>
          <p><a href="${baseUrl}/dashboard">Dashboard を開く</a></p>
        `.trim(),
      };
    case 'cohort_registration_reminder':
      return {
        subject: 'Flight Academy — 学科試験の受験予定を登録',
        htmlContent: `
          <p>試験月または受験日未定を登録すると、週次ミッションに参加できます。</p>
          <p><a href="${baseUrl}/welcome?mode=cohort">受験予定を登録する</a></p>
        `.trim(),
      };
    case 'post_written_cta':
      return {
        subject: 'Flight Academy — 学科試験完了の記録',
        htmlContent: `
          <p>学科試験が終わったら、プロフィールから完了を記録してください。</p>
          <p><a href="${baseUrl}/profile?tab=cohort">受験予定を開く</a></p>
        `.trim(),
      };
    default:
      return { subject: 'Flight Academy', htmlContent: `<p><a href="${baseUrl}/dashboard">開く</a></p>` };
  }
}

export async function sendNotificationEmail(params: {
  supabase?: SupabaseClient;
  userId: string;
  templateKey: CohortNotificationTemplateKey;
  dedupeKey: string;
  subject: string;
  htmlContent: string;
}): Promise<{ sent: boolean; skipped: boolean; reason?: string; error?: string }> {
  const brevoKey = process.env.BREVO_API_KEY;
  if (!brevoKey) {
    return { sent: false, skipped: true, reason: 'brevo_not_configured' };
  }

  const supabase = params.supabase ?? getServiceSupabase();

  const { data: existing } = await supabase
    .from('notification_deliveries')
    .select('id')
    .eq('user_id', params.userId)
    .eq('channel', 'email')
    .eq('dedupe_key', params.dedupeKey)
    .maybeSingle();

  if (existing) {
    return { sent: false, skipped: true, reason: 'already_sent' };
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('email')
    .eq('id', params.userId)
    .single();

  const { data: settings } = await supabase
    .from('user_notification_settings')
    .select('email_notifications_enabled, mission_update_enabled, announcement_enabled')
    .eq('user_id', params.userId)
    .maybeSingle();

  if (!isEmailAllowedForTemplate(settings, params.templateKey) || !profile?.email) {
    return { sent: false, skipped: true, reason: 'opt_out_or_no_email' };
  }

  const brevoRes = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: {
      'api-key': brevoKey,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({
      sender: {
        name: 'Flight Academy',
        email: process.env.BREVO_SENDER_EMAIL ?? 'noreply@flightacademy.app',
      },
      to: [{ email: profile.email }],
      subject: params.subject,
      htmlContent: params.htmlContent,
    }),
  });

  if (!brevoRes.ok) {
    const text = await brevoRes.text();
    return { sent: false, skipped: false, error: text };
  }

  await supabase.from('notification_deliveries').insert({
    user_id: params.userId,
    channel: 'email',
    template_key: params.templateKey,
    dedupe_key: params.dedupeKey,
  });

  return { sent: true, skipped: false };
}

const EMAIL_DISPATCH_CONCURRENCY = 5;

function summarizeEmailResults(
  summary: EmailDispatchSummary,
  results: Awaited<ReturnType<typeof sendNotificationEmail>>[],
): void {
  for (const result of results) {
    summary.attempted += 1;
    if (result.sent) summary.sent += 1;
    else if (result.skipped) summary.skipped += 1;
    else summary.failed += 1;
  }
}

export async function dispatchEmailsForInAppDedupe(
  supabase: SupabaseClient,
  dedupeKey: string,
  templateKey: CohortNotificationTemplateKey,
): Promise<EmailDispatchSummary> {
  const summary: EmailDispatchSummary = { attempted: 0, sent: 0, skipped: 0, failed: 0 };
  const baseUrl = getAppBaseUrl();
  const { subject, htmlContent } = getCohortEmailContent(templateKey, baseUrl);

  const { data: deliveries, error } = await supabase
    .from('notification_deliveries')
    .select('user_id')
    .eq('channel', 'in_app')
    .eq('dedupe_key', dedupeKey);

  if (error) {
    throw new Error(error.message);
  }

  const rows = deliveries ?? [];
  for (let i = 0; i < rows.length; i += EMAIL_DISPATCH_CONCURRENCY) {
    const batch = rows.slice(i, i + EMAIL_DISPATCH_CONCURRENCY);
    const results = await Promise.all(
      batch.map((row) =>
        sendNotificationEmail({
          supabase,
          userId: row.user_id,
          templateKey,
          dedupeKey,
          subject,
          htmlContent,
        }),
      ),
    );
    summarizeEmailResults(summary, results);
  }

  return summary;
}
