import React, { Suspense, lazy } from 'react';
import { Navigate, useParams } from 'react-router-dom';
import { resolveInAppArticleRedirectPath } from '../../utils/articleRouteResolve';

const ArticleDetailPage = lazy(() => import('./ArticleDetailPage'));

const articleLoadingFallback = (
  <div className="space-y-4 px-4 py-6" aria-busy="true" aria-label="記事を読み込み中">
    <div className="h-8 w-2/3 animate-pulse rounded bg-brand-surface" />
    <div className="h-40 animate-pulse rounded-lg bg-brand-secondary-dark" />
  </div>
);

/**
 * Resolves legacy or alias article paths during render (before GA4 page_view effects)
 * and lazy-loads the detail page only for canonical URLs.
 */
const ArticleDetailRoute: React.FC = () => {
  const { contentId } = useParams<{ contentId: string }>();
  const redirectTo = contentId ? resolveInAppArticleRedirectPath(contentId) : null;

  if (redirectTo) {
    return <Navigate to={redirectTo} replace />;
  }

  return (
    <Suspense fallback={articleLoadingFallback}>
      <ArticleDetailPage />
    </Suspense>
  );
};

export default ArticleDetailRoute;