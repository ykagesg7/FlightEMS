import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { LearningStats } from '../../hooks/useArticleProgress';

interface ProgressSummaryHeaderProps {
  stats: LearningStats;
  isDemo: boolean;
  onRegisterClick: () => void;
}

export const ProgressSummaryHeader: React.FC<ProgressSummaryHeaderProps> = ({
  stats,
  isDemo,
  onRegisterClick
}) => {
  const { effectiveTheme } = useTheme();

  const progressPercentage = stats.totalArticles > 0
    ? Math.round((stats.completedArticles / stats.totalArticles) * 100)
    : 0;

  return (
    <div className={`
      relative overflow-hidden rounded-2xl p-6 mb-8 backdrop-blur-sm
      ${effectiveTheme === 'dark'
        ? 'hud-surface shadow-2xl shadow-red-900/20'
        : 'hud-surface shadow-2xl shadow-green-900/10'
      }
    `}>
      {/* デモ用オーバーレイ */}
      {isDemo && (
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-blue-500/10 pointer-events-none" />
      )}

      <div className="relative z-10">
        {/* ヘッダータイトル */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className={`
              text-2xl font-bold mb-2 bg-gradient-to-r bg-clip-text text-transparent
              ${effectiveTheme === 'dark'
                ? 'from-white to-gray-200'
                : 'from-[#39FF14] to-green-600'
              }
            `}>
              {isDemo ? '📊 学習進捗ダッシュボード（デモ）' : '📊 学習進捗ダッシュボード'}
            </h1>
            <p className={`
              text-sm
              ${effectiveTheme === 'dark'
                ? 'text-gray-300'
                : 'text-green-700'
              }
            `}>
              {isDemo
                ? '登録すると、あなたの実際の学習データが表示されます'
                : '継続的な学習でスキルアップを目指しましょう！'
              }
            </p>
          </div>

          {isDemo && (
            <button
              onClick={onRegisterClick}
              className={`
              px-6 py-3 rounded-xl font-medium text-sm transition-all duration-300
              shadow-lg hover:shadow-xl transform hover:scale-105 hover:-translate-y-1
              border backdrop-blur-sm
                ${effectiveTheme === 'dark'
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-500 hover:to-purple-500 border-blue-500/30'
                  : 'bg-gradient-to-r from-[#39FF14] to-green-600 text-white hover:from-green-500 hover:to-green-500 border-green-400/30'
                }
            `}
            >
              ✨ 無料で登録
            </button>
          )}
        </div>

        {/* メイン統計 */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-6">
          {/* 読了記事数 */}
          <div className={`
            p-3 sm:p-4 rounded-xl backdrop-blur-sm
            ${effectiveTheme === 'dark'
              ? 'hud-surface'
              : 'hud-surface'
            }
          `}>
            <div className="text-center">
              <div className={`
                text-2xl font-bold mb-1
                ${effectiveTheme === 'dark'
                  ? 'text-blue-400'
                  : 'text-[#39FF14]'
                }
              `}>
                {stats.completedArticles}
              </div>
              <div className={`
                text-xs font-medium
                ${effectiveTheme === 'dark'
                  ? 'text-gray-400'
                  : 'text-green-600'
                }
              `}>
                読了記事
              </div>
            </div>
          </div>

          {/* 学習時間 */}
          <div className={`
            p-3 sm:p-4 rounded-xl backdrop-blur-sm
            ${effectiveTheme === 'dark'
              ? 'hud-surface'
              : 'hud-surface'
            }
          `}>
            <div className="text-center">
              <div className={`
                text-2xl font-bold mb-1
                ${effectiveTheme === 'dark'
                  ? 'text-green-400'
                  : 'text-[#39FF14]'
                }
              `}>
                {Math.floor(stats.totalReadingTime / 60)}h
              </div>
              <div className={`
                text-xs font-medium
                ${effectiveTheme === 'dark'
                  ? 'text-gray-400'
                  : 'text-green-600'
                }
              `}>
                学習時間
              </div>
            </div>
          </div>

          {/* 連続日数 */}
          <div className={`
            p-3 sm:p-4 rounded-xl backdrop-blur-sm
            ${effectiveTheme === 'dark'
              ? 'hud-surface'
              : 'hud-surface'
            }
          `}>
            <div className="text-center">
              <div className={`
                text-2xl font-bold mb-1
                ${effectiveTheme === 'dark'
                  ? 'text-yellow-400'
                  : 'text-[#39FF14]'
                }
              `}>
                {stats.streakDays}
              </div>
              <div className={`
                text-xs font-medium
                ${effectiveTheme === 'dark'
                  ? 'text-gray-400'
                  : 'text-green-600'
                }
              `}>
                連続日数
              </div>
            </div>
          </div>

          {/* 平均評価 */}
          <div className={`
            p-3 sm:p-4 rounded-xl backdrop-blur-sm
            ${effectiveTheme === 'dark'
              ? 'hud-surface'
              : 'hud-surface'
            }
          `}>
            <div className="text-center">
              <div className={`
                text-2xl font-bold mb-1
                ${effectiveTheme === 'dark'
                  ? 'text-purple-400'
                  : 'text-[#39FF14]'
                }
              `}>
                {stats.averageRating > 0 ? stats.averageRating.toFixed(1) : '—'}
              </div>
              <div className={`
                text-xs font-medium
                ${effectiveTheme === 'dark'
                  ? 'text-gray-400'
                  : 'text-green-600'
                }
              `}>
                平均評価
              </div>
            </div>
          </div>
        </div>

        {/* 進捗バー */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className={`
              text-sm font-medium
              ${effectiveTheme === 'dark'
                ? 'text-gray-300'
                : 'text-green-700'
              }
            `}>
              全体の進捗
            </span>
            <span className={`
              text-sm font-bold
              ${effectiveTheme === 'dark'
                ? 'text-white'
                : 'text-[#39FF14]'
              }
            `}>
              {progressPercentage}% ({stats.completedArticles}/{stats.totalArticles})
            </span>
          </div>
          <div className={`
            w-full h-3 rounded-full overflow-hidden
            ${effectiveTheme === 'dark'
              ? 'bg-gray-700'
              : 'bg-green-200'
            }
          `}>
            <div
              className={`
                h-full rounded-full transition-all duration-500 ease-out
                ${effectiveTheme === 'dark'
                  ? 'bg-gradient-to-r from-blue-500 to-purple-500'
                  : 'bg-gradient-to-r from-[#39FF14] to-green-500'
                }
              `}
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>

        {/* 今日の目標 */}
        <div className={`
          flex items-center justify-between p-3 rounded-xl
          ${effectiveTheme === 'dark'
            ? 'hud-surface'
            : 'hud-surface'
          }
        `}>
          <div className="flex items-center space-x-3">
            <div className={`
              text-lg
              ${stats.readingGoals.achieved ? '🎯' : '📖'}
            `}>
            </div>
            <div>
              <div className={`
                text-sm font-medium
                ${effectiveTheme === 'dark'
                  ? 'text-white'
                  : 'text-[#39FF14]'
                }
              `}>
                今日の目標: {stats.readingGoals.daily}記事
              </div>
              <div className={`
                text-xs
                ${effectiveTheme === 'dark'
                  ? 'text-gray-400'
                  : 'text-green-600'
                }
              `}>
                {stats.readingGoals.achieved ? '目標達成！' : '継続して学習しましょう'}
              </div>
            </div>
          </div>

          {stats.readingGoals.achieved && (
            <div className={`
              px-3 py-1 rounded-full text-xs font-medium
              ${effectiveTheme === 'dark'
                ? 'hud-surface text-[color:var(--hud-primary)]'
                : 'hud-surface text-[#39FF14]'
              }
            `}>
              達成済み ✨
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
