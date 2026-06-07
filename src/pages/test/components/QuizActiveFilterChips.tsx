import React from 'react';
import type { TestHubState } from '../testHubFilters';

interface QuizActiveFilterChipsProps {
  state: TestHubState;
  onClearExam: () => void;
  onClearMode: () => void;
  onClearSub: () => void;
  onClearCount: () => void;
  onClearSort: () => void;
}

export const QuizActiveFilterChips: React.FC<QuizActiveFilterChipsProps> = ({
  state,
  onClearExam,
  onClearMode,
  onClearSub,
  onClearCount,
  onClearSort,
}) => {
  const chips: { key: string; label: string; onClear: () => void }[] = [];

  if (state.exam === 'ppl') {
    chips.push({ key: 'exam', label: 'PPL 基礎のみ', onClear: onClearExam });
  }
  if (state.mode === 'exam' && state.tab === 'subject') {
    chips.push({ key: 'mode', label: 'Exam', onClear: onClearMode });
  }
  if (state.sub !== 'all') {
    chips.push({ key: 'sub', label: `サブ: ${state.sub}`, onClear: onClearSub });
  }
  if (state.count !== 10) {
    chips.push({ key: 'count', label: `${state.count}問`, onClear: onClearCount });
  }
  if (state.sort === 'syllabus') {
    chips.push({ key: 'sort', label: 'シラバス順', onClear: onClearSort });
  }

  if (chips.length === 0) return null;

  return (
    <div className="mb-4 flex flex-wrap gap-2" aria-label="適用中のフィルタ">
      {chips.map((chip) => (
        <button
          key={chip.key}
          type="button"
          onClick={chip.onClear}
          className="inline-flex items-center gap-1 rounded-full border border-brand-primary/30 bg-brand-primary/10 px-3 py-1 text-xs font-medium text-brand-primary hover:bg-brand-primary/20"
        >
          {chip.label}
          <span aria-hidden>×</span>
        </button>
      ))}
    </div>
  );
};
