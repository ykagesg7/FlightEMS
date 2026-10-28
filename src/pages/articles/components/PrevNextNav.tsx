import articleMetas from 'virtual:articles-index';
import React, { useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { filterReleasedArticleContents } from '../../../constants/articleHubCategories';
import { useLearningProgress } from '../../../hooks/useLearningProgress';
import { getArticleNavigationNeighbors } from '../../../utils/articleNavigation';

function prefetchMDX(id: string) {
  import(`../../../content/articles/${id}.mdx`)
    .catch(() => import(`../../../content/lessons/${id}.mdx`))
    .catch(() => undefined);
}

export const PrevNextNav: React.FC<{ currentId: string; listPath?: string }> = ({
  currentId,
  listPath = '/articles',
}) => {
  const { learningContents } = useLearningProgress();
  const navigate = useNavigate();

  const list = useMemo(
    () => filterReleasedArticleContents(learningContents, articleMetas),
    [learningContents]
  );

  const { prev, next } = useMemo(
    () => getArticleNavigationNeighbors(currentId, list, articleMetas),
    [currentId, list]
  );

  useEffect(() => {
    if ((navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData) {
      return;
    }
    if (prev) prefetchMDX(prev.id);
    if (next) prefetchMDX(next.id);
  }, [prev, next]);

  return (
    <nav aria-label="前後の記事" className="mt-10 border-t border-brand-primary/15 pt-8">
      <div className="flex min-w-0 flex-col gap-4 sm:flex-row sm:items-stretch sm:justify-between sm:gap-3">
        {prev ? (
          <Link
            to={`/articles/${prev.id}`}
            aria-label={`前の記事: ${prev.title}`}
            onMouseEnter={() => prefetchMDX(prev.id)}
            className="hud-border hud-surface flex min-h-[44px] min-w-0 max-w-full flex-1 flex-col justify-center rounded-lg border px-4 py-3 text-left hover:border-brand-primary/40"
          >
            <span className="text-xs text-[color:var(--text-muted)]">前の記事</span>
            <span className="hud-text line-clamp-2 break-words text-sm font-medium underline-offset-2 [overflow-wrap:anywhere] hover:underline">
              ← {prev.title}
            </span>
          </Link>
        ) : (
          <div
            className="flex min-h-[44px] flex-1 items-center rounded-lg border border-dashed border-brand-primary/20 px-4 py-3 text-sm text-[color:var(--text-muted)]"
            aria-hidden
          >
            シリーズの先頭です
          </div>
        )}
        {next ? (
          <Link
            to={`/articles/${next.id}`}
            aria-label={`次の記事: ${next.title}`}
            onMouseEnter={() => prefetchMDX(next.id)}
            className="hud-border hud-surface flex min-h-[44px] min-w-0 max-w-full flex-1 flex-col justify-center rounded-lg border px-4 py-3 text-left sm:text-right hover:border-brand-primary/40"
          >
            <span className="text-xs text-[color:var(--text-muted)]">次の記事</span>
            <span className="hud-text line-clamp-2 break-words text-sm font-medium underline-offset-2 [overflow-wrap:anywhere] hover:underline">
              {next.title} →
            </span>
          </Link>
        ) : (
          <div
            className="flex min-h-[44px] flex-1 items-center justify-end rounded-lg border border-dashed border-brand-primary/20 px-4 py-3 text-sm text-[color:var(--text-muted)]"
            aria-hidden
          >
            シリーズの最後です
          </div>
        )}
      </div>
      <div className="mt-4 flex justify-center">
        <button
          type="button"
          aria-label="記事一覧へ"
          onClick={() => navigate(listPath)}
          className="hud-border hud-surface hud-text rounded-md border px-3 py-2 text-sm"
        >
          記事一覧へ
        </button>
      </div>
    </nav>
  );
};
