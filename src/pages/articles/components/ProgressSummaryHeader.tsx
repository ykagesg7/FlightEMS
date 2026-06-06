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
    <div className="relative mb-8 overflow-hidden rounded-xl border-2 border-brand-primary/20 bg-brand-secondary-dark p-6 shadow-lg shadow-brand-primary/20 backdrop-blur-sm">
      {/* デモ用オーバーレイ */}
      {isDemo && (
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-blue-500/10 pointer-events-none" />
      )}

      <div className="relative z-10">
        {/* ヘッダータイトル */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold mb-2 bg-gradient-to-r bg-clip-text text-transparent from-white to-gray-200">
              {isDemo ? '📊 学習進捗ダッシュボード（デモ）' : '📊 学習進捗ダッシュボード'}
            </h1>
            <p className="text-sm text-gray-300">
              {isDemo
                ? '登録すると、あなたの実際の学習データが表示されます。'
                : '継続的な学習でスキルアップを目指しましょう。'
              }
            </p>
          </div>

          {isDemo && (
            <button
              onClick={onRegisterClick}
              className="px-6 py-3 rounded-xl font-medium text-sm transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 hover:-translate-y-1 border backdrop-blur-sm bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-500 hover:to-purple-500 border-blue-500/30"
            >
              ✨ 無料で登録
            </button>
          )}
        </div>

        {/* メイン統計 */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4 mb-6">
          {/* 読了記事数 */}
          <div className="rounded-xl border-2 border-brand-primary/20 bg-brand-secondary-dark p-3 shadow-lg shadow-brand-primary/20 backdrop-blur-sm sm:p-4">
            <div className="text-center">
              <div className="text-2xl font-bold mb-1 text-blue-400">
                {stats.completedArticles}
              </div>
              <div className="text-xs font-medium text-gray-400">
                読了記事
              </div>
            </div>
          </div>

          {/* 完了ミッション数 */}
          <div className="rounded-xl border-2 border-brand-primary/20 bg-brand-secondary-dark p-3 shadow-lg shadow-brand-primary/20 backdrop-blur-sm sm:p-4">
            <div className="text-center">
              <div className="text-2xl font-bold mb-1 text-green-400">
                {stats.completedMissions}
              </div>
              <div className="text-xs font-medium text-gray-400">
                完了ミッション
              </div>
            </div>
          </div>

          {/* ランクアップ進捗 */}
          <div className="rounded-xl border-2 border-brand-primary/20 bg-brand-secondary-dark p-3 shadow-lg shadow-brand-primary/20 backdrop-blur-sm sm:p-4">
            <div className="text-center">
              <div className="text-2xl font-bold mb-1 text-yellow-400">
                {Math.round(stats.rankProgress)}%
              </div>
              <div className="text-xs font-medium text-gray-400">
                ランクアップ進捗
              </div>
              {/* 進捗バー */}
              <div className="w-full h-1.5 rounded-full overflow-hidden bg-gray-700 mt-2">
                <div
                  className="h-full rounded-full transition-all duration-500 ease-out bg-gradient-to-r from-yellow-500 to-yellow-400"
                  style={{ width: `${Math.min(100, Math.max(0, stats.rankProgress))}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* 進捗バー */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-300">
              全体の進捗
            </span>
            <span className="text-sm font-bold text-white">
              {progressPercentage}% ({stats.completedArticles}/{stats.totalArticles})
            </span>
          </div>
          <div className="w-full h-3 rounded-full overflow-hidden bg-gray-700">
            <div
              className="h-full rounded-full transition-all duration-500 ease-out bg-gradient-to-r from-blue-500 to-purple-500"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>

        {/* 今日の目標 */}
        <div className="flex items-center justify-between rounded-xl bg-[var(--bg)] p-3">
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
