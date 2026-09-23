import React from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  parsePlanningMode,
  PLANNING_MODES,
  type PlanningMode,
} from '../../../lib/planningAnalytics';

export const PLANNING_MODE_LABELS: Record<PlanningMode, string> = {
  learn: '学習',
  plan: '計画',
  brief: 'ブリーフィング',
  debrief: '振り返り',
};

interface PlanningModeSegmentProps {
  className?: string;
  /** Compact select on narrow viewports when true */
  useSelectOnMobile?: boolean;
}

export const PlanningModeSegment: React.FC<PlanningModeSegmentProps> = ({
  className = '',
  useSelectOnMobile = true,
}) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const mode = parsePlanningMode(searchParams.get('mode'));

  const setMode = (next: PlanningMode) => {
    const params = new URLSearchParams(searchParams);
    if (next === 'plan') {
      params.delete('mode');
    } else {
      params.set('mode', next);
    }
    setSearchParams(params, { replace: true });
  };

  if (useSelectOnMobile) {
    return (
      <>
        <div className={`hidden sm:block ${className}`}>
          <ModeButtonGroup mode={mode} onChange={setMode} />
        </div>
        <div className={`sm:hidden ${className}`}>
          <label htmlFor="planning-mode-select" className="sr-only">Planning モード</label>
          <select
            id="planning-mode-select"
            value={mode}
            onChange={(e) => setMode(e.target.value as PlanningMode)}
            className="w-full min-h-[44px] rounded-lg border border-whiskyPapa-yellow/30 bg-whiskyPapa-black-dark px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-whiskyPapa-yellow"
          >
            {PLANNING_MODES.map((m) => (
              <option key={m} value={m}>{PLANNING_MODE_LABELS[m]}</option>
            ))}
          </select>
        </div>
      </>
    );
  }

  return (
    <div className={className}>
      <ModeButtonGroup mode={mode} onChange={setMode} />
    </div>
  );
};

function ModeButtonGroup({
  mode,
  onChange,
}: {
  mode: PlanningMode;
  onChange: (mode: PlanningMode) => void;
}) {
  return (
    <div
      className="flex flex-wrap gap-1 rounded-lg border border-whiskyPapa-yellow/20 bg-whiskyPapa-black-dark p-1"
      role="tablist"
      aria-label="Planning モード"
    >
      {PLANNING_MODES.map((m) => {
        const active = mode === m;
        return (
          <button
            key={m}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(m)}
            className={`min-h-[40px] flex-1 rounded-md px-2 py-2 text-xs font-medium sm:text-sm motion-safe:transition-colors ${
              active
                ? 'bg-whiskyPapa-yellow/20 text-whiskyPapa-yellow'
                : 'text-gray-400 hover:bg-whiskyPapa-yellow/10 hover:text-gray-200'
            }`}
          >
            {PLANNING_MODE_LABELS[m]}
          </button>
        );
      })}
    </div>
  );
}
