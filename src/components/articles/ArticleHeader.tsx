import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import type { ArticleMeta } from '../../types/articles';

interface ArticleHeaderProps {
  meta: ArticleMeta;
}

const ArticleHeader: React.FC<ArticleHeaderProps> = ({ meta }) => {
  const { theme } = useTheme();

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
    <header className={`
      mb-8 pb-6 border-b transition-colors duration-200
      ${theme === 'dark'
        ? 'border-[color:var(--hud-primary)] border-opacity-30'
        : 'border-[color:var(--hud-primary)] border-opacity-40'
      }
    `}>
      {/* タイトル */}
      <h1 className={`
        text-3xl sm:text-4xl font-bold mb-4 leading-tight transition-colors duration-200
        ${theme === 'dark'
          ? 'text-[color:var(--hud-primary)]'
          : 'text-[color:var(--hud-primary)]'
        }
      `}>
        {meta.title}
      </h1>

      {/* 要約 */}
      {meta.excerpt && (
        <p className={`
          text-lg mb-6 leading-relaxed transition-colors duration-200
          ${theme === 'dark'
            ? 'text-[color:var(--text-primary)] opacity-90'
            : 'text-[color:var(--text-primary)] opacity-85'
          }
        `}>
          {meta.excerpt}
        </p>
      )}

      {/* メタ情報 */}
      <div className={`
        flex flex-wrap items-center gap-4 text-sm transition-colors duration-200
        ${theme === 'dark'
          ? 'text-[color:var(--text-primary)] opacity-80'
          : 'text-[color:var(--text-primary)] opacity-75'
        }
      `}>
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
              className={`px-3 py-1 text-xs rounded-full border transition-colors duration-200 ${theme === 'dark'
                ? 'bg-indigo-900 bg-opacity-30 border-indigo-700 text-indigo-300'
                : 'bg-indigo-100 border-indigo-300 text-indigo-700'
                }`}
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* シリーズ情報 */}
      {meta.series && (
        <div className={`
          mt-4 p-3 rounded-lg border transition-all duration-200
          ${theme === 'dark'
            ? 'bg-[color:var(--panel)] border-[color:var(--hud-primary)] border-opacity-20'
            : 'bg-[color:var(--panel)] border-[color:var(--hud-primary)] border-opacity-30'
          }
        `}>
          <div className={`
            flex items-center gap-2 text-sm transition-colors duration-200
            ${theme === 'dark'
              ? 'text-[color:var(--hud-primary)]'
              : 'text-[color:var(--hud-primary)]'
            }
          `}>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14-7l2 2m0 0l2 2m-2-2v6m-2 5.5V16a2 2 0 00-2-2h-4m-2 2.5V20a2 2 0 01-2-2v-2a2 2 0 012-2h4a2 2 0 012 2z" />
            </svg>
            <span className="font-medium">シリーズ: {meta.series}</span>
            {meta.order && <span className="text-[color:var(--text-primary)] opacity-70">第{meta.order}回</span>}
          </div>
        </div>
      )}
    </header>
  );
};

export default ArticleHeader;
