import React, { useEffect, useId, useState } from 'react';
import { Link } from 'react-router-dom';
import type { ArticleIndexEntry } from '../../../types/articles';
import { getRelatedArticles } from '../../../utils/articlesIndex';

interface RelatedArticlesProps {
  currentSlug: string;
  limit?: number;
  showSeries?: boolean;
  collapsed?: boolean;
}

const RelatedArticles: React.FC<RelatedArticlesProps> = ({
  currentSlug,
  limit = 3,
  showSeries = true,
  collapsed = false,
}) => {
  const panelId = useId();
  const [relatedArticles, setRelatedArticles] = useState<ArticleIndexEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchRelatedArticles = async () => {
      try {
        setIsLoading(true);
        const articles = await getRelatedArticles(currentSlug, limit);
        setRelatedArticles(articles);
      } catch (error) {
        console.error('関連記事の取得に失敗しました:', error);
        setRelatedArticles([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRelatedArticles();
  }, [currentSlug, limit]);

  if (isLoading) {
    return (
      <div className="p-6 rounded-lg border border-brand-primary/20 bg-brand-secondary-dark transition-colors duration-200">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-300 rounded mb-4 w-32"></div>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="space-y-2">
                <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                <div className="h-3 bg-gray-300 rounded w-full"></div>
                <div className="h-3 bg-gray-300 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (relatedArticles.length === 0) {
    return null;
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return null;
    try {
      return new Date(dateString).toLocaleDateString('ja-JP', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return dateString;
    }
  };

  return (
    <section className="rounded-lg border border-brand-primary/20 bg-brand-secondary-dark p-6 transition-colors duration-200">
      {collapsed ? (
        <details>
          <summary className="flex cursor-pointer list-none items-center gap-2 text-lg font-semibold text-brand-primary">
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
            </svg>
            関連記事
          </summary>
          <div id={panelId} className="mt-6">
            <RelatedArticleList articles={relatedArticles} showSeries={showSeries} formatDate={formatDate} />
          </div>
        </details>
      ) : (
        <>
          <div className="mb-6 flex items-center gap-2">
            <svg className="h-5 w-5 text-brand-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
            </svg>
            <h3 className="text-lg font-semibold text-brand-primary transition-colors duration-200">
              関連記事
            </h3>
          </div>
          <RelatedArticleList articles={relatedArticles} showSeries={showSeries} formatDate={formatDate} />
        </>
      )}
    </section>
  );
};

function RelatedArticleList({
  articles,
  showSeries,
  formatDate,
}: {
  articles: ArticleIndexEntry[];
  showSeries: boolean;
  formatDate: (dateString?: string) => string | null;
}) {
  return (
    <div className="space-y-4">
      {articles.map((article) => (
        <article
          key={article.meta.slug}
          className="rounded-lg border border-brand-primary/30 bg-brand-surface p-4 transition-all duration-200 hover:border-brand-primary/50 hover:shadow-md motion-reduce:transition-none"
        >
          <Link
            to={`/articles/${article.filename}`}
            className="block space-y-2 no-underline"
          >
            <h4 className="line-clamp-2 font-medium text-[var(--text-primary)] hover:text-brand-primary">
              {article.meta.title}
            </h4>
            {article.meta.excerpt && (
              <p className="line-clamp-2 text-sm text-[var(--text-muted)]">
                {article.meta.excerpt}
              </p>
            )}
            <div className="flex items-center gap-4 text-xs text-[var(--text-muted)]">
              {article.meta.publishedAt && <span>{formatDate(article.meta.publishedAt)}</span>}
              {article.meta.readingTime && <span>{article.meta.readingTime}分</span>}
              {showSeries && article.meta.series && <span>{article.meta.series}</span>}
            </div>
            {article.meta.tags && article.meta.tags.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1">
                {article.meta.tags.slice(0, 3).map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full border border-brand-primary/30 bg-brand-primary/10 px-2 py-0.5 text-xs text-brand-primary"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </Link>
        </article>
      ))}
    </div>
  );
}

export default RelatedArticles;
