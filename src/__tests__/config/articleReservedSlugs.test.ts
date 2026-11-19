import reservedSlugs from '../../../config/article-reserved-slugs.json';
import { describe, expect, it } from 'vitest';
import { articleHrefForContentId } from '../../utils/articleCanonicalPath';

describe('article reserved slugs (MDX 未整備)', () => {
  it('maps every reserved learning_contents id to a kebab-case canonical href', () => {
    for (const [contentId, slug] of Object.entries(reservedSlugs as Record<string, string>)) {
      expect(slug).toMatch(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
      expect(articleHrefForContentId(contentId, {})).toBe(`/articles/${slug}`);
      expect(articleHrefForContentId(contentId, {})).not.toBe(`/articles/${contentId}`);
    }
  });
});