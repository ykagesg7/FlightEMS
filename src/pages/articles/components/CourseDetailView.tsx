import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import type { CourseDef } from '../../../data/courses';
import { useContentQuizAvailability } from '../../../hooks/useContentQuizAvailability';
import { buildContentTestHref } from '../../test/testHubFilters';
import { CPL_CATEGORY, PPL_CATEGORY } from '../../../constants/articleHubCategories';
import type { LearningContent } from '../../../types';
import type { ArticleMeta } from '../../../types/articles';
import {
  computeCourseProgress,
  isArticleCompleted,
  type ArticleProgressSnapshot,
  type CourseModuleProgress,
} from '../../../utils/courseProgress';
import { getMetaForArticle } from '../articleHubFilters';

interface CourseDetailViewProps {
  course: CourseDef;
  articleContents: LearningContent[];
  articleMetas: Record<string, ArticleMeta>;
  getArticleProgress: (id: string) => ArticleProgressSnapshot | null;
  onArticleClick: (articleId: string) => void;
  isGuest?: boolean;
}

function moduleQuizHref(
  module: CourseModuleProgress,
  courseId: string,
  contents: LearningContent[]
): string | null {
  if (module.items.length === 0) return null;
  const firstId = module.items[0].contentId;
  const content = contents.find((c) => c.id === firstId);
  if (!content) return null;
  if (courseId === 'ppl' && content.category === PPL_CATEGORY) {
    return buildContentTestHref({ contentId: firstId, subject: content.sub_category ?? '工学', exam: 'ppl' });
  }
  if (courseId === 'cpl' && content.category === CPL_CATEGORY) {
    return buildContentTestHref({ contentId: firstId, subject: content.sub_category ?? '工学' });
  }
  return null;
}

export const CourseDetailView: React.FC<CourseDetailViewProps> = ({
  course,
  articleContents,
  articleMetas,
  getArticleProgress,
  onArticleClick,
  isGuest = false,
}) => {
  const progress = useMemo(
    () => computeCourseProgress(course, articleContents, articleMetas, getArticleProgress),
    [course, articleContents, articleMetas, getArticleProgress]
  );

  const moduleQuizContentIds = useMemo(
    () =>
      progress.modules
        .map((module) => module.items[0]?.contentId)
        .filter((id): id is string => Boolean(id)),
    [progress.modules]
  );
  const { availableIds: quizAvailableIds } = useContentQuizAvailability(moduleQuizContentIds);

  const coursePercentage =
    progress.totalCount > 0 ? Math.round(progress.completionRate * 100) : 0;

  return (
    <div className="space-y-6" data-testid="course-detail-view">
      <div className="rounded-xl border border-brand-primary/20 bg-brand-secondary-dark p-5 backdrop-blur-sm">
        <h2 className="mb-1 text-xl font-bold text-[var(--text-primary)]">{course.title}</h2>
        <p className="mb-4 text-sm text-[var(--text-muted)]">{course.description}</p>
        <div className="mb-2 flex items-center justify-between text-sm">
          <span className="text-brand-primary/90">コース進捗</span>
          <span className="text-[var(--text-muted)]">
            {progress.completedCount}/{progress.totalCount}（{coursePercentage}%）
          </span>
        </div>
        <div className="h-3 w-full overflow-hidden rounded-full border border-brand-primary/30 bg-[var(--bg)]">
          <div
            className="h-full rounded-full bg-gradient-to-r from-brand-primary to-brand-primary/80 transition-all duration-500"
            style={{ width: `${coursePercentage}%` }}
          />
        </div>
      </div>

      <div className="space-y-5">
        {progress.modules.map((module) => {
          const modulePct =
            module.totalCount > 0 ? Math.round(module.completionRate * 100) : 0;
          const firstContentId = module.items[0]?.contentId;
          const quizHref =
            firstContentId && quizAvailableIds.has(firstContentId)
              ? moduleQuizHref(module, course.id, articleContents)
              : null;
          const isEmpty = module.totalCount === 0;

          return (
            <section
              key={module.moduleId}
              className="rounded-xl border border-brand-primary/20 bg-brand-secondary-dark p-4 backdrop-blur-sm"
              aria-labelledby={`module-${module.moduleId}`}
            >
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <h3
                  id={`module-${module.moduleId}`}
                  className="text-base font-semibold text-brand-primary/90"
                >
                  {module.title}
                </h3>
                {isEmpty ? (
                  <span className="rounded-full border border-hud-warning/40 bg-hud-warning/10 px-2 py-0.5 text-xs text-hud-warning">
                    近日公開
                  </span>
                ) : (
                  <span className="text-xs text-[var(--text-muted)]">
                    {module.completedCount}/{module.totalCount}（{modulePct}%）
                  </span>
                )}
              </div>

              {!isEmpty && (
                <div className="mb-3 h-2 w-full overflow-hidden rounded-full border border-brand-primary/20 bg-[var(--bg)]">
                  <div
                    className={`h-full rounded-full bg-gradient-to-r transition-all duration-500 ${
                      modulePct === 100
                        ? 'from-hud-green/80 to-hud-green'
                        : isGuest
                          ? 'from-brand-primary/80 to-brand-primary'
                          : 'from-hud-green/80 to-hud-green'
                    }`}
                    style={{ width: `${modulePct}%` }}
                  />
                </div>
              )}

              {isEmpty ? (
                <p className="text-sm text-[var(--text-muted)]">
                  公開待ちの記事があります。ドリップ公開後にここに並びます。
                </p>
              ) : (
                <ol className="space-y-2">
                  {module.items.map((item, index) => {
                    const done = isArticleCompleted(getArticleProgress(item.contentId));
                    const meta = getMetaForArticle(
                      { id: item.contentId, title: item.title } as LearningContent,
                      articleMetas
                    );
                    const isNext = module.nextItemId === item.contentId;
                    return (
                      <li key={item.contentId}>
                        <Link
                          to={`/articles/${item.contentId}`}
                          onClick={() => onArticleClick(item.contentId)}
                          className={`flex items-center gap-3 rounded-lg border px-3 py-2 text-sm transition-colors ${
                            isNext
                              ? 'border-brand-primary/50 bg-brand-primary/10 text-[var(--text-primary)]'
                              : 'border-brand-primary/15 text-[var(--text-primary)] hover:border-brand-primary/35 hover:bg-brand-primary/5'
                          }`}
                        >
                          <span
                            className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs ${
                              done
                                ? 'border border-hud-green/40 bg-hud-green/20 text-hud-green'
                                : 'border border-brand-primary/30 text-brand-primary/70'
                            }`}
                            aria-hidden
                          >
                            {done ? '✓' : index + 1}
                          </span>
                          <span className="min-w-0 flex-1 truncate">{item.title}</span>
                          {meta?.readingTime && (
                            <span className="shrink-0 text-xs text-[var(--text-muted)]">
                              {meta.readingTime}分
                            </span>
                          )}
                          {isNext && (
                            <span className="shrink-0 text-xs font-medium text-brand-primary">
                              次に読む
                            </span>
                          )}
                        </Link>
                      </li>
                    );
                  })}
                </ol>
              )}

              {quizHref && !isEmpty && (
                <div className="mt-3 border-t border-brand-primary/10 pt-3">
                  <Link
                    to={quizHref}
                    className="inline-flex items-center gap-1 text-sm font-medium text-brand-primary hover:underline"
                  >
                    モジュールの理解度チェック（Quiz）→
                  </Link>
                </div>
              )}

              {!quizHref && !isEmpty && (course.id === 'cp' || course.id === 'fn' || course.id === 'mentality') && (
                <div className="mt-3 border-t border-brand-primary/10 pt-3">
                  <Link
                    to="/planning?mode=learn"
                    className="inline-flex items-center gap-1 text-sm text-[var(--text-muted)] hover:text-brand-primary"
                  >
                    Planning 学習モードで試す →
                  </Link>
                </div>
              )}
            </section>
          );
        })}
      </div>
    </div>
  );
};
