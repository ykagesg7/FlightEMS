import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { LearningContent } from '../../types';
import { ArticleMeta } from '../../types/articles';

interface OptimizedSearchResultsProps {
  results: Array<{ content: LearningContent; meta: ArticleMeta }>;
  isLoading: boolean;
  searchQuery: string;
  onLoadMore: () => void;
  hasMore: boolean;
}

interface SearchResultItemProps {
  content: LearningContent;
  meta: ArticleMeta;
  index: number;
  isVisible: boolean;
}

// 仮想スクロール用のアイテムコンポーネント
const SearchResultItem: React.FC<SearchResultItemProps> = React.memo(({
  content,
  meta,
  index,
  isVisible
}) => {
  if (!isVisible) {
    return (
      <div className="h-32 bg-transparent" />
    );
  }

  return (
    <div className="p-4 rounded-lg border backdrop-blur-sm transition-all duration-200 hover:scale-[1.02] hud-surface border-gray-300 hover:bg-white/10">
      {/* 記事ヘッダー */}
      <div className="flex items-start justify-between mb-2">
        <h3 className="text-lg font-semibold line-clamp-2 text-gray-900">
          {content.title}
        </h3>
        <div className="text-xs px-2 py-1 rounded-md bg-gray-100 text-gray-600">
          {content.category}
        </div>
      </div>

      {/* 記事説明 */}
      <p className="text-sm mb-3 line-clamp-3 text-gray-600">
        {content.description || meta.excerpt}
      </p>

      {/* メタ情報 */}
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center space-x-4">
          <span className="flex items-center space-x-1 text-gray-500">
            <span>⏱️</span>
            <span>{meta.readingTime || 10}分</span>
          </span>
          <span className="flex items-center space-x-1 text-gray-500">
            <span>📅</span>
            <span>{new Date(content.created_at || '').toLocaleDateString('ja-JP')}</span>
          </span>
        </div>

        {/* タグ */}
        <div className="flex items-center space-x-1">
          {meta.tags.slice(0, 2).map((tag, tagIndex) => (
            <span
              key={tagIndex}
              className="px-2 py-1 rounded-md text-xs bg-gray-100 text-gray-600"
            >
              {tag}
            </span>
          ))}
          {meta.tags.length > 2 && (
            <span className="text-xs text-gray-500">
              +{meta.tags.length - 2}
            </span>
          )}
        </div>
      </div>
    </div>
  );
});

SearchResultItem.displayName = 'SearchResultItem';

// 仮想スクロール用のフック
const useVirtualScroll = (items: any[], itemHeight: number = 128) => {
  const [scrollTop, setScrollTop] = useState(0);
  const [containerHeight, setContainerHeight] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const visibleItems = useMemo(() => {
    const startIndex = Math.floor(scrollTop / itemHeight);
    const endIndex = Math.min(
      startIndex + Math.ceil(containerHeight / itemHeight) + 1,
      items.length
    );

    return items.slice(startIndex, endIndex).map((item, index) => ({
      ...item,
      index: startIndex + index,
      isVisible: true
    }));
  }, [scrollTop, containerHeight, itemHeight, items]);

  const totalHeight = items.length * itemHeight;

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  }, []);

  useEffect(() => {
    if (containerRef.current) {
      setContainerHeight(containerRef.current.clientHeight);
    }
  }, []);

  return {
    containerRef,
    visibleItems,
    totalHeight,
    handleScroll
  };
};

// メインの検索結果コンポーネント
const OptimizedSearchResults: React.FC<OptimizedSearchResultsProps> = ({
  results,
  isLoading,
  searchQuery,
  onLoadMore,
  hasMore
}) => {
  const [searchIntent, setSearchIntent] = useState<string>('');
  const { containerRef, visibleItems, totalHeight, handleScroll } = useVirtualScroll(results);

  // 検索意図の分析
  const analyzeSearchIntent = useCallback((query: string) => {
    const normalizedQuery = query.toLowerCase();

    if (normalizedQuery.includes('やり方') || normalizedQuery.includes('方法')) {
      return 'チュートリアル系の記事を探しています';
    } else if (normalizedQuery.includes('とは') || normalizedQuery.includes('概念')) {
      return '概念・理論系の記事を探しています';
    } else if (normalizedQuery.includes('違い') || normalizedQuery.includes('比較')) {
      return '比較・対比系の記事を探しています';
    } else if (normalizedQuery.includes('問題') || normalizedQuery.includes('解決')) {
      return '問題解決系の記事を探しています';
    } else {
      return '関連記事を探しています';
    }
  }, []);

  useEffect(() => {
    if (searchQuery) {
      setSearchIntent(analyzeSearchIntent(searchQuery));
    }
  }, [searchQuery, analyzeSearchIntent]);

  // 無限スクロールの実装
  const handleScrollToBottom = useCallback(() => {
    if (containerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
      if (scrollTop + clientHeight >= scrollHeight - 100 && hasMore && !isLoading) {
        onLoadMore();
      }
    }
  }, [hasMore, isLoading, onLoadMore]);

  useEffect(() => {
    const container = containerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScrollToBottom);
      return () => container.removeEventListener('scroll', handleScrollToBottom);
    }
  }, [handleScrollToBottom]);

  return (
    <div className="p-4 rounded-lg border backdrop-blur-sm hud-surface border-gray-300">
      {/* ヘッダー */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            🔍 検索結果
          </h3>
          {searchIntent && (
            <p className="text-sm text-gray-500">
              {searchIntent}
            </p>
          )}
        </div>
        <div className="text-sm text-gray-500">
          {results.length}件の記事
        </div>
      </div>

      {/* 検索結果一覧 */}
      <div
        ref={containerRef}
        className="max-h-96 overflow-y-auto space-y-3"
        onScroll={handleScroll}
      >
        <div style={{ height: totalHeight, position: 'relative' }}>
          {visibleItems.map((item) => (
            <div
              key={item.content.id}
              style={{
                position: 'absolute',
                top: item.index * 128,
                left: 0,
                right: 0,
                height: 128
              }}
            >
              <SearchResultItem
                content={item.content}
                meta={item.meta}
                index={item.index}
                isVisible={item.isVisible}
              />
            </div>
          ))}
        </div>
      </div>

      {/* ローディング状態 */}
      {isLoading && (
        <div className="flex items-center justify-center py-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
          <span className="ml-2 text-sm text-gray-500">
            検索中...
          </span>
        </div>
      )}

      {/* もっと見るボタン */}
      {hasMore && !isLoading && (
        <div className="text-center mt-4">
          <button
            onClick={onLoadMore}
            className="px-6 py-2 rounded-lg font-medium transition-colors bg-gray-200 text-gray-700 hover:bg-gray-300"
          >
            もっと見る
          </button>
        </div>
      )}

      {/* 結果がない場合 */}
      {results.length === 0 && !isLoading && (
        <div className="text-center py-8">
          <div className="text-4xl mb-2">🔍</div>
          <p className="text-lg text-gray-500">
            検索結果が見つかりませんでした
          </p>
          <p className="text-sm text-gray-400">
            別のキーワードで検索してみてください
          </p>
        </div>
      )}
    </div>
  );
};

export default OptimizedSearchResults;
