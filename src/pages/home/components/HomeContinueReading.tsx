import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { filterPublishedArticleContents } from '../../../constants/articleHubCategories';
import { useArticleProgress } from '../../../hooks/useArticleProgress';
import { useAuth } from '../../../hooks/useAuth';
import { useLearningProgress } from '../../../hooks/useLearningProgress';
import { buildArticleIndex } from '../../../utils/articlesIndex';
import type { ArticleMeta } from '../../../types/articles';
import { pickNextToReadArticle, getMetaForArticle } from '../../articles/articleHubFilters';

export const HomeContinueReading: React.FC = () => {
  const { user } = useAuth();
  const { learningContents } = useLearningProgress();
  const { getArticleProgress } = useArticleProgress();
  const [metas, setMetas] = useState<Record<string, ArticleMeta>>({});

  useEffect(() => {
    buildArticleIndex().then((index) => {
      const map: Record<string, ArticleMeta> = {};
      index.forEach((e) => {
        map[e.filename] = e.meta;
      });
      setMetas(map);
    });
  }, []);

  if (!user) return null;

  const contents = filterPublishedArticleContents(learningContents);
  const next = pickNextToReadArticle(contents, metas, getArticleProgress);

  if (!next) return null;

  const meta = getMetaForArticle(next, metas);

  return (
    <div className="mx-auto mb-6 max-w-md rounded-xl border border-brand-primary/30 bg-brand-secondary-dark/80 p-4 text-left backdrop-blur-sm">
      <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-brand-primary">
        次に読む記事
      </p>
      <p className="mb-3 line-clamp-2 text-sm font-medium text-white">
        {meta?.title ?? next.title}
      </p>
      <Link
        to={`/articles/${next.id}`}
        className="inline-flex items-center rounded-lg bg-brand-primary px-4 py-2 text-sm font-semibold text-[var(--bg)] hover:bg-brand-primary-dark"
      >
        続きを読む
      </Link>
    </div>
  );
};
