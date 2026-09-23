import type { LearningContent } from '../types';
import type { ArticleMeta } from '../types/articles';

function compareWithinSeries(
  a: LearningContent,
  b: LearningContent,
  metas: Record<string, ArticleMeta>
): number {
  const orderA = metas[a.id]?.order ?? 999;
  const orderB = metas[b.id]?.order ?? 999;
  if (orderA !== orderB) return orderA - orderB;
  return a.order_index - b.order_index;
}

function compareWithinCategory(a: LearningContent, b: LearningContent): number {
  return a.order_index - b.order_index;
}

/**
 * Prev/next within the same series (meta.order) or category (order_index fallback).
 * Aligns hub "next to read" with article footer navigation.
 */
export function getArticleNavigationNeighbors(
  currentId: string,
  contents: LearningContent[],
  metas: Record<string, ArticleMeta>
): { prev?: LearningContent; next?: LearningContent } {
  const current = contents.find((c) => c.id === currentId);
  if (!current) return {};

  const currentMeta = metas[current.id];
  const series = currentMeta?.series;

  if (series) {
    const seriesArticles = contents
      .filter((c) => metas[c.id]?.series === series)
      .sort((a, b) => compareWithinSeries(a, b, metas));
    const idx = seriesArticles.findIndex((c) => c.id === currentId);
    return {
      prev: idx > 0 ? seriesArticles[idx - 1] : undefined,
      next: idx >= 0 && idx < seriesArticles.length - 1 ? seriesArticles[idx + 1] : undefined,
    };
  }

  const categoryArticles = contents
    .filter((c) => c.category === current.category)
    .sort(compareWithinCategory);
  const idx = categoryArticles.findIndex((c) => c.id === currentId);
  return {
    prev: idx > 0 ? categoryArticles[idx - 1] : undefined,
    next: idx >= 0 && idx < categoryArticles.length - 1 ? categoryArticles[idx + 1] : undefined,
  };
}
