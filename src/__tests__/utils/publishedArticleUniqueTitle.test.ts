import articleMetas from 'virtual:articles-index';
import { describe, expect, it } from 'vitest';
import { isWithdrawnArticle } from '../../constants/withdrawnArticleIds';
import { isArticleReleased } from '../../utils/articlePublishGate';

describe('publishedArticleUniqueTitle', () => {
  it('does not assign the same title to two released articles', () => {
    /** Future-dated lessons may intentionally mirror titles during stub phases; list only if needed. */
    const titleExceptionPairs: Array<[string, string]> = [];

    const releasedByTitle = new Map<string, string[]>();

    for (const [filename, meta] of Object.entries(articleMetas)) {
      if (isWithdrawnArticle(filename)) continue;
      if (!meta?.title || !meta.publishedAt) continue;
      if (!isArticleReleased(meta.publishedAt)) continue;

      const list = releasedByTitle.get(meta.title) ?? [];
      list.push(filename);
      releasedByTitle.set(meta.title, list);
    }

    const duplicates: string[] = [];
    for (const [title, filenames] of releasedByTitle) {
      if (filenames.length <= 1) continue;
      const allowed =
        filenames.length === 2 &&
        titleExceptionPairs.some(
          ([a, b]) => filenames.includes(a) && filenames.includes(b),
        );
      if (!allowed) {
        duplicates.push(`${title} → ${filenames.join(', ')}`);
      }
    }

    expect(duplicates, duplicates.join('\n')).toEqual([]);
  });
});
