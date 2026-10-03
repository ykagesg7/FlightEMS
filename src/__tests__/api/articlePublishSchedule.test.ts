import { describe, expect, it } from 'vitest';
import { collectArticleMetas } from '../../../vite/articlesMeta';
import {
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
});
