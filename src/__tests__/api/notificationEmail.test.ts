import { describe, expect, it } from 'vitest';
import {
  buildCohortDedupeKey,
  getCohortEmailContent,
  getWeeklyArticleDigestEmailContent,
  isEmailAllowedForTemplate,
} from '../../../api/_lib/notificationEmail';
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
    const content = getWeeklyArticleDigestEmailContent(digest, 'https://example.test');
    expect(content.subject).toContain('訓練の当たり前');
    expect(content.htmlContent).toContain('後始末までが仕事ばい。');
    expect(content.htmlContent).toContain('https://example.test/articles/chores-are-the-job');
    expect(content.htmlContent).toContain('新着コンテンツ');
  });
});
