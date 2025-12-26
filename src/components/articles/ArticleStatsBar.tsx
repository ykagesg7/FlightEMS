import React from 'react';
import { ArticleStats } from '../../types/articles';

interface ArticleStatsBarProps {
  stats: ArticleStats;
  onLikeClick: () => void;
  onCommentClick: () => void;
  compact?: boolean; // コンパクト表示モード
}

export const ArticleStatsBar: React.FC<ArticleStatsBarProps> = ({
  stats,
  onLikeClick,
  onCommentClick,
  compact = false
}) => {
  const formatCount = (count: number): string => {
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}k`;
    }
    return count.toString();
  };

  if (compact) {
    return (
      <div className="flex items-center space-x-4 text-sm">
        {/* いいね */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onLikeClick();
          }}
          className={`flex items-center space-x-1 transition-colors duration-200 ${stats.user_liked
              ? 'text-red-500 hover:text-red-600'
              : 'text-gray-500 hover:text-red-500'
            }`}
          title="いいね（ログイン不要）"
        >
          <svg
            className="w-4 h-4"
            fill={stats.user_liked ? 'currentColor' : 'none'}
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
            />
          </svg>
          <span>{formatCount(stats.likes_count)}</span>
        </button>

        {/* コメント */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onCommentClick();
          }}
          className="flex items-center space-x-1 transition-colors duration-200 text-gray-500 hover:text-blue-500"
          title="コメント（ログイン必要）"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
            />
          </svg>
          <span>{formatCount(stats.comments_count)}</span>
        </button>

        {/* 閲覧数 */}
        <div className="flex items-center space-x-1 text-gray-400">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
            />
          </svg>
          <span>{formatCount(stats.views_count)}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between p-3 border-t border-gray-200">
      <div className="flex items-center space-x-6">
        {/* いいね */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onLikeClick();
          }}
          className={`flex items-center space-x-2 transition-all duration-200 hover:scale-105 ${stats.user_liked
              ? 'text-red-500 hover:text-red-600'
              : 'text-gray-500 hover:text-red-500'
            }`}
          title="いいね（ログイン不要）"
        >
          <svg
            className="w-5 h-5"
            fill={stats.user_liked ? 'currentColor' : 'none'}
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
            />
          </svg>
          <span className="font-medium">{formatCount(stats.likes_count)}</span>
          <span className="text-sm">いいね</span>
        </button>

        {/* コメント */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onCommentClick();
          }}
          className="flex items-center space-x-2 transition-all duration-200 hover:scale-105 text-gray-500 hover:text-blue-500"
          title="コメント（ログイン必要）"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
            />
          </svg>
          <span className="font-medium">{formatCount(stats.comments_count)}</span>
          <span className="text-sm">コメント</span>
        </button>
      </div>

      {/* 閲覧数 */}
      <div className="flex items-center space-x-2 text-sm text-gray-400">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
          />
        </svg>
        <span>{formatCount(stats.views_count)} 回閲覧</span>
      </div>
    </div>
  );
};
