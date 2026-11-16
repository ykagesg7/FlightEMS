import React, { useMemo, useRef } from 'react';
import type { ArticleHubView } from '../articleHubFilters';
import { handleArticleHubTablistKeyDown } from '../articleHubTablistKeyboard';
import { useArticleHubTablistFocus } from '../useArticleHubTablistFocus';

export const ARTICLE_HUB_VIEW_TAB_IDS = {
  courses: 'article-hub-view-tab-courses',
  articles: 'article-hub-view-tab-articles',
} as const;

export const ARTICLE_HUB_VIEW_PANEL_IDS = {
  courses: 'article-hub-view-panel-courses',
  articles: 'article-hub-view-panel-articles',
} as const;

const VIEW_TABS: { view: ArticleHubView; label: string }[] = [
  { view: 'courses', label: 'コース一覧' },
  { view: 'articles', label: 'すべての記事' },
];

interface ArticleHubViewTabsProps {
  activeView: ArticleHubView;
  onViewChange: (view: ArticleHubView) => void;
}

export const ArticleHubViewTabs: React.FC<ArticleHubViewTabsProps> = ({
  activeView,
  onViewChange,
}) => {
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const activeIndex = useMemo(
    () => VIEW_TABS.findIndex((entry) => entry.view === activeView),
    [activeView],
  );
  const tabElementIds = useMemo(
    () => VIEW_TABS.map((entry) => ARTICLE_HUB_VIEW_TAB_IDS[entry.view]),
    [],
  );
  const { scheduleFocus } = useArticleHubTablistFocus(tabRefs, activeIndex, tabElementIds);

  return (
    <div className="mb-4 flex flex-wrap gap-2" role="tablist" aria-label="記事ハブ表示">
      {VIEW_TABS.map(({ view, label }, index) => {
        const isActive = activeView === view;
        const tabId = ARTICLE_HUB_VIEW_TAB_IDS[view];
        const panelId = ARTICLE_HUB_VIEW_PANEL_IDS[view];
        return (
          <button
            key={view}
            type="button"
            role="tab"
            id={tabId}
            aria-selected={isActive}
            aria-controls={panelId}
            tabIndex={isActive ? 0 : -1}
            ref={(el) => {
              tabRefs.current[index] = el;
            }}
            onClick={() => onViewChange(view)}
            onKeyDown={(event) =>
              handleArticleHubTablistKeyDown(
                event,
                index,
                VIEW_TABS.length,
                (nextIndex) => onViewChange(VIEW_TABS[nextIndex].view),
                scheduleFocus,
              )
            }
            className={`rounded-lg px-4 py-2 text-sm font-medium ${
              isActive
                ? 'bg-brand-primary text-[var(--bg)]'
                : 'border border-brand-primary/25 text-[var(--text-primary)] hover:bg-brand-primary/10'
            }`}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
};