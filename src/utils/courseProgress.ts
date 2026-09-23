import type { CourseDef, CourseModuleDef, CourseModuleSource } from '../data/courses';
import { COURSES } from '../data/courses';
import type { LearningContent } from '../types';
import type { ArticleMeta } from '../types/articles';

export interface ArticleProgressSnapshot {
  completed?: boolean;
  scrollProgress?: number;
}

export interface CourseModuleItem {
  contentId: string;
  title: string;
  order: number;
}

export interface CourseModuleProgress {
  moduleId: string;
  title: string;
  items: CourseModuleItem[];
  completedCount: number;
  totalCount: number;
  completionRate: number;
  nextItemId: string | null;
}

export interface CourseProgress {
  courseId: string;
  title: string;
  modules: CourseModuleProgress[];
  completedCount: number;
  totalCount: number;
  completionRate: number;
}

export function isArticleCompleted(progress: ArticleProgressSnapshot | null): boolean {
  if (!progress) return false;
  return progress.completed === true || (progress.scrollProgress ?? 0) >= 95;
}

function articleOrder(content: LearningContent, meta: ArticleMeta | undefined): number {
  return meta?.order ?? content.order_index;
}

function compareCourseItems(
  a: LearningContent,
  b: LearningContent,
  metas: Record<string, ArticleMeta>
): number {
  const orderA = articleOrder(a, metas[a.id]);
  const orderB = articleOrder(b, metas[b.id]);
  if (orderA !== orderB) return orderA - orderB;
  return a.order_index - b.order_index;
}

export function matchesModuleSource(
  content: LearningContent,
  meta: ArticleMeta | undefined,
  source: CourseModuleSource
): boolean {
  switch (source.kind) {
    case 'sub_category':
      return content.category === source.category && content.sub_category === source.subCategory;
    case 'series':
      return meta?.series === source.series;
    case 'series_prefix':
      return meta?.series === source.series && content.id.startsWith(source.idPrefix);
    default:
      return false;
  }
}

export function getModuleArticles(
  module: CourseModuleDef,
  contents: LearningContent[],
  metas: Record<string, ArticleMeta>
): LearningContent[] {
  return contents
    .filter((content) => matchesModuleSource(content, metas[content.id], module.source))
    .sort((a, b) => compareCourseItems(a, b, metas));
}

export function computeModuleProgress(
  module: CourseModuleDef,
  contents: LearningContent[],
  metas: Record<string, ArticleMeta>,
  getProgress: (id: string) => ArticleProgressSnapshot | null
): CourseModuleProgress {
  const articles = getModuleArticles(module, contents, metas);
  const items: CourseModuleItem[] = articles.map((content) => ({
    contentId: content.id,
    title: content.title,
    order: articleOrder(content, metas[content.id]),
  }));
  const completedCount = articles.filter((content) =>
    isArticleCompleted(getProgress(content.id))
  ).length;
  const next = articles.find((content) => !isArticleCompleted(getProgress(content.id)));

  return {
    moduleId: module.id,
    title: module.title,
    items,
    completedCount,
    totalCount: articles.length,
    completionRate: articles.length === 0 ? 0 : completedCount / articles.length,
    nextItemId: next?.id ?? null,
  };
}

export function computeCourseProgress(
  course: CourseDef,
  contents: LearningContent[],
  metas: Record<string, ArticleMeta>,
  getProgress: (id: string) => ArticleProgressSnapshot | null
): CourseProgress {
  const modules = course.modules.map((module) =>
    computeModuleProgress(module, contents, metas, getProgress)
  );
  const totalCount = modules.reduce((sum, module) => sum + module.totalCount, 0);
  const completedCount = modules.reduce((sum, module) => sum + module.completedCount, 0);

  return {
    courseId: course.id,
    title: course.title,
    modules,
    completedCount,
    totalCount,
    completionRate: totalCount === 0 ? 0 : completedCount / totalCount,
  };
}

export function isContentInAnyCourse(
  content: LearningContent,
  meta: ArticleMeta | undefined,
  courses: CourseDef[] = COURSES
): boolean {
  return courses.some((course) =>
    course.modules.some((module) => matchesModuleSource(content, meta, module.source))
  );
}

export function findUncategorizedArticles(
  contents: LearningContent[],
  metas: Record<string, ArticleMeta>,
  courses: CourseDef[] = COURSES
): LearningContent[] {
  return contents.filter((content) => !isContentInAnyCourse(content, metas[content.id], courses));
}
