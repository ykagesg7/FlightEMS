import React from 'react';
import {
  ARTICLE_HUB_TAB_LABELS,
  type ArticleHubState,
  type ArticleHubTab,
} from '../articleHubFilters';

interface ArticleActiveFilterChipsProps {
  state: ArticleHubState;
  onClearQuery: () => void;
  onClearTag: (tag: string) => void;
  onClearStatus: () => void;
  onClearTab: () => void;
}

const STATUS_LABELS = {
  all: 'すべて',
  'in-progress': '未読・進行中',
  completed: '読了済み',
} as const;

export const ArticleActiveFilterChips: React.FC<ArticleActiveFilterChipsProps> = ({
  state,
  onClearQuery,
  onClearTag,
  onClearStatus,
  onClearTab,
}) => {
  const chips: { key: string; label: string; onRemove: () => void }[] = [];

  if (state.tab !== 'continue') {
    chips.push({
      key: 'tab',
      label: ARTICLE_HUB_TAB_LABELS[state.tab as ArticleHubTab],
      onRemove: onClearTab,
    });
  }
  if (state.query.trim()) {
    chips.push({
      key: 'q',
      label: `検索: ${state.query.trim()}`,
      onRemove: onClearQuery,
    });
  }
  if (state.status !== 'all') {
    chips.push({
      key: 'status',
      label: STATUS_LABELS[state.status],
      onRemove: onClearStatus,
    });
  }
  for (const tag of state.tags) {
    chips.push({
      key: `tag-${tag}`,
      label: tag,
      onRemove: () => onClearTag(tag),
    });
  }

  if (chips.length === 0) return null;

  return (
    <div className="mb-4 flex flex-wrap items-center gap-2">
      <span className="text-xs text-[var(--text-muted)]">適用中:</span>
      {chips.map((chip) => (
        <button
          key={chip.key}
          type="button"
          onClick={chip.onRemove}
          className="inline-flex items-center gap-1 rounded-full border border-brand-primary/30 bg-brand-primary/10 px-3 py-1 text-xs font-medium text-brand-primary hover:bg-brand-primary/20"
        >
          {chip.label}
          <span aria-hidden="true">×</span>
        </button>
      ))}
    </div>
  );
};
