import articleMetas from 'virtual:articles-index';
import { describe, expect, it } from 'vitest';
import { COURSES, getCourseById } from '../../data/courses';
import type { LearningContent } from '../../types';
import {
  computeCourseProgress,
  computeModuleProgress,
  findUncategorizedArticles,
  getModuleArticles,
  matchesModuleSource,
} from '../../utils/courseProgress';

function mockContent(
  partial: Partial<LearningContent> & Pick<LearningContent, 'id' | 'category'>
): LearningContent {
  return {
    title: partial.id,
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

describe('courseProgress', () => {
  const metas = {
    a: { title: 'A', slug: '/a', tags: [], series: 'Nav', order: 2 },
    b: { title: 'B', slug: '/b', tags: [], series: 'Nav', order: 1 },
  };

  const contents = [
    mockContent({ id: 'a', category: 'PPL', sub_category: '航空工学', order_index: 2 }),
    mockContent({ id: 'b', category: 'PPL', sub_category: '航空工学', order_index: 1 }),
    mockContent({ id: 'c', category: 'PPL', sub_category: '航空気象', order_index: 1 }),
  ];

  it('matches sub_category modules', () => {
    const module = getCourseById('ppl')!.modules[0];
    expect(matchesModuleSource(contents[0], metas.a, module.source)).toBe(true);
    expect(matchesModuleSource(contents[2], metas.c, module.source)).toBe(false);
  });

  it('sorts module articles by meta.order then order_index', () => {
    const module = {
      id: 'test',
      title: 'Test',
      source: { kind: 'series', series: 'Nav' },
    };
    const articles = getModuleArticles(module, contents, metas);
    expect(articles.map((article) => article.id)).toEqual(['b', 'a']);
  });

  it('computes module and course progress', () => {
    const ppl = getCourseById('ppl')!;
    const engineering = ppl.modules[0];
    const moduleProgress = computeModuleProgress(engineering, contents, metas, (id) =>
      id === 'b' ? { completed: true } : null
    );
    expect(moduleProgress.completedCount).toBe(1);
    expect(moduleProgress.nextItemId).toBe('a');

    const courseProgress = computeCourseProgress(ppl, contents, metas, (id) =>
      id === 'b' ? { completed: true } : null
    );
    expect(courseProgress.totalCount).toBeGreaterThan(0);
    expect(courseProgress.completedCount).toBe(1);
  });

  it('findUncategorizedArticles returns hub articles outside all course modules', () => {
    const released = [
      mockContent({ id: 'ppl-eng', category: 'PPL', sub_category: '航空工学' }),
      mockContent({ id: 'orphan', category: 'PPL', sub_category: 'その他' }),
    ];
    const hubMetas = {
      'ppl-eng': { title: 'PPL Eng', slug: '/ppl-eng', tags: [] },
      orphan: { title: 'Orphan', slug: '/orphan', tags: [] },
    };
    const orphans = findUncategorizedArticles(released, hubMetas);
    expect(orphans.map((article) => article.id)).toEqual(['orphan']);
  });

  it('maps PPL course modules to learning_contents sub_category values', () => {
    const ppl = getCourseById('ppl')!;
    const engineeringModule = ppl.modules[0];
    const lawArticle = mockContent({
      id: 'PPL-5-1-1_AviationLawDefinitions',
      category: 'PPL',
      sub_category: '航空法規',
    });
    expect(matchesModuleSource(lawArticle, undefined, engineeringModule.source)).toBe(false);

    const lawModule = ppl.modules.find((module) => module.title === '航空法規');
    expect(lawModule).toBeDefined();
    expect(matchesModuleSource(lawArticle, undefined, lawModule!.source)).toBe(true);
  });

  it('maps every mentality series in article metas to a course module', () => {
    const mentalitySeries = new Set(
      COURSES.find((course) => course.id === 'mentality')!.modules
        .filter((module) => module.source.kind === 'series')
        .map((module) => module.source.series)
    );

    const articleSeries = new Set(
      Object.values(articleMetas)
        .map((meta) => meta.series)
        .filter((series): series is string => Boolean(series))
    );

    const mindsetSeries = [...articleSeries].filter(
      (series) =>
        !series.startsWith('CPL-') &&
        !series.startsWith('USAF-') &&
        series !== 'PPL-Master-Syllabus'
    );

    for (const series of mindsetSeries) {
      expect(mentalitySeries.has(series), `missing mentality module for ${series}`).toBe(true);
    }
  });
});
