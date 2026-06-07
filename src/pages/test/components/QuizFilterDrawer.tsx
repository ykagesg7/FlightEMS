import React from 'react';
import type { ExamLevelFilter } from '../examLevelFilter';
import type { TestHubMode, TestHubState } from '../testHubFilters';

interface QuizFilterDrawerProps {
  open: boolean;
  state: TestHubState;
  filtersLocked: boolean;
  onClose: () => void;
  onExamChange: (exam: ExamLevelFilter) => void;
  onModeChange: (mode: TestHubMode) => void;
  onCountChange: (count: number) => void;
  questionCountOptions: number[];
  children?: React.ReactNode;
}

export const QuizFilterDrawer: React.FC<QuizFilterDrawerProps> = ({
  open,
  state,
  filtersLocked,
  onClose,
  onExamChange,
  onModeChange,
  onCountChange,
  questionCountOptions,
  children,
}) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      <button
        type="button"
        className="absolute inset-0 bg-black/50"
        aria-label="フィルタを閉じる"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="quiz-filter-drawer-title"
        className="relative z-10 max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-t-2xl border border-brand-primary/20 bg-[var(--panel)] p-6 shadow-2xl sm:rounded-2xl"
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 id="quiz-filter-drawer-title" className="text-lg font-semibold text-[var(--text-primary)]">
            詳細設定
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-3 py-1 text-sm text-brand-primary hover:bg-brand-primary/10"
          >
            閉じる
          </button>
        </div>

        <div className="space-y-5">
          <fieldset disabled={filtersLocked}>
            <legend className="mb-2 text-sm font-semibold text-brand-primary">出題レベル</legend>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                className={`rounded-lg border px-3 py-2 text-sm font-medium ${
                  state.exam === 'all'
                    ? 'border-brand-primary bg-brand-primary/15 text-brand-primary'
                    : 'border-brand-primary/20 text-[var(--text-primary)]'
                }`}
                onClick={() => onExamChange('all')}
              >
                CPL すべて
              </button>
              <button
                type="button"
                className={`rounded-lg border px-3 py-2 text-sm font-medium ${
                  state.exam === 'ppl'
                    ? 'border-brand-primary bg-brand-primary/15 text-brand-primary'
                    : 'border-brand-primary/20 text-[var(--text-primary)]'
                }`}
                onClick={() => onExamChange('ppl')}
              >
                PPL 基礎のみ
              </button>
            </div>
          </fieldset>

          {state.tab === 'subject' && (
            <fieldset disabled={filtersLocked}>
              <legend className="mb-2 text-sm font-semibold text-brand-primary">モード</legend>
              <div className="flex flex-wrap gap-2">
                {(['practice', 'exam'] as const).map((m) => (
                  <button
                    key={m}
                    type="button"
                    className={`rounded-lg border px-3 py-2 text-sm font-medium ${
                      state.mode === m
                        ? 'border-brand-primary bg-brand-primary/15 text-brand-primary'
                        : 'border-brand-primary/20 text-[var(--text-primary)]'
                    }`}
                    onClick={() => onModeChange(m)}
                  >
                    {m === 'practice' ? 'Practice' : 'Exam'}
                  </button>
                ))}
              </div>
              {state.mode === 'exam' && (
                <p className="mt-2 text-xs text-[var(--text-muted)]">
                  Exam モード：解説は結果画面まで表示されません。
                </p>
              )}
            </fieldset>
          )}

          {questionCountOptions.length > 0 && (
            <div>
              <label htmlFor="quiz-drawer-count" className="mb-2 block text-sm font-semibold text-brand-primary">
                出題数
              </label>
              <select
                id="quiz-drawer-count"
                value={state.count}
                onChange={(e) => onCountChange(Number(e.target.value))}
                disabled={filtersLocked}
                className="w-full rounded-lg border border-brand-primary/30 bg-brand-secondary-dark px-3 py-2 text-sm text-[var(--text-primary)]"
              >
                {questionCountOptions.map((n) => (
                  <option key={n} value={n}>
                    {n}問
                  </option>
                ))}
              </select>
            </div>
          )}

          {children}
        </div>
      </div>
    </div>
  );
};
