import React, { useMemo } from 'react';
import { LearningStats } from '../../../hooks/useArticleProgress';
import { LearningContent } from '../../../types';

interface ProgressSidebarProps {
  stats: LearningStats;
  articleContents: LearningContent[];
  articleCategories: string[];
  isDemo: boolean;
  onRegisterClick?: () => void;
  getArticleProgress?: (articleSlug: string) => { completed: boolean } | null;
  activeMainFilter?: string;
  subCategories?: string[];
}

export const ProgressSidebar: React.FC<ProgressSidebarProps> = ({
  stats,
  articleContents,
  articleCategories,
  isDemo,
  onRegisterClick,
  getArticleProgress,
  activeMainFilter = 'すべて',
  subCategories = []
}) => {
  // メインフィルター別の進捗計算
  const mainFilterProgress = useMemo(() => {
    const mainFilters: Record<string, string[]> = {
      'マインド': ['メンタリティー', '思考法'],
      '学科': ['CPL学科', 'PPL'],
      '操縦法': ['操縦']
    };

    const progress: Record<string, { read: number; total: number; percentage: number }> = {};

    // 各メインフィルターの進捗を計算
    Object.entries(mainFilters).forEach(([filter, categories]) => {
      const categoryContents = articleContents.filter(c => categories.includes(c.category));
      const total = categoryContents.length;
      const read = categoryContents.filter((content) => {
        // デモモードの場合、ランダムに完了状態を設定
        if (isDemo) {
          return Math.random() > 0.7; // 30%の確率で完了
        }
        // 実際の進捗データを参照
        if (getArticleProgress) {
          const progress = getArticleProgress(content.id);
          return progress?.completed || false;
        }
        return false;
      }).length;
      progress[filter] = {
        read,
        total,
        percentage: total > 0 ? Math.round((read / total) * 100) : 0
      };
    });

    // トータルの進捗を計算
    const totalRead = articleContents.filter((content) => {
      // デモモードの場合、ランダムに完了状態を設定
      if (isDemo) {
        return Math.random() > 0.7; // 30%の確率で完了
      }
      // 実際の進捗データを参照
      if (getArticleProgress) {
        const progress = getArticleProgress(content.id);
        return progress?.completed || false;
      }
      return false;
    }).length;
    progress['トータル'] = {
      read: totalRead,
      total: articleContents.length,
      percentage: articleContents.length > 0 ? Math.round((totalRead / articleContents.length) * 100) : 0
    };

    return progress;
  }, [articleContents, getArticleProgress, isDemo]);

  return (
    <div className="space-y-6">
      {/* カテゴリー別進捗 */}
      <div className="p-5 rounded-xl border-2 backdrop-blur-sm shadow-lg bg-whiskyPapa-black-dark border-whiskyPapa-yellow/20 shadow-whiskyPapa-yellow/20">
        <h3 className="text-lg font-bold mb-4 flex items-center bg-gradient-to-r bg-clip-text text-transparent from-whiskyPapa-yellow to-whiskyPapa-yellow/80">
          📚 カテゴリー別進捗
        </h3>

        <div className="space-y-4">
          {['マインド', '学科', '操縦法', 'トータル'].map((filter) => {
            const progress = mainFilterProgress[filter];
            if (!progress) return null;

            return (
              <div key={filter}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-whiskyPapa-yellow/90">
                    {filter}
                  </span>
                  <span className="text-xs text-gray-400">
                    {progress.read}/{progress.total}
                  </span>
                </div>
                <div className="w-full h-3 rounded-full overflow-hidden bg-whiskyPapa-black border border-whiskyPapa-yellow/30">
                  <div
                    className="h-full rounded-full transition-all duration-500 bg-gradient-to-r from-whiskyPapa-yellow to-whiskyPapa-yellow/80 shadow-lg shadow-whiskyPapa-yellow/50"
                    style={{ width: `${progress.percentage}%` }}
                  />
                </div>
                <div className="text-right text-xs mt-1 text-gray-400">
                  {progress.percentage}%
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* シリーズ別進捗（サブフィルター/カテゴリー別進捗） */}
      <div className="p-5 rounded-xl border-2 backdrop-blur-sm shadow-lg bg-whiskyPapa-black-dark border-[color:var(--hud-accent)]/20 shadow-[color:var(--hud-accent)]/20">
        <h3 className="text-lg font-bold mb-4 flex items-center bg-gradient-to-r bg-clip-text text-transparent from-[#39FF14] to-[#39FF14]/80">
          📖 カテゴリー別進捗
        </h3>

        <div className="space-y-4">
          {(() => {
            // 「すべて」選択時は全カテゴリー、それ以外は対応するサブカテゴリーを表示
            const categories = activeMainFilter === 'すべて' ? articleCategories : subCategories;

            return categories.map((category) => {
              const categoryContents = articleContents.filter(content => content.category === category);
              const total = categoryContents.length;
              const read = categoryContents.filter((content) => {
                // デモモードの場合、ランダムに完了状態を設定
                if (isDemo) {
                  return Math.random() > 0.7; // 30%の確率で完了
                }
                // 実際の進捗データを参照
                if (getArticleProgress) {
                  const progress = getArticleProgress(content.id);
                  return progress?.completed || false;
                }
                return false;
              }).length;
              const percentage = total > 0 ? Math.round((read / total) * 100) : 0;

              return (
                <div key={category}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-[#39FF14]/90">
                      {category}
                    </span>
                    <span className="text-xs text-gray-400">
                      {read}/{total}
                    </span>
                  </div>
                  <div className="w-full h-3 rounded-full overflow-hidden bg-whiskyPapa-black border border-[color:var(--hud-accent)]/30">
                    <div
                      className={`h-full rounded-full transition-all duration-500 bg-gradient-to-r shadow-lg ${
                        percentage === 100
                          ? 'from-[#39FF14] to-[#39FF14]/80 shadow-[#39FF14]/50'
                          : 'from-[#39FF14]/80 to-[#39FF14]/60 shadow-[#39FF14]/30'
                      }`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between mt-1">
                    <div className="text-xs text-gray-400">
                      {percentage}%
                    </div>
                    {percentage === 100 && (
                      <div className="text-xs text-[#39FF14]">
                        ✅
                      </div>
                    )}
                  </div>
                </div>
              );
            });
          })()}
        </div>
      </div>

      {/* 最近の活動 */}
      <div className="p-5 rounded-xl border-2 backdrop-blur-sm shadow-lg bg-whiskyPapa-black-dark border-whiskyPapa-yellow/20 shadow-whiskyPapa-yellow/20">
        <h3 className="text-lg font-bold mb-4 flex items-center bg-gradient-to-r bg-clip-text text-transparent from-whiskyPapa-yellow to-whiskyPapa-yellow/80">
          🕒 最近の活動
        </h3>

        <div className="space-y-3">
          {stats.recentActivity.slice(0, 5).map((activity, index) => (
            <div
              key={`${activity.articleSlug}-${index}`}
              className="p-3 rounded-lg border backdrop-blur-sm transition-all duration-200 hover:scale-[1.02] bg-whiskyPapa-black-dark border-whiskyPapa-yellow/20 hover:border-whiskyPapa-yellow/40 hover:bg-whiskyPapa-black/50"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <div className={`text-xs px-2 py-1 rounded-full ${activity.completed
                      ? 'bg-[#39FF14]/20 text-[#39FF14] border border-[color:var(--hud-accent)]/30'
                      : 'bg-whiskyPapa-yellow/20 text-whiskyPapa-yellow border border-whiskyPapa-yellow/30'
                    }`}>
                    {activity.completed ? '完了' : '進行中'}
                  </div>
                  {activity.bookmarked && (
                    <div className="text-xs text-whiskyPapa-yellow">🔖</div>
                  )}
                </div>
              </div>

              <div className="text-sm font-medium mb-1 truncate text-gray-200">
                記事: {activity.articleSlug.split('/').pop()?.replace(/[-_]/g, ' ')}
              </div>

              <div className="text-xs text-gray-400">
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
                      className={`text-xs ${i < activity.rating! ? 'text-whiskyPapa-yellow' : 'text-gray-600'
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

      {/* デモ用登録誘導 */}
      {isDemo && onRegisterClick && (
        <div className="p-5 rounded-xl border-2 border-dashed backdrop-blur-sm transition-all duration-300 hover:scale-[1.02] hover:shadow-lg border-whiskyPapa-yellow/60 bg-whiskyPapa-black-dark hover:bg-whiskyPapa-black/50">
          <div className="text-center">
            <div className="text-2xl mb-2">🚀</div>
            <h4 className="font-bold mb-2 text-whiskyPapa-yellow">
              もっと詳しい分析を見る
            </h4>
            <p className="text-sm mb-4 text-gray-300">
              登録すると、学習パターン分析、目標設定、詳細なレポートが利用できます。
            </p>
            <button
              onClick={onRegisterClick}
              className="w-full py-3 px-4 rounded-lg font-medium text-sm transition-all duration-300 shadow-md hover:shadow-lg transform hover:scale-105 hover:-translate-y-1 bg-gradient-to-r from-whiskyPapa-yellow to-whiskyPapa-yellow/80 hover:from-whiskyPapa-yellow/90 hover:to-whiskyPapa-yellow/70 text-whiskyPapa-black"
            >
              無料で始める
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
