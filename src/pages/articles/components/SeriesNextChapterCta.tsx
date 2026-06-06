import React from 'react';
import { Link } from 'react-router-dom';
import type { LearningContent } from '../../../types';
import type { ArticleMeta } from '../../../types/articles';

interface SeriesNextChapterCtaProps {
  next?: LearningContent;
  nextMeta?: ArticleMeta;
  currentMeta?: ArticleMeta;
}

export const SeriesNextChapterCta: React.FC<SeriesNextChapterCtaProps> = ({
  next,
  nextMeta,
  currentMeta,
}) => {
  if (!next) return null;

  const sameSeries =
    currentMeta?.series &&
    nextMeta?.series &&
    currentMeta.series === nextMeta.series;

  return (
    <div
      className={`mb-6 rounded-xl border-2 p-5 ${
        sameSeries
          ? 'border-brand-primary/50 bg-brand-primary/10'
          : 'border-brand-primary/20 bg-brand-secondary-dark'
      }`}
    >
      <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-brand-primary">
        {sameSeries ? 'シリーズの次章' : '次の記事'}
      </p>
      {sameSeries && currentMeta?.series && (
        <p className="mb-2 text-xs text-[var(--text-muted)]">{currentMeta.series}</p>
      )}
      <h3 className="mb-3 text-lg font-bold text-[var(--text-primary)]">
        {nextMeta?.title ?? next.title}
      </h3>
      <Link
        to={`/articles/${next.id}`}
        className="inline-flex items-center rounded-lg bg-brand-primary px-5 py-2.5 text-sm font-semibold text-[var(--bg)] hover:bg-brand-primary-dark"
      >
        次の章を読む →
      </Link>
    </div>
  );
};
