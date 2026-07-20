import React from 'react';
import { LearningStats } from '../../../hooks/useArticleProgress';

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
  const progressPercentage = stats.totalArticles > 0
    ? Math.round((stats.completedArticles / stats.totalArticles) * 100)
    : 0;

  return (
    <div className="relative mb-4 overflow-hidden rounded-xl border-2 border-brand-primary/20 bg-brand-secondary-dark p-4 shadow-lg shadow-brand-primary/20 backdrop-blur-sm sm:mb-8 sm:p-6">
      {/* デモ用オーバーレイ */}
      {isDemo && (
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-blue-500/10 pointer-events-none" />
      )}

      <div className="relative z-10">
        {/* ヘッダータイトル（モバイルは薄く） */}
        <div className="mb-3 flex items-center justify-between sm:mb-6">
          <div>
            <h1 className="mb-0.5 text-lg font-bold bg-gradient-to-r bg-clip-text text-transparent from-white to-gray-200 sm:mb-2 sm:text-2xl">
              {isDemo ? '📊 学習進捗（デモ）' : '📊 学習進捗'}
            </h1>
            <p className="hidden text-sm text-gray-300 sm:block">
              {isDemo
                ? '登録すると、あなたの実際の学習データが表示されます。'
                : '継続的な学習でスキルアップを目指しましょう。'
              }
            </p>
          </div>

          {isDemo && (
            <button
              onClick={onRegisterClick}
              className="px-3 py-2 rounded-xl font-medium text-xs transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 border backdrop-blur-sm bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-500 hover:to-purple-500 border-blue-500/30 sm:px-6 sm:py-3 sm:text-sm"
            >
              ✨ 無料で登録
            </button>
          )}
        </div>

        {/* メイン統計 */}
        <div className="mb-0 grid grid-cols-3 gap-2 sm:mb-6 sm:gap-4">
          <div className="rounded-xl border-2 border-brand-primary/20 bg-brand-secondary-dark p-2 shadow-lg shadow-brand-primary/20 backdrop-blur-sm sm:p-4">
            <div className="text-center">
              <div className="mb-0.5 text-xl font-bold text-blue-400 sm:mb-1 sm:text-2xl">
                {stats.completedArticles}
              </div>
              <div className="text-[10px] font-medium text-gray-400 sm:text-xs">
                読了記事
              </div>
            </div>
          </div>

          <div className="rounded-xl border-2 border-brand-primary/20 bg-brand-secondary-dark p-2 shadow-lg shadow-brand-primary/20 backdrop-blur-sm sm:p-4">
            <div className="text-center">
              <div className="mb-0.5 text-xl font-bold text-green-400 sm:mb-1 sm:text-2xl">
                {stats.completedMissions}
              </div>
              <div className="text-[10px] font-medium text-gray-400 sm:text-xs">
                完了ミッション
              </div>
            </div>
          </div>

          <div className="rounded-xl border-2 border-brand-primary/20 bg-brand-secondary-dark p-2 shadow-lg shadow-brand-primary/20 backdrop-blur-sm sm:p-4">
            <div className="text-center">
              <div className="mb-0.5 text-xl font-bold text-yellow-400 sm:mb-1 sm:text-2xl">
                {progressPercentage}%
              </div>
              <div className="text-[10px] font-medium text-gray-400 sm:text-xs">
                記事読了率
              </div>
              <div className="mt-1.5 hidden h-1.5 w-full overflow-hidden rounded-full bg-gray-700 sm:mt-2 sm:block">
                <div
                  className="h-full rounded-full transition-all duration-500 ease-out bg-gradient-to-r from-yellow-500 to-yellow-400"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* 全体進捗・今日の目標は sm+ のみ（モバイルではサイドバー/数値と二重にならないよう省略） */}
        <div className="mb-4 mt-6 hidden sm:block">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm font-medium text-gray-300">
              全体の進捗
            </span>
            <span className="text-sm font-bold text-white">
              {progressPercentage}% ({stats.completedArticles}/{stats.totalArticles})
            </span>
          </div>
          <div className="h-3 w-full overflow-hidden rounded-full bg-gray-700">
            <div
              className="h-full rounded-full transition-all duration-500 ease-out bg-gradient-to-r from-blue-500 to-purple-500"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>

        <div className="hidden items-center justify-between rounded-xl bg-[var(--bg)] p-3 sm:flex">
          <div className="flex items-center space-x-3">
            <div className={`text-lg ${stats.readingGoals.achieved ? '🎯' : '📖'}`}>
            </div>
            <div>
              <div className="text-sm font-medium text-white">
                今日の目標: {stats.readingGoals.daily}記事
              </div>
              <div className="text-xs text-gray-400">
                {stats.readingGoals.achieved ? '目標達成！' : '継続して学習しましょう。'}
              </div>
            </div>
          </div>

          {stats.readingGoals.achieved && (
            <div className="rounded-full bg-brand-primary/10 px-3 py-1 text-xs font-medium text-brand-primary">
              達成済み ✨
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
