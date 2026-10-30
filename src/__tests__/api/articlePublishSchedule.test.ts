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
        const wd = weekdayJstFromPublishDate(article.publishDate);
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
    // Existing drip reservations stay on the sync list
    expect(syncIds.has('L1-Q4-1_MichizaneBriefing')).toBe(true);
    expect(syncIds.has('L1-Q3-1_PathToPilot')).toBe(true);
    expect(syncIds.has('1.1.7_SharpenTheSaw')).toBe(true);
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
    // L1-Q4-2 not registered in this change
    const allIds = listScheduledArticles().map((a) => a.id);
    expect(allIds).not.toContain('L1-Q4-2_AviatorMindset');
  });
});
