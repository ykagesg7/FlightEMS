import React, { useState } from 'react';
import ProgressRing from '../../../components/common/ProgressRing';
import { useArticleProgress } from '../../../hooks/useArticleProgress';
import { useAuth } from '../../../hooks/useAuth';
import { useTableOfContents } from '../../../hooks/useTableOfContents';

interface TableOfContentsProps {
  /** 表示モード */
  mode?: 'sidebar' | 'drawer' | 'inline';
  /** 最大表示レベル */
  maxLevel?: number;
  /** コンパクト表示 */
  compact?: boolean;
  /** コンテンツID（進捗表示用） */
  contentId?: string;
}

const TableOfContents: React.FC<TableOfContentsProps> = ({
  mode = 'sidebar',
  maxLevel = 3,
  compact = false,
  contentId
}) => {
  const { tocItems, activeId, scrollToHeading, sectionProgress } = useTableOfContents();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const { updateArticleProgress } = useArticleProgress();
  const { user } = useAuth();

  // セクションベースの進捗を使用
  // 注意: totalSectionsは全見出し数、filteredItemsは表示される見出し数（maxLevelでフィルタ）
  // 進捗計算は全見出し数で行うが、表示はfilteredItemsの数も表示
  const progressPercentage = sectionProgress.percentage;
  const currentSections = sectionProgress.current;
  const totalSections = sectionProgress.total;
  const isCompleted = progressPercentage >= 100 || (totalSections > 0 && currentSections >= totalSections);

  // 進捗をSupabaseに保存（セクションベース、throttle付き）
  const lastSaveRef = React.useRef<{ percentage: number; timestamp: number }>({ percentage: 0, timestamp: 0 });

  // 完了時は即座に保存
  React.useEffect(() => {
    if (!user || !contentId || !isCompleted) {
      return;
    }

    // 完了状態の場合は即座に保存（遅延なし）
    updateArticleProgress(contentId, {
      scrollProgress: 100,
      completed: true,
      readAt: new Date()
    }).then(() => {
      lastSaveRef.current = { percentage: 100, timestamp: Date.now() };
    }).catch(error => {
      if (error?.message?.includes('Failed to fetch') ||
        error?.message?.includes('network') ||
        error?.message?.includes('ERR_FAILED') ||
        error?.code === 'ERR_FAILED') {
        return;
      }
      console.error('進捗保存エラー:', error);
    });
  }, [user, contentId, isCompleted, updateArticleProgress]);

  // 通常の進捗保存（完了時以外）
  React.useEffect(() => {
    // ページ遷移中やアンマウント時は保存しない
    if (!user || !contentId || totalSections === 0 || currentSections === 0 || isCompleted) {
      return;
    }

    const now = Date.now();
    const timeSinceLastSave = now - lastSaveRef.current.timestamp;
    const percentageChanged = Math.abs(progressPercentage - lastSaveRef.current.percentage) >= 5; // 5%以上の変化時のみ保存

    // 1秒以上経過しているか、5%以上の変化がある場合のみ保存
    if (timeSinceLastSave < 1000 && !percentageChanged) {
      return;
    }

    // ページがアンマウントされていないか確認
    let isMounted = true;
    let timeoutId: NodeJS.Timeout | null = null;

    // 少し遅延させて保存（ページ遷移時のリクエストを避ける）
    timeoutId = setTimeout(() => {
      if (!isMounted) return;

      updateArticleProgress(contentId, {
        scrollProgress: progressPercentage,
        completed: false,
        readAt: new Date()
      }).then(() => {
        if (isMounted) {
          lastSaveRef.current = { percentage: progressPercentage, timestamp: now };
        }
      }).catch(error => {
        // ネットワークエラーやページ遷移時のエラーは無視
        if (!isMounted) return;
        if (error?.message?.includes('Failed to fetch') ||
          error?.message?.includes('network') ||
          error?.message?.includes('ERR_FAILED') ||
          error?.code === 'ERR_FAILED') {
          return;
        }
        console.error('進捗保存エラー:', error);
      });
    }, 300); // 300ms遅延

    return () => {
      isMounted = false;
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [user, contentId, progressPercentage, isCompleted, currentSections, totalSections, updateArticleProgress]);

  // ページ遷移時に確実に進捗を保存
  React.useEffect(() => {
    if (!user || !contentId || progressPercentage === 0) {
      return;
    }

    const handleBeforeUnload = () => {
      // beforeunloadでは同期的な処理のみ可能
      // 非同期処理は実行されない可能性があるため、visibilitychangeで事前に保存
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        // ページが非表示になる前に進捗を保存
        updateArticleProgress(contentId, {
          scrollProgress: progressPercentage,
          completed: isCompleted,
          readAt: new Date()
        }).catch(error => {
          // エラーは無視（ネットワークエラーの可能性）
          if (error?.message?.includes('Failed to fetch') ||
            error?.message?.includes('network') ||
            error?.message?.includes('ERR_FAILED') ||
            error?.code === 'ERR_FAILED') {
            return;
          }
        });
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [user, contentId, progressPercentage, isCompleted, updateArticleProgress]);

  // 指定レベル以下の見出しのみフィルタ
  const filteredItems = tocItems.filter(item => item.level <= maxLevel);

  if (filteredItems.length === 0) {
    return null;
  }

  const renderTocItem = (item: typeof filteredItems[0], index: number) => {
    const isActive = activeId === item.id;
    const indentLevel = Math.max(0, item.level - 1); // h1を基準(0)とする

    return (
      <li key={`${item.id}-${index}`} className={`toc-item level-${item.level}`}>
        <button
          onClick={() => scrollToHeading(item.id)}
          className={`block w-full text-left py-1 px-2 rounded text-sm transition-all duration-200 ${isActive
            ? 'font-semibold text-whiskyPapa-yellow bg-indigo-900 bg-opacity-30'
            : 'text-white opacity-80 hover:opacity-100 hover:text-whiskyPapa-yellow'
            } ${compact ? 'py-0.5 text-xs' : ''}`}
          style={{
            marginLeft: `${indentLevel * (compact ? 8 : 12)}px`,
            borderLeft: isActive ? '2px solid #FFD700' : '2px solid transparent'
          }}
          title={item.text}
        >
          <span className={`block ${compact ? '' : 'leading-5'} ${item.text.length > 50 ? 'truncate' : ''}`}>
            {item.text}
          </span>
        </button>
      </li>
    );
  };

  const tocContent = (
    <nav className="toc-nav">
      <div className={`flex items-center gap-2 mb-3 ${compact ? 'mb-2' : ''}`}>
        <svg className="w-4 h-4 text-whiskyPapa-yellow" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
        </svg>
        <h3 className={`font-semibold text-white ${compact ? 'text-sm' : 'text-base'}`}>
          目次
        </h3>
        <span className={`text-xs text-white opacity-60 ${compact ? 'hidden' : ''}`}>
          ({totalSections > 0 ? totalSections : filteredItems.length})
        </span>
      </div>
      <ul className="space-y-1 max-h-96 overflow-y-auto">
        {filteredItems.map(renderTocItem)}
      </ul>

      {/* 進捗表示 */}
      {contentId && (
        <div className={`mt-4 pt-4 border-t border-whiskyPapa-yellow/20 ${compact ? 'mt-3 pt-3' : ''}`}>
          <div className="flex items-center gap-3">
            {/* 円形メーター */}
            <div className="relative flex-shrink-0">
              <ProgressRing
                size={compact ? 40 : 48}
                stroke={compact ? 3 : 4}
                progress={progressPercentage}
                animate={true}
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className={`font-bold ${compact ? 'text-xs' : 'text-sm'} ${isCompleted ? 'text-green-400' : progressPercentage >= 50 ? 'text-yellow-400' : 'text-blue-400'
                  }`}>
                  {progressPercentage}%
                </span>
              </div>
            </div>

            {/* パーセンテージ表示 */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <span className={`text-xs ${compact ? 'text-xs' : 'text-sm'} text-white opacity-80`}>
                  読了率
                </span>
                {totalSections > 0 && (
                  <span className={`text-xs ${compact ? 'text-xs' : 'text-sm'} text-white opacity-60`}>
                    {currentSections}/{totalSections}
                  </span>
                )}
                {isCompleted && (
                  <span className="text-xs text-green-400 ml-1">✓ 読了</span>
                )}
              </div>
              <div className="h-1.5 rounded-full overflow-hidden bg-gray-700">
                <div
                  className={`h-full transition-all duration-300 ease-out rounded-full ${isCompleted
                    ? 'bg-green-400'
                    : progressPercentage >= 50
                      ? 'bg-yellow-400'
                      : 'bg-blue-400'
                    }`}
                  style={{ width: `${Math.min(100, progressPercentage)}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </nav>
  );

  // サイドバーモード
  if (mode === 'sidebar') {
    return (
      <div className={`toc-sidebar sticky top-20 max-h-[calc(100vh-6rem)] overflow-hidden ${compact ? 'w-48' : 'w-64'}`}>
        <div className="p-4 rounded-lg border border-whiskyPapa-yellow/20 bg-whiskyPapa-black-dark transition-colors duration-200">
          {tocContent}
        </div>
      </div>
    );
  }

  // ドロワーモード
  if (mode === 'drawer') {
    return (
      <>
        {/* ドロワー開閉ボタン */}
        <button
          onClick={() => setIsDrawerOpen(!isDrawerOpen)}
          className="fixed top-20 right-4 z-50 p-2 rounded-full shadow-lg bg-whiskyPapa-black-dark text-white hover:bg-whiskyPapa-yellow/10 transition-all duration-200"
          title="目次を開く"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
          </svg>
        </button>

        {/* ドロワーオーバーレイ */}
        {isDrawerOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={() => setIsDrawerOpen(false)}
          />
        )}

        {/* ドロワーコンテンツ */}
        <div className={`fixed top-0 right-0 h-full w-80 z-50 transform transition-transform duration-300 ease-in-out ${isDrawerOpen ? 'translate-x-0' : 'translate-x-full'
          } bg-whiskyPapa-black-dark border-l border-whiskyPapa-yellow/20 shadow-xl`}>
          <div className="p-6 h-full overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-white">目次</h2>
              <button
                onClick={() => setIsDrawerOpen(false)}
                className="p-1 rounded hover:bg-whiskyPapa-black-light transition-colors duration-200"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            {tocContent}
          </div>
        </div>
      </>
    );
  }

  // インラインモード
  return (
    <div className="toc-inline mb-8 p-4 rounded-lg border border-whiskyPapa-yellow/20 bg-whiskyPapa-black-dark">
      {tocContent}
    </div>
  );
};

export default TableOfContents;
