import { describe, expect, it } from 'vitest';
import { WITHDRAWN_ARTICLE_MESSAGE } from '../../constants/withdrawnArticleIds';
import {
  isWithdrawnArticleRouteParam,
  resolveWithdrawnArticleBasename,
} from '../../utils/withdrawnArticleRoute';
import { articleHrefForContentId } from '../../utils/articleCanonicalPath';
import articleMetas from 'virtual:articles-index';

describe('withdrawnArticleRoute', () => {
  it('resolves withdrawn canonical slugs to MDX basenames', () => {
    expect(resolveWithdrawnArticleBasename('thinking-vs-worrying-master')).toBe('2.1.1_Thinking');
    expect(resolveWithdrawnArticleBasename('/articles/thinking-vs-worrying-master')).toBe(
      '2.1.1_Thinking',
    );
    expect(resolveWithdrawnArticleBasename('concrete-abstract')).toBe('2.1.2_ConcreteAbstract');
    expect(isWithdrawnArticleRouteParam('thinking-vs-worrying-master')).toBe(true);
  });

  it('still matches legacy withdrawn basenames', () => {
    expect(resolveWithdrawnArticleBasename('2.1.1_Thinking')).toBe('2.1.1_Thinking');
    expect(resolveWithdrawnArticleBasename('2.1.2_ConcreteAbstract')).toBe('2.1.2_ConcreteAbstract');
  });

  it('does not treat published articles as withdrawn', () => {
    expect(resolveWithdrawnArticleBasename('unconscious-success')).toBeNull();
    expect(resolveWithdrawnArticleBasename('1.1.1_UnconsciousSuccess')).toBeNull();
  });

  it('maps /learning ids to canonical hrefs for withdrawn articles', () => {
    expect(articleHrefForContentId('2.1.1_Thinking', articleMetas)).toBe(
      '/articles/thinking-vs-worrying-master',
    );
    expect(articleHrefForContentId('2.1.2_ConcreteAbstract', articleMetas)).toBe(
      '/articles/concrete-abstract',
    );
    expect(WITHDRAWN_ARTICLE_MESSAGE).toContain('精査中');
  });
});