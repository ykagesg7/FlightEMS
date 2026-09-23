import type { CourseDef, CourseModuleDef } from '../data/courses';
import { COURSES, getCourseById } from '../data/courses';
import type { LearningContent } from '../types';
import type { ArticleMeta } from '../types/articles';
import {
  computeModuleProgress,
  getModuleArticles,
  matchesModuleSource,
  type ArticleProgressSnapshot,
  type CourseModuleProgress,
} from './courseProgress';

export interface ArticleCoursePosition {
  course: CourseDef;
  module: CourseModuleDef;
  moduleProgress: CourseModuleProgress;
  itemIndex: number;
  totalInModule: number;
}

export function findArticleCoursePosition(
  articleId: string,
  contents: LearningContent[],
  metas: Record<string, ArticleMeta>,
  getProgress: (id: string) => ArticleProgressSnapshot | null,
  courses: CourseDef[] = COURSES
): ArticleCoursePosition | null {
  const content = contents.find((c) => c.id === articleId);
  if (!content) return null;
  const meta = metas[articleId];

  for (const course of courses) {
    for (const module of course.modules) {
      if (!matchesModuleSource(content, meta, module.source)) continue;
      const moduleProgress = computeModuleProgress(module, contents, metas, getProgress);
      const itemIndex = moduleProgress.items.findIndex((item) => item.contentId === articleId);
      if (itemIndex < 0) return null;
      return {
        course,
        module,
        moduleProgress,
        itemIndex,
        totalInModule: moduleProgress.totalCount,
      };
    }
  }
  return null;
}

export function getCourseModuleQuizContentIds(
  module: CourseModuleDef,
  contents: LearningContent[],
  metas: Record<string, ArticleMeta>
): string[] {
  return getModuleArticles(module, contents, metas).map((c) => c.id);
}

export { getCourseById };
