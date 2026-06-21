import { describe, expect, it } from 'vitest';
import {
  buildCohortDedupeKey,
  getCohortEmailContent,
  isEmailAllowedForTemplate,
} from '../../../api/_lib/notificationEmail';

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
  });

  it('respects notification settings for email', () => {
    expect(
      isEmailAllowedForTemplate(
        { email_notifications_enabled: true, mission_update_enabled: true, announcement_enabled: true },
        'weekly_mission_start',
      ),
    ).toBe(true);
    expect(
      isEmailAllowedForTemplate(
        { email_notifications_enabled: false, mission_update_enabled: true, announcement_enabled: true },
        'weekly_mission_start',
      ),
    ).toBe(false);
    expect(
      isEmailAllowedForTemplate(
        { email_notifications_enabled: true, mission_update_enabled: false, announcement_enabled: true },
        'weekly_mission_start',
      ),
    ).toBe(false);
  });

  it('builds cohort email content with links', () => {
    const content = getCohortEmailContent('weekly_mission_start', 'https://example.test');
    expect(content.subject).toContain('週次ミッション');
    expect(content.htmlContent).toContain('https://example.test/dashboard');
  });
});
