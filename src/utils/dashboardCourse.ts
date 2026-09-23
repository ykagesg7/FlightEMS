import type { CourseDef } from '../data/courses';
import { getCourseById } from '../data/courses';
import type { LearningContent } from '../types';
import type { ArticleMeta } from '../types/articles';
import { computeCourseProgress, type ArticleProgressSnapshot } from './courseProgress';

export type PrimaryCourseId = 'ppl' | 'cpl';

export function resolvePrimaryCourseId(
  profile: { license_target?: string | null } | null | undefined
): PrimaryCourseId {
  return profile?.license_target === 'PPL' ? 'ppl' : 'cpl';
}

export interface NextCourseArticle {
  course: CourseDef;
  moduleTitle: string;
  articleId: string;
  itemIndex: number;
  totalInModule: number;
  articleTitle: string;
}

export function findNextCourseArticle(
  courseId: PrimaryCourseId,
  contents: LearningContent[],
  metas: Record<string, ArticleMeta>,
  getProgress: (id: string) => ArticleProgressSnapshot | null
): NextCourseArticle | null {
  const course = getCourseById(courseId);
  if (!course) return null;

  const progress = computeCourseProgress(course, contents, metas, getProgress);
  if (progress.totalCount === 0) return null;

  for (const module of progress.modules) {
    if (!module.nextItemId) continue;
    const itemIndex = module.items.findIndex((item) => item.contentId === module.nextItemId);
    if (itemIndex < 0) continue;
    const item = module.items[itemIndex];
    return {
      course,
      moduleTitle: module.title,
      articleId: module.nextItemId,
      itemIndex,
      totalInModule: module.totalCount,
      articleTitle: item.title,
    };
  }

  return null;
}

export function isPrimaryCourseComplete(
  courseId: PrimaryCourseId,
  contents: LearningContent[],
  metas: Record<string, ArticleMeta>,
  getProgress: (id: string) => ArticleProgressSnapshot | null
): boolean {
  const course = getCourseById(courseId);
  if (!course) return false;
  const progress = computeCourseProgress(course, contents, metas, getProgress);
  return progress.totalCount > 0 && progress.completedCount >= progress.totalCount;
}

export function formatCoursePositionLine(next: NextCourseArticle): string {
  return `${next.course.title} · ${next.moduleTitle} ${next.itemIndex + 1}/${next.totalInModule}`;
}
