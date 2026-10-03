import { describe, expect, it } from 'vitest';
import { collectArticleMetas } from '../../../vite/articlesMeta';
import {
  listScheduledArticles,
  W41_CP_5_8_PUBLISH_DATE,
  WEEKLY_ARTICLE_DIGESTS,
} from '../../../api/_lib/articlePublishSchedule';
import { getJstWeekday } from '../../../api/_lib/cohortWeek';
import { isWithdrawnArticle } from '../../constants/withdrawnArticleIds';

const MINDSET_ID_PREFIX = '1.1.';
const W41_PLUS_WEEKS = ['2026-W41', '2026-W42', '2026-W43', '2026-W44', '2026-W45', '2026-W46'];

function weekdayJstFromPublishDate(publishDate: string): number {
  const [y, m, d] = publishDate.split('-').map(Number);
  return getJstWeekday(new Date(Date.UTC(y, m - 1, d, 3, 0, 0)));
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

    expect(byFilename.get('CP-5-8_Cloverleaf')?.publishedAt).toBe(W41_CP_5_8_PUBLISH_DATE);
  });

  it('does not list withdrawn ids on the schedule', () => {
    for (const article of listScheduledArticles()) {
      expect(isWithdrawnArticle(article.id)).toBe(false);
    }
  });

  it('uses Sun·Wed·Fri cadence from W41 (CP-5-8 Mon is plan B exception)', () => {
    for (const weekKey of W41_PLUS_WEEKS) {
      const digest = WEEKLY_ARTICLE_DIGESTS[weekKey];
      expect(digest, weekKey).toBeDefined();
      for (const article of digest.articles) {
        const wd = weekdayJstFromPublishDate(article.publishDate);
        const isCp58Exception =
          article.id === 'CP-5-8_Cloverleaf' &&
          article.publishDate === W41_CP_5_8_PUBLISH_DATE &&
          wd === 1;
        if (wd === 5) {
          expect(article.id.startsWith(MINDSET_ID_PREFIX)).toBe(true);
        } else if (isCp58Exception) {
          expect(wd).toBe(1);
        } else {
          expect([0, 3]).toContain(wd);
        }
      }
    }
  });
});
