import { describe, expect, it } from 'vitest';
import { getCourseById } from '../../data/courses';
import type { LearningContent } from '../../types';
import {
  findNextCourseArticle,
  formatCoursePositionLine,
  isPrimaryCourseComplete,
  resolvePrimaryCourseId,
} from '../../utils/dashboardCourse';

function mockContent(
  partial: Partial<LearningContent> & Pick<LearningContent, 'id' | 'category'>
): LearningContent {
  return {
    title: partial.title ?? partial.id,
    sub_category: partial.sub_category ?? null,
    description: null,
    order_index: partial.order_index ?? 0,
    parent_id: null,
    content_type: 'article',
    created_at: '2026-01-01',
    updated_at: '2026-01-01',
    is_published: true,
    ...partial,
  };
}

describe('dashboardCourse', () => {
  const metas = {
    a: { title: 'A', slug: '/a', tags: [], series: 'Nav', order: 2 },
    b: { title: 'B', slug: '/b', tags: [], series: 'Nav', order: 1 },
  };

  const contents = [
    mockContent({ id: 'a', category: 'PPL', sub_category: '航空工学', order_index: 2, title: '記事A' }),
    mockContent({ id: 'b', category: 'PPL', sub_category: '航空工学', order_index: 1, title: '記事B' }),
  ];

  it('resolvePrimaryCourseId prefers profile license_target', () => {
    expect(resolvePrimaryCourseId({ license_target: 'PPL' } as never)).toBe('ppl');
    expect(resolvePrimaryCourseId({ license_target: 'CPL' } as never)).toBe('cpl');
    expect(resolvePrimaryCourseId(null)).toBe('cpl');
  });

  it('findNextCourseArticle returns first incomplete item in course order', () => {
    const next = findNextCourseArticle('ppl', contents, metas, (id) =>
      id === 'b' ? { completed: true } : null
    );
    expect(next?.articleId).toBe('a');
    expect(next?.moduleTitle).toBe(getCourseById('ppl')!.modules[0].title);
  });

  it('formatCoursePositionLine renders one-line position', () => {
    const next = findNextCourseArticle('ppl', contents, metas, () => null);
    expect(next).not.toBeNull();
    if (!next) return;
    expect(formatCoursePositionLine(next)).toMatch(/^PPL 学科 · .+ 1\//);
  });

  it('isPrimaryCourseComplete is true when all module items are done', () => {
    const complete = isPrimaryCourseComplete('ppl', contents, metas, () => ({ completed: true }));
    expect(complete).toBe(true);
  });
});
