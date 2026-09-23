import React from 'react';
import { Link } from 'react-router-dom';
import type { ArticleCoursePosition } from '../../../utils/articleCourseContext';

interface ArticleCoursePositionProps {
  position: ArticleCoursePosition;
}

export const ArticleCoursePositionBanner: React.FC<ArticleCoursePositionProps> = ({
  position,
}) => {
  const { course, module, itemIndex, totalInModule } = position;
  const displayIndex = itemIndex + 1;

  return (
    <nav
      className="mb-4 rounded-lg border border-brand-primary/25 bg-brand-secondary-dark px-4 py-3 text-sm"
      aria-label="コース内の位置"
    >
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[var(--text-muted)]">
        <Link to="/articles" className="text-brand-primary hover:underline">
          コース一覧
        </Link>
        <span aria-hidden>›</span>
        <Link
          to={`/articles?course=${course.id}`}
          className="text-brand-primary hover:underline"
        >
          {course.title}
        </Link>
        <span aria-hidden>›</span>
        <span className="text-[var(--text-primary)]">{module.title}</span>
      </div>
      <p className="mt-1 text-xs text-[var(--text-muted)]">
        モジュール内 {displayIndex}/{totalInModule}
      </p>
    </nav>
  );
};
