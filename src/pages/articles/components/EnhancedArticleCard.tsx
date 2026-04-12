import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArticleProgress } from '../../../hooks/useArticleProgress';
import { useAuth } from '../../../hooks/useAuth';
import { LearningContent } from '../../../types';
import { ArticleMeta } from '../../../types/articles';
import { calculateBaseArticleXp } from '../../../utils/articleXpRewards';

interface EnhancedArticleCardProps {
  article: LearningContent;
  articleMeta?: ArticleMeta;
  progress?: ArticleProgress;
  isDemo: boolean;
  onRegisterPrompt?: () => void;
  stats?: {
    likes_count: number;
    comments_count: number;
    views_count: number;
    user_liked: boolean;
  };
  highlightId?: string;
  onArticleClick?: () => void;
  isNextToRead?: boolean;
  articleStatus?: 'completed' | 'in-progress';
}

export const EnhancedArticleCard: React.FC<EnhancedArticleCardProps> = ({
  article,
  articleMeta,
  progress,
  isDemo,
  onRegisterPrompt,
  stats,
  highlightId,
  onArticleClick,
  isNextToRead = false,
  articleStatus = 'in-progress'
}) => {
  const { user } = useAuth();
  const [isHighlighted, setIsHighlighted] = useState(false);

  const isLoggedIn = !!user;

  useEffect(() => {
    if (highlightId === article.id) {
      setIsHighlighted(true);
      const timer = setTimeout(() => setIsHighlighted(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [highlightId, article.id]);

  const progressPercentage = progress?.scrollProgress || 0;
  const isCompleted = progress?.completed || false;
  const isBookmarked = progress?.bookmarked || false;
  const readingTime = articleMeta?.readingTime || 10;

  const articleXp = useMemo(() => {
    if (!articleMeta) return 0;
    return calculateBaseArticleXp(article.id, articleMeta);
  }, [article.id, articleMeta]);

  const shouldBlur = isDemo && Math.random() > 0.6;

  return (
    <div className={`
      group relative transition-all duration-300 transform hover:scale-[1.02] hover:-translate-y-1
      ${isHighlighted ? 'highlight-article' : ''}
      ${isNextToRead && articleStatus === 'in-progress' ? 'ring-2 ring-whiskyPapa-yellow ring-offset-2 ring-offset-whiskyPapa-black shadow-lg shadow-whiskyPapa-yellow/50' : ''}
    `}>
      {articleStatus === 'completed' && (
        <div className="absolute top-3 right-3 z-10 px-3 py-1 rounded-full bg-[#39FF14]/20 text-[#39FF14] border border-[#39FF14]/30 text-xs font-bold">
          完了
        </div>
      )}
      {articleStatus === 'in-progress' && !isCompleted && (
        <div className="absolute top-3 right-3 z-10 px-3 py-1 rounded-full bg-whiskyPapa-yellow/20 text-whiskyPapa-yellow border border-whiskyPapa-yellow/30 text-xs font-bold">
          進行中
        </div>
      )}

      {shouldBlur && (
        <div className="absolute inset-0 z-10 rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 backdrop-blur-sm flex items-center justify-center">
          <div className="text-center p-4">
            <div className="text-2xl mb-2">🔒</div>
            <div className="text-sm font-medium mb-2 text-white">
              詳細な進捗データ
            </div>
            <button
              onClick={onRegisterPrompt}
              className="px-4 py-2 rounded-lg text-xs font-medium transition-all duration-200 bg-blue-600 hover:bg-blue-500 text-white"
            >
              登録して見る
            </button>
          </div>
        </div>
      )}

      <div className={`relative overflow-hidden rounded-xl border-2 transition-all duration-300 backdrop-blur-sm shadow-lg hover:shadow-xl bg-whiskyPapa-black-dark border-whiskyPapa-yellow/20 shadow-whiskyPapa-yellow/20 hover:bg-white/10 ${shouldBlur ? 'blur-[1px]' : ''}`}>
        {progress && progressPercentage > 0 && (
          <div className="absolute top-0 left-0 right-0 h-1 z-10 bg-gray-800">
            <div
              className={`h-full transition-all duration-500 ${isCompleted ? 'bg-green-500' : 'bg-blue-500'
                }`}
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        )}

        <div className="p-5">
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-2">
                <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-900/50 text-blue-400 border border-blue-700/50">
                  {article.category}
                </span>

                {isCompleted && (
                  <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-900/50 text-green-400 border border-green-700/50">
                    ✅ 完了
                  </span>
                )}

                {progress && !isCompleted && progressPercentage > 0 && (
                  <span className="px-2 py-1 text-xs font-medium rounded-full bg-yellow-900/50 text-yellow-400 border border-yellow-700/50">
                    {progressPercentage}% 進行中
                  </span>
                )}
              </div>

              <Link
                to={`/articles/${article.id}`}
                onClick={onArticleClick}
                className="block text-lg font-bold mb-2 line-clamp-2 hover:underline transition-all duration-300 bg-gradient-to-r bg-clip-text text-transparent from-white to-gray-200 hover:from-blue-400 hover:to-purple-400"
              >
                {articleMeta?.title || article.title}
              </Link>

              {(articleMeta?.excerpt || article.description) && (
                <p className="text-sm line-clamp-2 mb-3 text-gray-300">
                  {articleMeta?.excerpt || article.description}
                </p>
              )}
            </div>

            {isBookmarked && (
              <div className="ml-3 text-lg text-yellow-400">
                🔖
              </div>
            )}
          </div>

          {articleMeta?.tags && articleMeta.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-3">
              {articleMeta.tags.slice(0, 3).map((tag, index) => (
                <span
                  key={index}
                  className="px-2 py-1 text-xs rounded-md bg-gray-800 text-gray-400"
                >
                  #{tag}
                </span>
              ))}
              {articleMeta.tags.length > 3 && (
                <span className="px-2 py-1 text-xs rounded-md bg-gray-800 text-gray-500">
                  +{articleMeta.tags.length - 3}
                </span>
              )}
            </div>
          )}

          <div className="flex items-center justify-between pt-3 border-t border-gray-200/50 dark:border-gray-700/50">
            <div className="flex items-center space-x-4 text-xs">
              <div className="flex items-center space-x-1 text-gray-400">
                <span>📖</span>
                <span>{readingTime}分</span>
              </div>

              <div className="flex items-center space-x-1 text-yellow-400">
                <span>⭐</span>
                <span className="font-semibold">+{articleXp} XP</span>
              </div>

              {(articleMeta?.publishedAt || article.created_at) && (
                <div className="flex items-center space-x-1 text-gray-400">
                  <span>📅</span>
                  <span>
                    {new Date(articleMeta?.publishedAt || article.created_at).toLocaleDateString('ja-JP', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    })}
                  </span>
                </div>
              )}

              {progress?.rating && (
                <div className="flex items-center space-x-1">
                  {[...Array(5)].map((_, i) => (
                    <span
                      key={i}
                      className={`text-xs ${i < progress.rating! ? 'text-yellow-400' : 'text-gray-600'
                        }`}
                    >
                      ⭐
                    </span>
                  ))}
                </div>
              )}
            </div>

            {stats && (
              <div className="flex items-center space-x-3 text-xs">
                {isLoggedIn && (
                  <>
                    <div className="flex items-center space-x-1 text-gray-400">
                      <span className={stats.user_liked ? '❤️' : '🤍'}>
                      </span>
                      <span>{stats.likes_count}</span>
                    </div>

                    <div className="flex items-center space-x-1 text-gray-400">
                      <span>💬</span>
                      <span>{stats.comments_count}</span>
                    </div>
                  </>
                )}

                <div className="flex items-center space-x-1 text-gray-400">
                  <span>👀</span>
                  <span>{stats.views_count}</span>
                </div>
              </div>
            )}
          </div>

          {progress && !isCompleted && progress.readAt && (
            <div className="mt-2 pt-2 border-t border-gray-200/30 dark:border-gray-700/30 text-xs text-gray-500">
              最後に読んだ: {new Date(progress.readAt).toLocaleDateString('ja-JP', {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
