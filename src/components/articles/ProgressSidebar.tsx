import React from 'react';
import { LearningStats } from '../../hooks/useArticleProgress';
import { LearningContent } from '../../types';

interface ProgressSidebarProps {
  stats: LearningStats;
  articleContents: LearningContent[];
  articleCategories: string[];
  isDemo: boolean;
  onRegisterClick?: () => void;
  getArticleProgress?: (articleSlug: string) => { completed: boolean } | null;
}

export const ProgressSidebar: React.FC<ProgressSidebarProps> = ({
  stats,
  articleContents,
  articleCategories,
  isDemo,
  onRegisterClick,
  getArticleProgress
}) => {
  return (
    <div className="space-y-6">
      {/* カテゴリー別進捗 */}
      <div className="p-5 rounded-xl border-2 backdrop-blur-sm shadow-lg bg-whiskyPapa-black-dark border-whiskyPapa-yellow/20 shadow-whiskyPapa-yellow/20">
        <h3 className="text-lg font-bold mb-4 flex items-center bg-gradient-to-r bg-clip-text text-transparent from-white to-gray-200">
          📚 カテゴリー別進捗
        </h3>

        <div className="space-y-3">
          {articleCategories.map((category) => {
            const categoryContents = articleContents.filter(content => content.category === category);
            const total = categoryContents.length;
            const read = categoryContents.filter((content) => {
              // デモモードの場合はランダムに完了状態を設定
              if (isDemo) {
                return Math.random() > 0.7; // 30%の確率で完了
              }
              // 実際の進捗データを参照
              if (getArticleProgress) {
                // content.idをslugとして使用（または適切なslugフィールドがあればそれを使用）
                const progress = getArticleProgress(content.id);
                return progress?.completed || false;
              }
              return false;
            }).length;
            const percentage = total > 0 ? Math.round((read / total) * 100) : 0;

            return (
              <div key={category}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-gray-300">
                    {category}
                  </span>
                  <span className="text-xs text-gray-400">
                    {read}/{total}
                  </span>
                </div>
                <div className="w-full h-2 rounded-full overflow-hidden bg-gray-700">
                  <div
                    className="h-full rounded-full transition-all duration-300 bg-blue-500"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <div className="text-right text-xs mt-1 text-gray-500">
                  {percentage}%
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* シリーズ別進捗 */}
      <div className="p-5 rounded-xl border-2 backdrop-blur-sm shadow-lg bg-whiskyPapa-black-dark border-whiskyPapa-yellow/20 shadow-whiskyPapa-yellow/20">
        <h3 className="text-lg font-bold mb-4 flex items-center bg-gradient-to-r bg-clip-text text-transparent from-white to-gray-200">
          📖 シリーズ別進捗
        </h3>

        <div className="space-y-3">
          {Object.entries(stats.seriesProgress).map(([series, progress]) => (
            <div key={series}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium truncate text-gray-300">
                  {series}
                </span>
                <span className="text-xs ml-2 text-gray-400">
                  {progress.read}/{progress.total}
                </span>
              </div>
              <div className="w-full h-2 rounded-full overflow-hidden bg-gray-700">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${
                    progress.percentage === 100 ? 'bg-green-500' : 'bg-yellow-500'
                  }`}
                  style={{ width: `${progress.percentage}%` }}
                />
              </div>
              <div className="flex items-center justify-between mt-1">
                <div className="text-xs text-gray-500">
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
      <div className="p-5 rounded-xl border-2 backdrop-blur-sm shadow-lg bg-whiskyPapa-black-dark border-whiskyPapa-yellow/20 shadow-whiskyPapa-yellow/20">
        <h3 className="text-lg font-bold mb-4 flex items-center bg-gradient-to-r bg-clip-text text-transparent from-white to-gray-200">
          🕒 最近の活動
        </h3>

        <div className="space-y-3">
          {stats.recentActivity.slice(0, 5).map((activity, index) => (
            <div
              key={`${activity.articleSlug}-${index}`}
              className="p-3 rounded-lg border backdrop-blur-sm transition-all duration-200 hover:scale-[1.02] bg-whiskyPapa-black-dark border-whiskyPapa-yellow/20 hover:bg-white/10"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <div className={`text-xs px-2 py-1 rounded-full ${
                    activity.completed
                      ? 'bg-green-900/50 text-green-400'
                      : 'bg-yellow-900/50 text-yellow-400'
                  }`}>
                    {activity.completed ? '完了' : '進行中'}
                  </div>
                  {activity.bookmarked && (
                    <div className="text-xs">🔖</div>
                  )}
                </div>
              </div>

              <div className="text-sm font-medium mb-1 truncate text-gray-200">
                記事: {activity.articleSlug.split('/').pop()?.replace(/[-_]/g, ' ')}
              </div>

              <div className="text-xs text-gray-500">
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
                      className={`text-xs ${
                        i < activity.rating! ? 'text-yellow-400' : 'text-gray-600'
                      }`}
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
        <div className="p-5 rounded-xl border-2 border-dashed backdrop-blur-sm transition-all duration-300 hover:scale-[1.02] hover:shadow-lg border-blue-500/60 bg-blue-900/30 hover:bg-blue-900/40">
          <div className="text-center">
            <div className="text-2xl mb-2">🚀</div>
            <h4 className="font-bold mb-2 text-white">
              もっと詳しい分析を見る
            </h4>
            <p className="text-sm mb-4 text-gray-300">
              登録すると、学習パターン分析、目標設定、詳細なレポートが利用できます
            </p>
            <button
              onClick={onRegisterClick}
              className="w-full py-3 px-4 rounded-lg font-medium text-sm transition-all duration-300 shadow-md hover:shadow-lg transform hover:scale-105 hover:-translate-y-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white"
            >
              無料で始める
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
