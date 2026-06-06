import React from 'react';
import type { LearningContent } from '../../../types';
import type { ArticleMeta } from '../../../types/articles';

interface ContinueReadingHeroProps {
  article: LearningContent;
  meta?: ArticleMeta;
  onRead: () => void;
}

export const ContinueReadingHero: React.FC<ContinueReadingHeroProps> = ({
  article,
  meta,
  onRead,
}) => (
  <div className="mb-8 rounded-xl border-2 border-brand-primary/40 bg-brand-secondary-dark p-6 shadow-lg ring-1 ring-brand-primary/20">
    <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-brand-primary">
      次に読む
    </p>
    <h2 className="mb-2 text-xl font-bold text-[var(--text-primary)]">{article.title}</h2>
    {meta?.excerpt && (
      <p className="mb-4 line-clamp-2 text-sm text-[var(--text-muted)]">{meta.excerpt}</p>
    )}
    <div className="mb-4 flex flex-wrap gap-2 text-xs text-[var(--text-muted)]">
      {meta?.series && <span className="rounded-full bg-brand-primary/10 px-2 py-0.5">{meta.series}</span>}
      {meta?.readingTime && <span>{meta.readingTime} 分</span>}
      <span>{article.category}</span>
    </div>
    <button
      type="button"
      onClick={onRead}
      className="rounded-lg bg-brand-primary px-6 py-2.5 text-sm font-semibold text-[var(--bg)] transition hover:bg-brand-primary-dark"
    >
      続きを読む
    </button>
  </div>
);
