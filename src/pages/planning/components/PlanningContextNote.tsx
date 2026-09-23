import React, { useCallback, useState } from 'react';

const STORAGE_KEY = 'planning_context_note_dismissed_v1';

export const PlanningContextNote: React.FC = () => {
  const [dismissed, setDismissed] = useState(
    () => localStorage.getItem(STORAGE_KEY) === '1'
  );

  const dismiss = useCallback(() => {
    localStorage.setItem(STORAGE_KEY, '1');
    setDismissed(true);
  }, []);

  if (dismissed) return null;

  return (
    <div
      className="mb-4 rounded-lg border border-whiskyPapa-yellow/30 bg-whiskyPapa-black-dark/80 px-4 py-3 text-sm text-gray-200"
      role="note"
    >
      <p>
        学科の学習は <strong className="text-whiskyPapa-yellow">ARTICLES → QUIZ</strong>。
        このページは訓練前のフライト準備（プランニング）用です。
      </p>
      <button
        type="button"
        onClick={dismiss}
        className="mt-2 text-xs font-medium text-whiskyPapa-yellow hover:text-whiskyPapa-yellow/80"
      >
        閉じる
      </button>
    </div>
  );
};
