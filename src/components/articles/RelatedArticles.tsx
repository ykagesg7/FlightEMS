import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';
import type { ArticleIndexEntry } from '../../types/articles';
import { getRelatedArticles } from '../../utils/articlesIndex';

interface RelatedArticlesProps {
  currentSlug: string;
  limit?: number;
  showSeries?: boolean;
}

const RelatedArticles: React.FC<RelatedArticlesProps> = ({
  currentSlug,
  limit = 3,
  showSeries = true
}) => {
  const { effectiveTheme } = useTheme();
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
      <div className={`
        p-6 rounded-lg border transition-colors duration-200
        ${effectiveTheme === 'dark'
          ? 'bg-[color:var(--panel)] border-[color:var(--hud-primary)] border-opacity-20'
          : 'bg-[color:var(--panel)] border-[color:var(--hud-primary)] border-opacity-25'
        }
      `}>
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
    <section className={`
      p-6 rounded-lg border transition-colors duration-200
      ${effectiveTheme === 'dark'
        ? 'bg-[color:var(--panel)] border-[color:var(--hud-primary)] border-opacity-20'
        : 'bg-[color:var(--panel)] border-[color:var(--hud-primary)] border-opacity-25'
      }
    `}>
      <div className="flex items-center gap-2 mb-6">
        <svg className="w-5 h-5 text-[color:var(--hud-primary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
        </svg>
        <h3 className={`
          text-lg font-semibold transition-colors duration-200
          ${effectiveTheme === 'dark'
            ? 'text-[color:var(--hud-primary)]'
            : 'text-[color:var(--hud-primary)]'
          }
        `}>
          関連記事
        </h3>
      </div>

      <div className="space-y-4">
        {relatedArticles.map((article) => (
          <article
            key={article.meta.slug}
            className={`
              p-4 rounded-lg border transition-all duration-200 hover:shadow-md
              ${effectiveTheme === 'dark'
                ? 'bg-[color:var(--main)] border-[color:var(--hud-primary)] border-opacity-30 hover:bg-[color:var(--panel)] hover:border-[color:var(--hud-primary)] hover:border-opacity-50'
                : 'bg-[color:var(--main)] border-[color:var(--hud-primary)] border-opacity-20 hover:bg-[color:var(--panel)] hover:border-[color:var(--hud-primary)] hover:border-opacity-40'
              }
            `}
          >
            <Link
              to={`/articles/${article.filename}`}
              className="block space-y-2 no-underline"
            >
              {/* タイトル */}
              <h4 className="font-medium text-[color:var(--text-primary)] hover:text-[color:var(--hud-primary)] transition-colors duration-200 line-clamp-2">
                {article.meta.title}
              </h4>

              {/* 要約 */}
              {article.meta.excerpt && (
                <p className="text-sm text-[color:var(--text-primary)] opacity-80 line-clamp-2">
                  {article.meta.excerpt}
                </p>
              )}

              {/* メタ情報 */}
              <div className="flex items-center gap-4 text-xs text-[color:var(--text-primary)] opacity-60">
                {/* 公開日 */}
                {article.meta.publishedAt && (
                  <span className="flex items-center gap-1">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    {formatDate(article.meta.publishedAt)}
                  </span>
                )}

                {/* 読了時間 */}
                {article.meta.readingTime && (
                  <span className="flex items-center gap-1">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {article.meta.readingTime}分
                  </span>
                )}

                {/* シリーズ */}
                {showSeries && article.meta.series && (
                  <span className="flex items-center gap-1">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14-7l2 2m0 0l2 2m-2-2v6m-2 5.5V16a2 2 0 00-2-2h-4m-2 2.5V20a2 2 0 01-2-2v-2a2 2 0 012-2h4a2 2 0 012 2z" />
                    </svg>
                    {article.meta.series}
                  </span>
                )}
              </div>

              {/* タグ */}
              {article.meta.tags && article.meta.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {article.meta.tags.slice(0, 3).map((tag, index) => (
                    <span
                      key={index}
                      className={`
                        px-2 py-0.5 text-xs rounded-full border
                        ${effectiveTheme === 'dark'
                          ? 'bg-indigo-900 bg-opacity-30 border-indigo-700 text-indigo-300'
                          : 'bg-indigo-100 border-indigo-300 text-indigo-700'
                        }
                      `}
                    >
                      {tag}
                    </span>
                  ))}
                  {article.meta.tags.length > 3 && (
                    <span className="text-xs text-[color:var(--text-primary)] opacity-50">
                      +{article.meta.tags.length - 3}
                    </span>
                  )}
                </div>
              )}
            </Link>
          </article>
        ))}
      </div>
    </section>
  );
};

export default RelatedArticles;
