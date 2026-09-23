import articleMetas from 'virtual:articles-index';
import React, { useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { filterPublishedArticleContents } from '../../../constants/articleHubCategories';
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
    () => filterPublishedArticleContents(learningContents),
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
    <nav aria-label="前後の記事" className="mt-10">
      <div className="flex items-center justify-between gap-4">
        <div>
          {prev ? (
            <Link
              to={`/articles/${prev.id}`}
              aria-label={`前の記事: ${prev.title}`}
              onMouseEnter={() => prefetchMDX(prev.id)}
              className="hud-text text-sm underline hover:text-[color:var(--hud-primary)]"
            >
              ← {prev.title}
            </Link>
          ) : (
            <span className="text-sm text-[color:var(--text-muted)]">先頭です</span>
          )}
        </div>
        <button
          type="button"
          aria-label="記事一覧へ"
          onClick={() => navigate(listPath)}
          className="hud-border hud-surface hud-text rounded-md border px-3 py-2 text-sm"
        >
          一覧
        </button>
        <div className="text-right">
          {next ? (
            <Link
              to={`/articles/${next.id}`}
              aria-label={`次の記事: ${next.title}`}
              onMouseEnter={() => prefetchMDX(next.id)}
              className="hud-text text-sm underline hover:text-[color:var(--hud-primary)]"
            >
              {next.title} →
            </Link>
          ) : (
            <span className="text-sm text-[color:var(--text-muted)]">最後です</span>
          )}
        </div>
      </div>
    </nav>
  );
};
