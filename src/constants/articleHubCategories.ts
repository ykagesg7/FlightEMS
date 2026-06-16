import type { LearningContent } from '../types';
import { isWithdrawnArticle } from './withdrawnArticleIds';

/** Categories shown in the article hub (DB learning_contents.category). */
export const ARTICLE_HUB_CATEGORIES = [
  'メンタリティー',
  '思考法',
  '操縦',
  'CPL学科',
  'PPL',
] as const;

export type ArticleHubCategory = (typeof ARTICLE_HUB_CATEGORIES)[number];

export const MINDSET_CATEGORIES = ['メンタリティー', '思考法'] as const;

export const CPL_CATEGORY = 'CPL学科' as const;
export const PPL_CATEGORY = 'PPL' as const;
/** DB `learning_contents.category` for USAF formation / flight-ops articles */
export const FLIGHT_OPS_CATEGORY = '操縦' as const;

export function isMindsetCategory(category: string): boolean {
  return (MINDSET_CATEGORIES as readonly string[]).includes(category);
}

export function isArticleHubCategory(category: string): category is ArticleHubCategory {
  return (ARTICLE_HUB_CATEGORIES as readonly string[]).includes(category);
}

/** Published hub articles: category match, is_published, and not withdrawn. */
export function filterPublishedArticleContents(
  learningContents: LearningContent[]
): LearningContent[] {
  return learningContents.filter(
    (content) =>
      content.is_published &&
      isArticleHubCategory(content.category) &&
      !isWithdrawnArticle(content.id)
  );
}

export function countByCategory(
  contents: LearningContent[],
  category: string
): number {
  return contents.filter((c) => c.category === category).length;
}

export function countMindsetArticles(contents: LearningContent[]): number {
  return contents.filter((c) => isMindsetCategory(c.category)).length;
}

export function countFlightOpsArticles(contents: LearningContent[]): number {
  return contents.filter((c) => c.category === FLIGHT_OPS_CATEGORY).length;
}
