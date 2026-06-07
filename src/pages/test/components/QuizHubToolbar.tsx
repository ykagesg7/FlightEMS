import React from 'react';
import {
  TEST_HUB_TAB_LABELS,
  type TestHubSort,
  type TestHubState,
  type TestHubTab,
} from '../testHubFilters';

interface QuizHubToolbarProps {
  state: TestHubState;
  visibleTabs: TestHubTab[];
  onTabChange: (tab: TestHubTab) => void;
  onSortChange: (sort: TestHubSort) => void;
  onOpenFilters: () => void;
  activeFilterCount: number;
  onStartDiagnostic?: () => void;
  diagnosticDisabled?: boolean;
}

const SORT_OPTIONS: { value: TestHubSort; label: string }[] = [
  { value: 'priority', label: '優先度順' },
  { value: 'syllabus', label: 'シラバス順' },
];

export const QuizHubToolbar: React.FC<QuizHubToolbarProps> = ({
  state,
  visibleTabs,
  onTabChange,
  onSortChange,
  onOpenFilters,
  activeFilterCount,
  onStartDiagnostic,
  diagnosticDisabled = false,
}) => (
  <div className="mb-6 space-y-4">
    {state.tab === 'diagnostic' && onStartDiagnostic && (
      <div className="rounded-xl border-2 border-brand-primary/40 bg-brand-secondary-dark p-5 shadow-lg ring-1 ring-brand-primary/20">
        <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-brand-primary">
          クイック実力診断
        </p>
        <h2 className="mb-2 text-lg font-bold text-[var(--text-primary)]">
          重要度の高い問題 {state.count} 問
        </h2>
        <p className="mb-4 text-sm text-[var(--text-muted)]">
          全科目から自動で出題。弱点の把握と最短学習ルートの入口に使えます。
        </p>
        <button
          type="button"
          onClick={onStartDiagnostic}
          disabled={diagnosticDisabled}
          className="rounded-lg bg-brand-primary px-6 py-2.5 text-sm font-semibold text-[var(--bg)] transition hover:bg-brand-primary-dark disabled:cursor-not-allowed disabled:opacity-60"
        >
          {state.count}問診断を開始
        </button>
      </div>
    )}

    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-wrap gap-2" role="tablist" aria-label="クイズモード">
        {visibleTabs.map((tab) => {
          const isActive = state.tab === tab;
          return (
            <button
              key={tab}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => onTabChange(tab)}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition-all duration-200 ${
                isActive
                  ? 'bg-brand-primary text-[var(--bg)] shadow-lg'
                  : 'border border-brand-primary/25 text-[var(--text-primary)] hover:bg-brand-primary/10'
              }`}
            >
              {TEST_HUB_TAB_LABELS[tab]}
            </button>
          );
        })}
      </div>

      {state.tab !== 'content' && (
        <div className="flex items-center gap-2">
          <label htmlFor="quiz-hub-sort" className="sr-only">
            並び順
          </label>
          <select
            id="quiz-hub-sort"
            value={state.sort}
            onChange={(e) => onSortChange(e.target.value as TestHubSort)}
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
            詳細設定
            {activeFilterCount > 0 ? ` (${activeFilterCount})` : ''}
          </button>
        </div>
      )}
    </div>
  </div>
);
