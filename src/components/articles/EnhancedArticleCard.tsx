import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';
import { ArticleProgress } from '../../hooks/useArticleProgress';
import { LearningContent } from '../../types';
import { ArticleMeta } from '../../types/articles';

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
}

export const EnhancedArticleCard: React.FC<EnhancedArticleCardProps> = ({
  article,
  articleMeta,
  progress,
  isDemo,
  onRegisterPrompt,
  stats,
  highlightId
}) => {
  const { effectiveTheme } = useTheme();
  const [isHighlighted, setIsHighlighted] = useState(false);

  // ハイライト効果
  useEffect(() => {
    if (highlightId === article.id) {
      setIsHighlighted(true);
      const timer = setTimeout(() => setIsHighlighted(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [highlightId, article.id]);

  // 進捗計算
  const progressPercentage = progress?.scrollProgress || 0;
  const isCompleted = progress?.completed || false;
  const isBookmarked = progress?.bookmarked || false;
  const readingTime = articleMeta?.readingTime || 10;

  // デモ用ブラー効果の判定
  const shouldBlur = isDemo && Math.random() > 0.6; // 40%の記事をブラー

  return (
    <div className={`
      group relative transition-all duration-300 transform hover:scale-[1.02] hover:-translate-y-1
      ${isHighlighted ? 'highlight-article' : ''}
    `}>
      {/* デモ用オーバーレイ */}
      {shouldBlur && (
        <div className="absolute inset-0 z-10 rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 backdrop-blur-sm flex items-center justify-center">
          <div className="text-center p-4">
            <div className="text-2xl mb-2">🔒</div>
            <div className={`
              text-sm font-medium mb-2
              ${effectiveTheme === 'dark' ? 'text-white' : 'text-gray-900'}
            `}>
              詳細な進捗データ
            </div>
            <button
              onClick={onRegisterPrompt}
              className={`
                px-4 py-2 rounded-lg text-xs font-medium transition-all duration-200
                ${effectiveTheme === 'dark'
                  ? 'bg-blue-600 hover:bg-blue-500 text-white'
                  : 'bg-blue-500 hover:bg-blue-400 text-white'
                }
              `}
            >
              登録して見る
            </button>
          </div>
        </div>
      )}

      <div className={`
         relative overflow-hidden rounded-xl border-2 transition-all duration-300 backdrop-blur-sm
         shadow-lg hover:shadow-xl
         ${effectiveTheme === 'dark'
          ? 'hud-surface border-red-500/60 shadow-red-900/20 hover:bg-white/10'
          : 'hud-surface border-green-500/50 shadow-green-900/10 hover:bg-white/10'
        }
         ${shouldBlur ? 'blur-[1px]' : ''}
       `}>
        {/* 進捗バー（上部） */}
        {progress && progressPercentage > 0 && (
          <div className={`
            absolute top-0 left-0 right-0 h-1 z-10
            ${effectiveTheme === 'dark'
              ? 'bg-gray-800'
              : 'bg-green-100'
            }
          `}>
            <div
              className={`
                h-full transition-all duration-500
                ${isCompleted
                  ? effectiveTheme === 'dark'
                    ? 'bg-green-500'
                    : 'bg-[color:var(--hud-primary)]'
                  : effectiveTheme === 'dark'
                    ? 'bg-blue-500'
                    : 'bg-yellow-500'
                }
              `}
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        )}

        <div className="p-5">
          {/* ヘッダー部分 */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              {/* カテゴリーとステータス */}
              <div className="flex items-center space-x-2 mb-2">
                <span className={`
                   px-2 py-1 text-xs font-medium rounded-full
                   ${effectiveTheme === 'dark'
                    ? 'bg-blue-900/50 text-blue-400 border border-blue-700/50'
                    : effectiveTheme === 'day'
                      ? 'bg-green-100 text-[#39FF14] border border-green-300'
                      : 'bg-blue-100 text-blue-700 border border-blue-300'
                  }
                 `}>
                  {article.category}
                </span>

                {isCompleted && (
                  <span className={`
                     px-2 py-1 text-xs font-medium rounded-full
                     ${effectiveTheme === 'dark'
                      ? 'bg-green-900/50 text-green-400 border border-green-700/50'
                      : effectiveTheme === 'day'
                        ? 'bg-green-100 text-[#39FF14] border border-green-300'
                        : 'bg-green-100 text-green-700 border border-green-300'
                    }
                   `}>
                    ✓ 完了
                  </span>
                )}

                {progress && !isCompleted && progressPercentage > 0 && (
                  <span className={`
                    px-2 py-1 text-xs font-medium rounded-full
                    ${effectiveTheme === 'dark'
                      ? 'bg-yellow-900/50 text-yellow-400 border border-yellow-700/50'
                      : effectiveTheme === 'day'
                        ? 'bg-yellow-100 text-yellow-700 border border-yellow-300'
                        : 'bg-yellow-100 text-yellow-700 border border-yellow-300'
                    }
                  `}>
                    {progressPercentage}% 進行中
                  </span>
                )}
              </div>

              {/* タイトル */}
              <Link
                to={`/articles/${article.id}`}
                className={`
                     block text-lg font-bold mb-2 line-clamp-2 hover:underline transition-all duration-300
                     bg-gradient-to-r bg-clip-text text-transparent
                     ${effectiveTheme === 'dark'
                    ? 'from-white to-gray-200 hover:from-blue-400 hover:to-purple-400'
                    : effectiveTheme === 'day'
                      ? 'from-[#39FF14] to-green-700 hover:from-green-500 hover:to-green-600'
                      : 'from-gray-900 to-gray-700 hover:from-blue-600 hover:to-indigo-600'
                  }
                   `}
              >
                {articleMeta?.title || article.title}
              </Link>

              {/* 要約 */}
              {(articleMeta?.excerpt || article.description) && (
                <p className={`
                  text-sm line-clamp-2 mb-3
                  ${effectiveTheme === 'dark'
                    ? 'text-gray-300'
                    : effectiveTheme === 'day'
                      ? 'text-green-700'
                      : 'text-gray-600'
                  }
                `}>
                  {articleMeta?.excerpt || article.description}
                </p>
              )}
            </div>

            {/* ブックマークアイコン */}
            {isBookmarked && (
              <div className={`
                ml-3 text-lg
                ${effectiveTheme === 'dark'
                  ? 'text-yellow-400'
                  : effectiveTheme === 'day'
                    ? 'text-yellow-500'
                    : 'text-yellow-500'
                }
              `}>
                🔖
              </div>
            )}
          </div>

          {/* タグ */}
          {articleMeta?.tags && articleMeta.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-3">
              {articleMeta.tags.slice(0, 3).map((tag, index) => (
                <span
                  key={index}
                  className={`
                    px-2 py-1 text-xs rounded-md
                    ${effectiveTheme === 'dark'
                      ? 'bg-gray-800 text-gray-400'
                      : effectiveTheme === 'day'
                        ? 'bg-green-100 text-green-600'
                        : 'bg-gray-100 text-gray-600'
                    }
                  `}
                >
                  #{tag}
                </span>
              ))}
              {articleMeta.tags.length > 3 && (
                <span className={`
                  px-2 py-1 text-xs rounded-md
                  ${effectiveTheme === 'dark'
                    ? 'bg-gray-800 text-gray-500'
                    : effectiveTheme === 'day'
                      ? 'bg-green-100 text-green-500'
                      : 'bg-gray-100 text-gray-500'
                  }
                `}>
                  +{articleMeta.tags.length - 3}
                </span>
              )}
            </div>
          )}

          {/* フッター情報 */}
          <div className="flex items-center justify-between pt-3 border-t border-gray-200/50 dark:border-gray-700/50">
            <div className="flex items-center space-x-4 text-xs">
              {/* 読了時間 */}
              <div className={`
                flex items-center space-x-1
                ${effectiveTheme === 'dark'
                  ? 'text-gray-400'
                  : effectiveTheme === 'day'
                    ? 'text-green-600'
                    : 'text-gray-600'
                }
              `}>
                <span>📖</span>
                <span>{readingTime}分</span>
              </div>

              {/* 公開日 */}
              {articleMeta?.publishedAt && (
                <div className={`
                  flex items-center space-x-1
                  ${effectiveTheme === 'dark'
                    ? 'text-gray-400'
                    : effectiveTheme === 'day'
                      ? 'text-green-600'
                      : 'text-gray-600'
                  }
                `}>
                  <span>📅</span>
                  <span>
                    {new Date(articleMeta.publishedAt).toLocaleDateString('ja-JP', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    })}
                  </span>
                </div>
              )}

              {/* 評価 */}
              {progress?.rating && (
                <div className="flex items-center space-x-1">
                  {[...Array(5)].map((_, i) => (
                    <span
                      key={i}
                      className={`
                        text-xs
                        ${i < progress.rating!
                          ? effectiveTheme === 'dark'
                            ? 'text-yellow-400'
                            : 'text-yellow-500'
                          : effectiveTheme === 'dark'
                            ? 'text-gray-600'
                            : 'text-gray-300'
                        }
                      `}
                    >
                      ⭐
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* ソーシャル統計 */}
            {stats && (
              <div className="flex items-center space-x-3 text-xs">
                <div className={`
                  flex items-center space-x-1
                  ${effectiveTheme === 'dark'
                    ? 'text-gray-400'
                    : effectiveTheme === 'day'
                      ? 'text-green-600'
                      : 'text-gray-600'
                  }
                `}>
                  <span className={stats.user_liked ? '❤️' : '🤍'}>
                  </span>
                  <span>{stats.likes_count}</span>
                </div>

                <div className={`
                  flex items-center space-x-1
                  ${effectiveTheme === 'dark'
                    ? 'text-gray-400'
                    : effectiveTheme === 'day'
                      ? 'text-green-600'
                      : 'text-gray-600'
                  }
                `}>
                  <span>💬</span>
                  <span>{stats.comments_count}</span>
                </div>

                <div className={`
                  flex items-center space-x-1
                  ${effectiveTheme === 'dark'
                    ? 'text-gray-400'
                    : effectiveTheme === 'day'
                      ? 'text-green-600'
                      : 'text-gray-600'
                  }
                `}>
                  <span>👀</span>
                  <span>{stats.views_count}</span>
                </div>
              </div>
            )}
          </div>

          {/* 最後に読んだ日時（進行中の場合） */}
          {progress && !isCompleted && progress.readAt && (
            <div className={`
              mt-2 pt-2 border-t border-gray-200/30 dark:border-gray-700/30
              text-xs
              ${effectiveTheme === 'dark'
                ? 'text-gray-500'
                : effectiveTheme === 'day'
                  ? 'text-green-600'
                  : 'text-gray-500'
              }
            `}>
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
