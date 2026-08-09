import type { SupabaseClient } from '@supabase/supabase-js';
import type { WeeklyArticleDigest } from './articlePublishSchedule';
import { getServiceSupabase } from './supabaseService';

export type CohortNotificationTemplateKey =
  | 'weekly_mission_start'
  | 'cohort_registration_reminder'
  | 'post_written_cta'
  | 'weekly_article_digest';

export type NotificationTemplateKey = CohortNotificationTemplateKey;

interface NotificationSettingsRow {
  email_notifications_enabled: boolean | null;
  mission_update_enabled: boolean | null;
  announcement_enabled: boolean | null;
  new_content_enabled?: boolean | null;
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
  templateKey: NotificationTemplateKey,
): boolean {
  if (settings?.email_notifications_enabled === false) return false;
  switch (templateKey) {
    case 'weekly_mission_start':
    case 'post_written_cta':
      return settings?.mission_update_enabled !== false;
    case 'cohort_registration_reminder':
      return settings?.announcement_enabled !== false;
    case 'weekly_article_digest':
      // Temporary broadcast (2026-W32+): only explicit email master OFF is excluded.
      // No settings row / null email_notifications → allowed (comeback reach).
      return settings?.email_notifications_enabled !== false;
    default:
      return true;
  }
}

export function getCohortEmailContent(
  templateKey: Exclude<CohortNotificationTemplateKey, 'weekly_article_digest'>,
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

function weekdayLabelJst(isoDate: string): string {
  const [y, m, d] = isoDate.split('-').map(Number);
  const utc = new Date(Date.UTC(y, m - 1, d, 3, 0, 0)); // mid JST day
  const wd = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Tokyo',
    weekday: 'short',
  }).format(utc);
  const map: Record<string, string> = {
    Mon: '月',
    Tue: '火',
    Wed: '水',
    Thu: '木',
    Fri: '金',
    Sat: '土',
    Sun: '日',
  };
  return map[wd] ?? '・';
}
export type WeeklyArticleDigestTiming = 'sunday_preview' | 'week_start';

/** Digest: coming-week preview (Sun) or week-start catch-up (Mon) + optional reminder. */
export function getWeeklyArticleDigestEmailContent(
  digest: WeeklyArticleDigest,
  baseUrl: string,
  previousDigest?: WeeklyArticleDigest | null,
  timing: WeeklyArticleDigestTiming = 'sunday_preview',
): { subject: string; htmlContent: string } {
  const renderItems = (articles: WeeklyArticleDigest['articles']) =>
    articles
      .map((a) => {
        const day = weekdayLabelJst(a.publishDate);
        const href = `${baseUrl}${a.slug.startsWith('/') ? a.slug : `/${a.slug}`}`;
        return `<li style="margin-bottom:12px;">
        <strong>${day}</strong> <a href="${href}">${a.title}</a><br/>
        <span style="color:#444;">${a.hook}</span>
      </li>`;
      })
      .join('\n');

  const upcomingItems = renderItems(digest.articles);
  const isWeekStart = timing === 'week_start';
  const primaryLabel = isWeekStart ? '今週の案内' : '来週の案内';
  const reminderLabel = isWeekStart ? '先週の振り返り' : '今週の振り返り';
  const opener = isWeekStart
    ? 'あんさん、月曜の朝ばい。今週の一本と、先週の振り返りば置いとくけんね。'
    : 'あんさん、日曜の夕方ばい。来週の一本と、今週の振り返りば置いとくけんね。';

  const reminderBlock = previousDigest
    ? `
      <h2 style="font-size:16px;margin:24px 0 8px;">${reminderLabel}（${previousDigest.isoWeek}）</h2>
      <p style="color:#555;">読み逃しがあれば、いまのうちに立て直せ。</p>
      <ul style="padding-left:18px;list-style:disc;">
        ${renderItems(previousDigest.articles)}
      </ul>`
    : '';

  const checklist = digest.checklistNote
    ? `<p style="margin-top:16px;color:#555;font-size:14px;">${digest.checklistNote}</p>`
    : '';

  return {
    subject: `Flight Academy — ${primaryLabel}＋${reminderLabel}（${digest.isoWeek}）`,
    htmlContent: `
      <p>${opener}</p>
      ${reminderBlock}
      <h2 style="font-size:16px;margin:24px 0 8px;">${primaryLabel}（${digest.isoWeek}）— ${digest.seriesTitle}</h2>
      <p>${digest.intro}</p>
      <p><strong>月〜金、毎日1本。</strong>読み終わったら、明日の一手だけ試してみてほしい。</p>
      <ul style="padding-left:18px;list-style:disc;">
        ${upcomingItems}
      </ul>
      <p><a href="${baseUrl}/articles">Articles を開く</a></p>
      ${checklist}
      <hr style="border:none;border-top:1px solid #ddd;margin:24px 0;" />
      <p style="font-size:12px;color:#777;">
        この案内が不要な場合は、アプリの
        <a href="${baseUrl}/profile">プロフィール → 通知設定</a>
        で「メール通知」または「新着コンテンツ」をオフにしてください。
      </p>
    `.trim(),
  };
}

export async function sendNotificationEmail(params: {
  supabase?: SupabaseClient;
  userId: string;
  templateKey: NotificationTemplateKey;
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
    .select(
      'email_notifications_enabled, mission_update_enabled, announcement_enabled, new_content_enabled',
    )
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
  templateKey: Exclude<CohortNotificationTemplateKey, 'weekly_article_digest'>,
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

/**
 * Weekly article digest audience (temporary broadcast):
 * all profiles with a non-empty email, except explicit email_notifications_enabled=false.
 */
export async function dispatchWeeklyArticleDigestEmails(
  supabase: SupabaseClient,
  digest: WeeklyArticleDigest,
  previousDigest?: WeeklyArticleDigest | null,
  timing: WeeklyArticleDigestTiming = 'sunday_preview',
): Promise<EmailDispatchSummary> {
  const summary: EmailDispatchSummary = { attempted: 0, sent: 0, skipped: 0, failed: 0 };
  const templateKey = 'weekly_article_digest' as const;
  const dedupeKey = buildCohortDedupeKey(templateKey, digest.isoWeek, null);
  const baseUrl = getAppBaseUrl();
  const { subject, htmlContent } = getWeeklyArticleDigestEmailContent(
    digest,
    baseUrl,
    previousDigest,
    timing,
  );

  const { data: profiles, error: profilesError } = await supabase
    .from('profiles')
    .select('id, email')
    .not('email', 'is', null);

  if (profilesError) {
    throw new Error(profilesError.message);
  }

  const { data: optedOutRows, error: optedOutError } = await supabase
    .from('user_notification_settings')
    .select('user_id')
    .eq('email_notifications_enabled', false);

  if (optedOutError) {
    throw new Error(optedOutError.message);
  }

  const optedOut = new Set((optedOutRows ?? []).map((r) => r.user_id));
  const userIds = (profiles ?? [])
    .filter((p) => typeof p.email === 'string' && p.email.trim() !== '' && !optedOut.has(p.id))
    .map((p) => p.id);

  for (let i = 0; i < userIds.length; i += EMAIL_DISPATCH_CONCURRENCY) {
    const batch = userIds.slice(i, i + EMAIL_DISPATCH_CONCURRENCY);
    const results = await Promise.all(
      batch.map((userId) =>
        sendNotificationEmail({
          supabase,
          userId,
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
