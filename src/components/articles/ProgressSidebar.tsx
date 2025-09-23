import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { LearningStats } from '../../hooks/useArticleProgress';

interface ProgressSidebarProps {
  stats: LearningStats;
  isDemo: boolean;
  onRegisterClick?: () => void;
}

export const ProgressSidebar: React.FC<ProgressSidebarProps> = ({
  stats,
  isDemo,
  onRegisterClick
}) => {
  const { effectiveTheme } = useTheme();

  return (
    <div className="space-y-6">
      {/* カテゴリー別進捗 */}
      <div className={`
        p-5 rounded-xl border-2 backdrop-blur-sm shadow-lg
        ${effectiveTheme === 'dark'
          ? 'hud-surface border-red-500/60 shadow-red-900/20'
          : 'hud-surface border-green-500/50 shadow-green-900/10'
        }
      `}>
        <h3 className={`
          text-lg font-bold mb-4 flex items-center bg-gradient-to-r bg-clip-text text-transparent
          ${effectiveTheme === 'dark'
            ? 'from-white to-gray-200'
            : 'from-[#39FF14] to-green-600'
          }
        `}>
          📚 カテゴリー別進捗
        </h3>

        <div className="space-y-3">
          {Object.entries(stats.categoriesProgress).map(([category, progress]) => (
            <div key={category}>
              <div className="flex items-center justify-between mb-1">
                <span className={`
                  text-sm font-medium
                  ${effectiveTheme === 'dark'
                    ? 'text-gray-300'
                    : 'text-green-700'
                  }
                `}>
                  {category}
                </span>
                <span className={`
                  text-xs
                  ${effectiveTheme === 'dark'
                    ? 'text-gray-400'
                    : 'text-green-600'
                  }
                `}>
                  {progress.read}/{progress.total}
                </span>
              </div>
              <div className={`
                w-full h-2 rounded-full overflow-hidden
                ${effectiveTheme === 'dark'
                  ? 'bg-gray-700'
                  : 'bg-green-200'
                }
              `}>
                <div
                  className={`
                    h-full rounded-full transition-all duration-300
                    ${effectiveTheme === 'dark'
                      ? 'bg-blue-500'
                      : 'bg-[#39FF14]'
                    }
                  `}
                  style={{ width: `${progress.percentage}%` }}
                />
              </div>
              <div className={`
                text-right text-xs mt-1
                ${effectiveTheme === 'dark'
                  ? 'text-gray-500'
                  : effectiveTheme === 'day'
                    ? 'text-green-600'
                    : 'text-gray-500'
                }
              `}>
                {progress.percentage}%
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* シリーズ別進捗 */}
      <div className={`
        p-5 rounded-xl border-2 backdrop-blur-sm shadow-lg
        ${effectiveTheme === 'dark'
          ? 'hud-surface border-red-500/60 shadow-red-900/20'
          : 'hud-surface border-green-500/50 shadow-green-900/10'
        }
      `}>
        <h3 className={`
          text-lg font-bold mb-4 flex items-center bg-gradient-to-r bg-clip-text text-transparent
          ${effectiveTheme === 'dark'
            ? 'from-white to-gray-200'
            : 'from-[#39FF14] to-green-600'
          }
        `}>
          📖 シリーズ別進捗
        </h3>

        <div className="space-y-3">
          {Object.entries(stats.seriesProgress).map(([series, progress]) => (
            <div key={series}>
              <div className="flex items-center justify-between mb-1">
                <span className={`
                  text-sm font-medium truncate
                  ${effectiveTheme === 'dark'
                    ? 'text-gray-300'
                    : 'text-green-700'
                  }
                `}>
                  {series}
                </span>
                <span className={`
                  text-xs ml-2
                  ${effectiveTheme === 'dark'
                    ? 'text-gray-400'
                    : 'text-green-600'
                  }
                `}>
                  {progress.read}/{progress.total}
                </span>
              </div>
              <div className={`
                w-full h-2 rounded-full overflow-hidden
                ${effectiveTheme === 'dark'
                  ? 'bg-gray-700'
                  : 'bg-green-200'
                }
              `}>
                <div
                  className={`
                    h-full rounded-full transition-all duration-300
                    ${progress.percentage === 100
                      ? effectiveTheme === 'dark'
                        ? 'bg-green-500'
                        : effectiveTheme === 'day'
                          ? 'bg-[#39FF14]'
                          : 'bg-green-500'
                      : effectiveTheme === 'dark'
                        ? 'bg-yellow-500'
                        : effectiveTheme === 'day'
                          ? 'bg-yellow-600'
                          : 'bg-yellow-500'
                    }
                  `}
                  style={{ width: `${progress.percentage}%` }}
                />
              </div>
              <div className="flex items-center justify-between mt-1">
                <div className={`
                  text-xs
                  ${effectiveTheme === 'dark'
                    ? 'text-gray-500'
                    : effectiveTheme === 'day'
                      ? 'text-green-600'
                      : 'text-gray-500'
                  }
                `}>
                  {progress.percentage}%
                </div>
                {progress.percentage === 100 && (
                  <div className="text-xs">
                    ✅
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 最近の活動 */}
      <div className={`
        p-5 rounded-xl border-2 backdrop-blur-sm shadow-lg
        ${effectiveTheme === 'dark'
          ? 'hud-surface border-red-500/60 shadow-red-900/20'
          : 'hud-surface border-green-500/50 shadow-green-900/10'
        }
      `}>
        <h3 className={`
          text-lg font-bold mb-4 flex items-center bg-gradient-to-r bg-clip-text text-transparent
          ${effectiveTheme === 'dark'
            ? 'from-white to-gray-200'
            : 'from-[#39FF14] to-green-600'
          }
        `}>
          🕒 最近の活動
        </h3>

        <div className="space-y-3">
          {stats.recentActivity.slice(0, 5).map((activity, index) => (
            <div
              key={`${activity.articleSlug}-${index}`}
              className={`
                p-3 rounded-lg border backdrop-blur-sm transition-all duration-200 hover:scale-[1.02]
                ${effectiveTheme === 'dark'
                  ? 'hud-surface hover:bg-white/10'
                  : 'hud-surface hover:bg-white/10'
                }
              `}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <div className={`
                    text-xs px-2 py-1 rounded-full
                    ${activity.completed
                      ? effectiveTheme === 'dark'
                        ? 'bg-green-900/50 text-green-400'
                        : effectiveTheme === 'day'
                          ? 'bg-green-100 text-[color:var(--hud-primary)]'
                          : 'bg-green-100 text-green-700'
                      : effectiveTheme === 'dark'
                        ? 'bg-yellow-900/50 text-yellow-400'
                        : effectiveTheme === 'day'
                          ? 'bg-yellow-100 text-yellow-700'
                          : 'bg-yellow-100 text-yellow-700'
                    }
                  `}>
                    {activity.completed ? '完了' : '進行中'}
                  </div>
                  {activity.bookmarked && (
                    <div className="text-xs">🔖</div>
                  )}
                </div>
                <div className={`
                  text-xs
                  ${effectiveTheme === 'dark'
                    ? 'text-gray-400'
                    : 'text-green-600'
                  }
                `}>
                  {Math.round(activity.readingTime / 60)}分
                </div>
              </div>

              <div className={`
                text-sm font-medium mb-1 truncate
                ${effectiveTheme === 'dark'
                  ? 'text-gray-200'
                  : effectiveTheme === 'day'
                    ? 'text-green-800'
                    : 'text-gray-800'
                }
              `}>
                記事: {activity.articleSlug.split('/').pop()?.replace(/[-_]/g, ' ')}
              </div>

              <div className={`
                text-xs
                ${effectiveTheme === 'dark'
                  ? 'text-gray-500'
                  : effectiveTheme === 'day'
                    ? 'text-green-600'
                    : 'text-gray-500'
                }
              `}>
                {new Date(activity.readAt).toLocaleDateString('ja-JP', {
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </div>

              {activity.rating && (
                <div className="flex items-center mt-2 space-x-1">
                  {[...Array(5)].map((_, i) => (
                    <span
                      key={i}
                      className={`
                        text-xs
                        ${i < activity.rating!
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
          ))}
        </div>
      </div>

      {/* デモ用登録促進 */}
      {isDemo && onRegisterClick && (
        <div className={`
          p-5 rounded-xl border-2 border-dashed backdrop-blur-sm
          transition-all duration-300 hover:scale-[1.02] hover:shadow-lg
          ${effectiveTheme === 'dark'
            ? 'border-blue-500/60 bg-blue-900/30 hover:bg-blue-900/40'
            : 'hud-surface hover:bg-white/10'
          }
        `}>
          <div className="text-center">
            <div className="text-2xl mb-2">🚀</div>
            <h4 className={`
              font-bold mb-2
              ${effectiveTheme === 'dark'
                ? 'text-white'
                : 'hud-text'
              }
            `}>
              もっと詳しい分析を見る
            </h4>
            <p className={`
              text-sm mb-4
              ${effectiveTheme === 'dark'
                ? 'text-gray-300'
                : 'text-[color:var(--text-primary)]'
              }
            `}>
              登録すると、学習パターン分析、目標設定、詳細なレポートが利用できます
            </p>
            <button
              onClick={onRegisterClick}
              className={`
                w-full py-3 px-4 rounded-lg font-medium text-sm transition-all duration-300
                shadow-md hover:shadow-lg transform hover:scale-105 hover:-translate-y-1
                ${effectiveTheme === 'dark'
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white'
                  : 'hud-surface hud-text hover:bg-white/10'
                }
              `}
            >
              無料で始める
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
