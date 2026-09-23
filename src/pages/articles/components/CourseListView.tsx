import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { COURSES } from '../../../data/courses';
import type { LearningContent } from '../../../types';
import type { ArticleMeta } from '../../../types/articles';
import {
  computeCourseProgress,
  type ArticleProgressSnapshot,
} from '../../../utils/courseProgress';

interface CourseListViewProps {
  articleContents: LearningContent[];
  articleMetas: Record<string, ArticleMeta>;
  getArticleProgress: (id: string) => ArticleProgressSnapshot | null;
}

export const CourseListView: React.FC<CourseListViewProps> = ({
  articleContents,
  articleMetas,
  getArticleProgress,
}) => {
  const courses = useMemo(
    () =>
      COURSES.map((course) =>
        computeCourseProgress(course, articleContents, articleMetas, getArticleProgress)
      ),
    [articleContents, articleMetas, getArticleProgress]
  );

  return (
    <div className="space-y-4" data-testid="course-list-view">
      <p className="text-sm text-[var(--text-muted)]">
        コースを選んで学習の順番と進捗を確認できます。
      </p>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {courses.map((course) => {
          const percentage =
            course.totalCount > 0 ? Math.round(course.completionRate * 100) : 0;
          const courseDef = COURSES.find((c) => c.id === course.courseId);
          return (
            <Link
              key={course.courseId}
              to={`/articles?course=${course.courseId}`}
              className="group rounded-xl border border-brand-primary/25 bg-brand-secondary-dark p-5 shadow-lg backdrop-blur-sm transition-colors hover:border-brand-primary/50 hover:bg-brand-primary/5"
            >
              <div className="mb-2 flex items-start justify-between gap-2">
                <h3 className="text-lg font-bold text-[var(--text-primary)] group-hover:text-brand-primary">
                  {course.title}
                </h3>
                <span className="shrink-0 rounded-full border border-brand-primary/30 px-2 py-0.5 text-xs text-brand-primary/90">
                  {courseDef?.audience}
                </span>
              </div>
              {courseDef?.description && (
                <p className="mb-4 text-sm text-[var(--text-muted)]">{courseDef.description}</p>
              )}
              <div className="mb-2 flex items-center justify-between text-xs text-[var(--text-muted)]">
                <span>{course.completedCount}/{course.totalCount} 記事</span>
                <span>{percentage}%</span>
              </div>
              <div className="h-2.5 w-full overflow-hidden rounded-full border border-brand-primary/30 bg-[var(--bg)]">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-brand-primary to-brand-primary/80 transition-all duration-500"
                  style={{ width: `${percentage}%` }}
                />
              </div>
              <p className="mt-3 text-xs text-brand-primary/80">
                {course.modules.length} モジュール →
              </p>
            </Link>
          );
        })}
      </div>
    </div>
  );
};
