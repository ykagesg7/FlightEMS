import { describe, expect, it } from 'vitest';
import { collectArticleMetas } from '../../../vite/articlesMeta';
import {
  getArticleAnnounceDate,
  listArticlesForPublishSync,
  listScheduledArticles,
  WEEKLY_ARTICLE_DIGESTS,
} from '../../../api/_lib/articlePublishSchedule';
import { getJstWeekday } from '../../../api/_lib/cohortWeek';
import { isWithdrawnArticle } from '../../constants/withdrawnArticleIds';

const W41_PLUS_WEEKS = ['2026-W41', '2026-W42', '2026-W43', '2026-W44', '2026-W45', '2026-W46'];

function weekdayJstFromPublishDate(publishDate: string): number {
  const [y, m, d] = publishDate.split('-').map(Number);
  return getJstWeekday(new Date(Date.UTC(y, m - 1, d, 3, 0, 0)));
}

function weekdayJstFromScheduledArticle(article: {
  publishDate: string;
  announceDate?: string;
}): number {
  return weekdayJstFromPublishDate(getArticleAnnounceDate(article));
}

function mentalityArticleIds(): Set<string> {
  return new Set(
    collectArticleMetas()
      .filter((entry) => entry.dir === 'articles')
      .map((entry) => entry.filename),
  );
}

describe('api/lib/articlePublishSchedule', () => {
  it('keeps publishDate in sync with MDX meta.publishedAt for every scheduled id', () => {
    const metas = collectArticleMetas();
    const byFilename = new Map(metas.map((entry) => [entry.filename, entry.meta]));

    for (const article of listScheduledArticles()) {
      const meta = byFilename.get(article.id);
      expect(meta, `missing MDX for ${article.id}`).toBeDefined();
      expect(meta?.publishedAt).toBe(article.publishDate);
    }
  });

  it('does not list withdrawn ids on the schedule', () => {
    for (const article of listScheduledArticles()) {
      expect(isWithdrawnArticle(article.id)).toBe(false);
    }
  });

  it('uses Sun mentality + Wed·Fri CP/FN from W41 (W41 has no Sunday slot)', () => {
    const mentality = mentalityArticleIds();
    for (const weekKey of W41_PLUS_WEEKS) {
      const digest = WEEKLY_ARTICLE_DIGESTS[weekKey];
      expect(digest, weekKey).toBeDefined();
      for (const article of digest.articles) {
        const wd = weekdayJstFromScheduledArticle(article);
        if (wd === 0) {
          expect(mentality.has(article.id)).toBe(true);
        } else {
          expect([3, 5]).toContain(wd);
          expect(mentality.has(article.id)).toBe(false);
        }
      }
    }
  });

  it('excludes syncPublish:false rows from publish-sync list', () => {
    const syncIds = new Set(listArticlesForPublishSync().map((a) => a.id));
    const emailOnly = listScheduledArticles().filter((a) => a.syncPublish === false);
    expect(emailOnly.length).toBeGreaterThan(0);
    for (const article of emailOnly) {
      expect(syncIds.has(article.id)).toBe(false);
      expect(article.announceDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(getArticleAnnounceDate(article)).toBe(article.announceDate);
    }
    // Existing drip reservations stay on the sync list (W41–W44 mentality + CP/FN only)
    expect(syncIds.has('1.1.5_SeekFirstToUnderstand')).toBe(true);
    expect(syncIds.has('FMT-1-5_LeadChange')).toBe(true);
    // W45–W48 immediate publish: excluded from publish-sync
    for (const id of [
      'FMT-1-7_TrailFamily',
      'FMT-1-8_Rejoin',
      '1.1.7_SharpenTheSaw',
      'FMT-1-9_TacticalLAB',
      'FMT-1-10_LostWingman',
      'L1-Q4-1_MichizaneBriefing',
      'L1-Q3-1_PathToPilot',
      'IF-1-2_PartialPanel',
    ]) {
      expect(syncIds.has(id)).toBe(false);
    }
  });

  it('keeps W47–W50 Wednesday refeatures on announceDate (not drip publishDate)', () => {
    const expected = {
      '2026-W47': { id: 'PPL-5-3-2_MedicalCertificateBasics', announce: '2026-11-18' },
      '2026-W48': { id: 'PPL-1-1-7_VnDiagram', announce: '2026-11-25' },
      '2026-W49': { id: 'PPL-2-3-2_MetarTafAndWeatherReports', announce: '2026-12-02' },
      '2026-W50': { id: 'PPL-1-2-1_GyroBasics', announce: '2026-12-09' },
    };
    for (const [week, want] of Object.entries(expected)) {
      const digest = WEEKLY_ARTICLE_DIGESTS[week];
      expect(digest, week).toBeDefined();
      const row = digest.articles.find((a) => a.id === want.id);
      expect(row, `${week} ${want.id}`).toBeDefined();
      expect(row?.syncPublish).toBe(false);
      expect(row?.announceDate).toBe(want.announce);
      expect(weekdayJstFromPublishDate(row!.announceDate!)).toBe(3);
    }
    // L1-Q4-2 immediate publish: Sunday mail announce, no drip sync
    const l1q42 = listScheduledArticles().find((a) => a.id === 'L1-Q4-2_AviatorMindset');
    expect(l1q42).toBeDefined();
    expect(l1q42?.syncPublish).toBe(false);
    expect(l1q42?.announceDate).toBe('2026-11-29');
    expect(l1q42?.publishDate).toBe('2026-10-30');
    expect(weekdayJstFromPublishDate(l1q42!.announceDate!)).toBe(0);
    expect(listArticlesForPublishSync().some((a) => a.id === 'L1-Q4-2_AviatorMindset')).toBe(
      false,
    );

    // IF-1-1 immediate publish: Friday mail announce (W47), no drip sync
    const if11 = listScheduledArticles().find((a) => a.id === 'IF-1-1_TrustInstruments');
    expect(if11).toBeDefined();
    expect(if11?.syncPublish).toBe(false);
    expect(if11?.announceDate).toBe('2026-11-20');
    expect(if11?.publishDate).toBe('2026-10-30');
    expect(weekdayJstFromPublishDate(if11!.announceDate!)).toBe(5);
    expect(listArticlesForPublishSync().some((a) => a.id === 'IF-1-1_TrustInstruments')).toBe(
      false,
    );

    // IF-1-2 immediate publish: Friday mail announce (W48), no drip sync
    const if12 = listScheduledArticles().find((a) => a.id === 'IF-1-2_PartialPanel');
    expect(if12).toBeDefined();
    expect(if12?.syncPublish).toBe(false);
    expect(if12?.announceDate).toBe('2026-11-27');
    expect(if12?.publishDate).toBe('2026-11-01');
    expect(weekdayJstFromPublishDate(if12!.announceDate!)).toBe(5);
    expect(listArticlesForPublishSync().some((a) => a.id === 'IF-1-2_PartialPanel')).toBe(false);
  });

  it('keeps Sunday digest announce dates for W46–W49 after W45–W48 immediate publish', () => {
    const expectedByWeek: Record<string, Record<string, string>> = {
      '2026-W46': {
        '1.1.7_SharpenTheSaw': '2026-11-08',
        'FMT-1-9_TacticalLAB': '2026-11-11',
        'FMT-1-10_LostWingman': '2026-11-13',
      },
      '2026-W47': {
        'L1-Q4-1_MichizaneBriefing': '2026-11-15',
        'PPL-5-3-2_MedicalCertificateBasics': '2026-11-18',
        'IF-1-1_TrustInstruments': '2026-11-20',
      },
      '2026-W48': {
        'L1-Q3-1_PathToPilot': '2026-11-22',
        'PPL-1-1-7_VnDiagram': '2026-11-25',
        'IF-1-2_PartialPanel': '2026-11-27',
      },
      '2026-W49': {
        'L1-Q4-2_AviatorMindset': '2026-11-29',
        'PPL-2-3-2_MetarTafAndWeatherReports': '2026-12-02',
      },
    };
    for (const [week, wantById] of Object.entries(expectedByWeek)) {
      const digest = WEEKLY_ARTICLE_DIGESTS[week];
      expect(digest, week).toBeDefined();
      for (const [id, announce] of Object.entries(wantById)) {
        const row = digest!.articles.find((a) => a.id === id);
        expect(row, `${week} ${id}`).toBeDefined();
        expect(getArticleAnnounceDate(row!)).toBe(announce);
      }
    }
  });
});
