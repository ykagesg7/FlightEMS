import { describe, expect, it } from 'vitest';
import { getDigestForIsoWeek } from '../../../api/_lib/articlePublishSchedule';
import { getIsoWeekJst } from '../../../api/_lib/cohortWeek';
import { resolveWeeklyArticleDigestPlan } from '../../../api/_lib/cronArticleWeeklyDigest';
import { getWeeklyArticleDigestEmailContent } from '../../../api/_lib/notificationEmail';

describe('api/cronArticleWeeklyDigest remindWeek', () => {
  it('does not derive review week from first publishDate minus 7 days (W45 → W44, not W43)', () => {
    const w45 = getDigestForIsoWeek('2026-W45');
    expect(w45).not.toBeNull();
    const firstPublish = w45!.articles[0]!.publishDate;
    expect(firstPublish).toBe('2026-11-01');

    const buggyRemind = getIsoWeekJst(
      new Date(new Date(`${firstPublish}T00:00:00`).getTime() - 7 * 86400000),
    );
    expect(buggyRemind).toBe('2026-W43');

    expect(resolveWeeklyArticleDigestPlan(new Date('2026-11-01T08:00:00+09:00')).remindWeek).toBe(
      '2026-W44',
    );
  });

  it.each([
    {
      label: '2026-11-01 Sun preview',
      now: '2026-11-01T08:00:00+09:00',
      isoWeek: '2026-W45',
      remindWeek: '2026-W44',
      timing: 'sunday_preview' as const,
      sendDateJst: '2026-11-01',
      reviewArticleIds: ['1.1.5_SeekFirstToUnderstand', 'FMT-1-5_LeadChange', 'FMT-1-6_Spread'],
    },
    {
      label: '2026-11-08 Sun preview',
      now: '2026-11-08T08:00:00+09:00',
      isoWeek: '2026-W46',
      remindWeek: '2026-W45',
      timing: 'sunday_preview' as const,
      sendDateJst: '2026-11-08',
      reviewArticleIds: ['1.1.6_Synergize', 'FMT-1-7_TrailFamily', 'FMT-1-8_Rejoin'],
    },
    {
      label: '2026-11-15 Sun preview',
      now: '2026-11-15T08:00:00+09:00',
      isoWeek: '2026-W47',
      remindWeek: '2026-W46',
      timing: 'sunday_preview' as const,
      sendDateJst: '2026-11-15',
      reviewArticleIds: ['1.1.7_SharpenTheSaw', 'FMT-1-9_TacticalLAB', 'FMT-1-10_LostWingman'],
    },
    {
      label: '2026-11-22 Sun preview',
      now: '2026-11-22T08:00:00+09:00',
      isoWeek: '2026-W48',
      remindWeek: '2026-W47',
      timing: 'sunday_preview' as const,
      sendDateJst: '2026-11-22',
      reviewArticleIds: ['L1-Q4-1_MichizaneBriefing'],
    },
  ])(
    '$label: digest $isoWeek, review $remindWeek',
    ({ now, isoWeek, remindWeek, timing, sendDateJst, reviewArticleIds }) => {
      const plan = resolveWeeklyArticleDigestPlan(new Date(now));
      expect(plan).toEqual({ isoWeek, remindWeek, timing });

      const digest = getDigestForIsoWeek(isoWeek);
      const previousDigest = getDigestForIsoWeek(remindWeek);
      expect(digest).not.toBeNull();
      expect(previousDigest).not.toBeNull();

      const reviewIds = previousDigest!.articles.map((a) => a.id);
      for (const id of reviewArticleIds) {
        expect(reviewIds).toContain(id);
      }

      const { subject, htmlContent } = getWeeklyArticleDigestEmailContent(
        digest!,
        'https://example.test',
        previousDigest,
        timing,
        sendDateJst,
      );
      expect(subject).toBe(
        `Flight Academy — 来週の案内＋今週の振り返り（${isoWeek}）`,
      );
      expect(htmlContent).toContain(`今週の振り返り（${remindWeek}）`);
    },
  );
});
