import React from 'react';
import type { ArticleMeta } from '../../../types/articles';

interface ArticleHeaderProps {
  meta: ArticleMeta;
}

const ArticleHeader: React.FC<ArticleHeaderProps> = ({ meta }) => {

  const formatDate = (dateString?: string) => {
    if (!dateString) return null;
    try {
      return new Date(dateString).toLocaleDateString('ja-JP', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch {
      return dateString;
    }
  };

  const readingTimeText = meta.readingTime ? `約${meta.readingTime}分` : null;

  return (
    <header className="mb-8 pb-6 border-b border-whiskyPapa-yellow/30 transition-colors duration-200">
      {/* タイトル */}
      <h1 className="text-3xl sm:text-4xl font-bold mb-4 leading-tight text-whiskyPapa-yellow transition-colors duration-200">
        {meta.title}
      </h1>

      {/* 要約 */}
      {meta.excerpt && (
        <p className="text-lg mb-6 leading-relaxed text-white opacity-90 transition-colors duration-200">
          {meta.excerpt}
        </p>
      )}

      {/* メタデータ */}
      <div className="flex flex-wrap items-center gap-4 text-sm text-white opacity-80 transition-colors duration-200">
        {/* 公開日 */}
        {meta.publishedAt && (
          <div className="flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span>{formatDate(meta.publishedAt)}</span>
          </div>
        )}

        {/* 読了時間 */}
        {readingTimeText && (
          <div className="flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{readingTimeText}</span>
          </div>
        )}

        {/* 著者 */}
        {meta.author && (
          <div className="flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <span>{meta.author}</span>
          </div>
        )}
      </div>

      {/* タグ */}
      {meta.tags && meta.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-4">
          {meta.tags.map((tag, index) => (
            <span
              key={index}
              className="px-3 py-1 text-xs rounded-full border bg-indigo-900 bg-opacity-30 border-indigo-700 text-indigo-300 transition-colors duration-200"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* シリーズ情報 */}
      {meta.series && (
        <div className="mt-4 p-3 rounded-lg border border-whiskyPapa-yellow/20 bg-whiskyPapa-black-dark transition-all duration-200">
          <div className="flex items-center gap-2 text-sm text-whiskyPapa-yellow transition-colors duration-200">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14-7l2 2m0 0l2 2m-2-2v6m-2 5.5V16a2 2 0 00-2-2h-4m-2 2.5V20a2 2 0 01-2-2v-2a2 2 0 012-2h4a2 2 0 012 2z" />
            </svg>
            <span className="font-medium">シリーズ: {meta.series}</span>
            {meta.order && <span className="text-white opacity-70">第{meta.order}回</span>}
          </div>
        </div>
      )}
    </header>
  );
};

export default ArticleHeader;
