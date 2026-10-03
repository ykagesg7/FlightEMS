import { describe, expect, it } from 'vitest';
import {
  buildCohortDedupeKey,
  digestArticleDayLabel,
  getCohortEmailContent,
  getWeeklyArticleDigestEmailContent,
  isEmailAllowedForTemplate,
} from '../../../api/_lib/notificationEmail';
import { getDigestForIsoWeek } from '../../../api/_lib/articlePublishSchedule';
import type { WeeklyArticleDigest } from '../../../api/_lib/articlePublishSchedule';

describe('api/lib/notificationEmail', () => {
  it('builds dedupe keys matching SQL enqueue logic', () => {
    expect(buildCohortDedupeKey('weekly_mission_start', '2026-W25', null)).toBe(
      'weekly_mission_start-2026-W25',
    );
    expect(buildCohortDedupeKey('cohort_registration_reminder', null, '2026-06-20')).toBe(
      'cohort_registration_reminder-2026-06-20',
    );
    expect(buildCohortDedupeKey('post_written_cta', null, '2026-06')).toBe(
      'post_written_cta-2026-06',
    );
    expect(buildCohortDedupeKey('weekly_article_digest', '2026-W32', null)).toBe(
      'weekly_article_digest-2026-W32',
    );
  });

  it('respects notification settings for email', () => {
    expect(
      isEmailAllowedForTemplate(
        {
          email_notifications_enabled: true,
          mission_update_enabled: true,
          announcement_enabled: true,
          new_content_enabled: true,
        },
        'weekly_mission_start',
      ),
    ).toBe(true);
    expect(
      isEmailAllowedForTemplate(
        {
          email_notifications_enabled: false,
          mission_update_enabled: true,
          announcement_enabled: true,
          new_content_enabled: true,
        },
        'weekly_mission_start',
      ),
    ).toBe(false);
    expect(
      isEmailAllowedForTemplate(
        {
          email_notifications_enabled: true,
          mission_update_enabled: false,
          announcement_enabled: true,
          new_content_enabled: true,
        },
        'weekly_mission_start',
      ),
    ).toBe(false);
  });

  it('allows weekly article digest unless email master is explicitly OFF', () => {
    expect(
      isEmailAllowedForTemplate(
        {
          email_notifications_enabled: true,
          mission_update_enabled: true,
          announcement_enabled: true,
          new_content_enabled: true,
        },
        'weekly_article_digest',
      ),
    ).toBe(true);
    expect(
      isEmailAllowedForTemplate(
        {
          email_notifications_enabled: null,
          mission_update_enabled: true,
          announcement_enabled: true,
          new_content_enabled: false,
        },
        'weekly_article_digest',
      ),
    ).toBe(true);
    expect(isEmailAllowedForTemplate(null, 'weekly_article_digest')).toBe(true);
    expect(
      isEmailAllowedForTemplate(
        {
          email_notifications_enabled: false,
          mission_update_enabled: true,
          announcement_enabled: true,
          new_content_enabled: true,
        },
        'weekly_article_digest',
      ),
    ).toBe(false);
  });

  it('builds cohort email content with links', () => {
    const content = getCohortEmailContent('weekly_mission_start', 'https://example.test');
    expect(content.subject).toContain('週次ミッション');
    expect(content.htmlContent).toContain('https://example.test/dashboard');
  });

  it('builds weekly article digest with hooks and opt-out', () => {
    const digest: WeeklyArticleDigest = {
      isoWeek: '2026-W32',
      seriesTitle: '訓練の当たり前',
      intro: 'intro',
      articles: [
        {
          id: '4.1.1_ChoresAreTheJob',
          publishDate: '2026-08-03',
          title: '雑用こそ、仕事ばい',
          slug: '/articles/chores-are-the-job',
          hook: '後始末までが仕事ばい。',
        },
      ],
    };
    const previous: WeeklyArticleDigest = {
      isoWeek: '2026-W31',
      seriesTitle: '訓練の当たり前',
      intro: 'prev',
      articles: [
        {
          id: 'prev',
          publishDate: '2026-07-27',
          title: '前回テスト',
          slug: '/articles/prev-test',
          hook: '前回フック',
        },
      ],
    };
    const content = getWeeklyArticleDigestEmailContent(
      digest,
      'https://example.test',
      previous,
      'sunday_preview',
      '2026-08-03',
    );
    expect(content.subject).toContain('来週の案内');
    expect(content.subject).toContain('2026-W32');
    expect(content.htmlContent).toContain('後始末までが仕事ばい。');
    expect(content.htmlContent).toContain('https://example.test/articles/chores-are-the-job');
    expect(content.htmlContent).toContain('今週の振り返り');
    expect(content.htmlContent).toContain('前回フック');
    expect(content.htmlContent).toContain('新着コンテンツ');
    expect(content.htmlContent).toContain('<strong>今すぐ</strong>');
    expect(content.htmlContent).toContain('週3枠。');

    const monday = getWeeklyArticleDigestEmailContent(
      digest,
      'https://example.test',
      previous,
      'week_start',
      '2026-08-03',
    );
    expect(monday.subject).toContain('今週の案内');
    expect(monday.htmlContent).toContain('月曜の朝');
    expect(monday.htmlContent).toContain('先週の振り返り');
  });

  it('labels digest items by publishDate vs send date (今すぐ / weekday)', () => {
    expect(digestArticleDayLabel('2026-10-11', '2026-10-10')).toBe('日');
    expect(digestArticleDayLabel('2026-10-11', '2026-10-11')).toBe('今すぐ');
    expect(digestArticleDayLabel('2026-10-07', '2026-10-05')).toBe('水');

    const w41 = getDigestForIsoWeek('2026-W41');
    expect(w41).not.toBeNull();
    const sundayPreview = getWeeklyArticleDigestEmailContent(
      w41!,
      'https://example.test',
      null,
      'sunday_preview',
      '2026-10-04',
    );
    expect(sundayPreview.htmlContent).toMatch(/<strong>水<\/strong>.*Cloverleaf/);
    expect(sundayPreview.htmlContent).not.toMatch(
      /<strong>今すぐ<\/strong>.*Cloverleaf/,
    );

    const w42 = getDigestForIsoWeek('2026-W42');
    const w42Sunday = getWeeklyArticleDigestEmailContent(
      w42!,
      'https://example.test',
      null,
      'sunday_preview',
      '2026-10-10',
    );
    expect(w42Sunday.htmlContent).toMatch(/<strong>日<\/strong>.*終わりを思い描く/);
  });
});
