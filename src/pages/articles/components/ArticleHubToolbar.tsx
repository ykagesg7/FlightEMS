import React, { useEffect, useRef, useState } from 'react';
import {
  ARTICLE_HUB_TAB_LABELS,
  type ArticleHubSort,
  type ArticleHubState,
  type ArticleHubTab,
} from '../articleHubFilters';

interface ArticleHubToolbarProps {
  state: ArticleHubState;
  visibleTabs: ArticleHubTab[];
  tabCounts: Partial<Record<ArticleHubTab, number>>;
  onQueryChange: (query: string) => void;
  onTabChange: (tab: ArticleHubTab) => void;
  onSortChange: (sort: ArticleHubSort) => void;
  onOpenFilters: () => void;
  activeFilterCount: number;
}

const SORT_OPTIONS: { value: ArticleHubSort; label: string }[] = [
  { value: 'date', label: '日付順' },
  { value: 'title', label: 'タイトル順' },
  { value: 'readingTime', label: '読了時間順' },
  { value: 'series', label: 'シリーズ順' },
];

export const ArticleHubToolbar: React.FC<ArticleHubToolbarProps> = ({
  state,
  visibleTabs,
  tabCounts,
  onQueryChange,
  onTabChange,
  onSortChange,
  onOpenFilters,
  activeFilterCount,
}) => {
  const [localQuery, setLocalQuery] = useState(state.query);
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);

  useEffect(() => {
    setLocalQuery(state.query);
  }, [state.query]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      if (localQuery !== state.query) {
        onQueryChange(localQuery);
      }
    }, 280);
    return () => window.clearTimeout(timer);
  }, [localQuery, onQueryChange, state.query]);

  const moveTab = (index: number, direction: 1 | -1) => {
    const nextIndex = (index + direction + visibleTabs.length) % visibleTabs.length;
    onTabChange(visibleTabs[nextIndex]);
    tabRefs.current[nextIndex]?.focus();
  };

  return (
    <div className="mb-6 space-y-4">
      <div className="relative">
        <label htmlFor="article-hub-search" className="sr-only">
          記事を検索
        </label>
        <input
          id="article-hub-search"
          type="search"
          value={localQuery}
          onChange={(e) => setLocalQuery(e.target.value)}
          placeholder="タイトル・タグ・シリーズで検索…"
          className="w-full rounded-lg border border-brand-primary/30 bg-brand-secondary-dark px-4 py-3 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/20"
        />
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2" role="tablist" aria-label="記事カテゴリ">
          {visibleTabs.map((tab, index) => {
            const isActive = state.tab === tab;
            const count = tabCounts[tab];
            const panelId = `article-hub-panel-${tab}`;
            return (
              <button
                key={tab}
                type="button"
                role="tab"
                id={`article-hub-tab-${tab}`}
                aria-selected={isActive}
                aria-controls={panelId}
                tabIndex={isActive ? 0 : -1}
                ref={(el) => {
                  tabRefs.current[index] = el;
                }}
                onClick={() => onTabChange(tab)}
                onKeyDown={(e) => {
                  if (e.key === 'ArrowRight') {
                    e.preventDefault();
                    moveTab(index, 1);
                  } else if (e.key === 'ArrowLeft') {
                    e.preventDefault();
                    moveTab(index, -1);
                  }
                }}
                className={`rounded-lg px-4 py-2 text-sm font-medium motion-safe:transition-all ${
                  isActive
                    ? 'bg-brand-primary text-[var(--bg)] shadow-lg'
                    : 'border border-brand-primary/25 text-[var(--text-primary)] hover:bg-brand-primary/10'
                }`}
              >
                {ARTICLE_HUB_TAB_LABELS[tab]}
                {count !== undefined ? ` (${count})` : ''}
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-2">
          <label htmlFor="article-hub-sort" className="sr-only">
            並び替え
          </label>
          <select
            id="article-hub-sort"
            value={state.sort}
            onChange={(e) => onSortChange(e.target.value as ArticleHubSort)}
            className="rounded-lg border border-brand-primary/30 bg-brand-secondary-dark px-3 py-2 text-sm text-[var(--text-primary)] focus:border-brand-primary focus:outline-none"
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={onOpenFilters}
            className="rounded-lg border border-brand-primary/30 px-3 py-2 text-sm font-medium text-brand-primary hover:bg-brand-primary/10"
          >
            詳細フィルタ
            {activeFilterCount > 0 ? ` (${activeFilterCount})` : ''}
          </button>
        </div>
      </div>
    </div>
  );
};
