import React from 'react';
import { describeAircraftPerformance } from '../../../../data/aircraftPresets';
import type {
  AircraftPerformanceOverrides,
  AircraftPreset,
  DescentMode,
  FlightPlan,
} from '../../../../types/index';

interface AircraftPerformancePanelProps {
  flightPlan: FlightPlan;
  setFlightPlan: React.Dispatch<React.SetStateAction<FlightPlan>>;
  preset?: AircraftPreset;
}

type FieldKey = keyof AircraftPerformanceOverrides;

type Field = {
  key: FieldKey;
  label: string;
  unit: string;
  step?: number;
  hint?: string;
};

const CLIMB_FIELDS: Field[] = [
  { key: 'climbCasKt', label: '上昇 CAS', unit: 'kt' },
  { key: 'climbMach', label: 'クロスオーバー', unit: 'M', step: 0.01 },
  { key: 'climbRateFpm', label: '上昇率', unit: 'fpm', step: 100 },
  { key: 'climbFuelFlowLbPerHr', label: '上昇 FF', unit: 'lb/hr', step: 100 },
];

const DESCENT_FIELDS: Field[] = [
  { key: 'descentCasKt', label: '降下 CAS', unit: 'kt' },
  { key: 'descentRateFpm', label: '標準降下率', unit: 'fpm', step: 100 },
  { key: 'descentIdleRateFpm', label: 'アイドル降下率', unit: 'fpm', step: 100 },
  { key: 'descentFuelFlowLbPerHr', label: '降下 FF', unit: 'lb/hr', step: 100 },
];

const LIMIT_FIELDS: Field[] = [
  { key: 'cruiseFuelFlowLbPerHr', label: '巡航 FF', unit: 'lb/hr', step: 100 },
  { key: 'serviceCeilingFt', label: '実用上昇限度', unit: 'ft', step: 1000 },
  { key: 'maxFuelLb', label: '最大搭載燃料', unit: 'lb', step: 100 },
];

const inputClass =
  'w-full min-h-[44px] rounded border border-whiskyPapa-yellow/30 bg-whiskyPapa-black-dark px-2 py-2 text-right text-sm text-white focus:outline-none focus:ring-2 focus:ring-whiskyPapa-yellow';

export function AircraftPerformancePanel({
  flightPlan,
  setFlightPlan,
  preset,
}: AircraftPerformancePanelProps) {
  const descentMode: DescentMode = flightPlan.descentMode ?? 'standard';
  const defaults = React.useMemo(
    () => describeAircraftPerformance(preset, descentMode),
    [preset, descentMode],
  );
  const overrides = flightPlan.performanceOverrides;

  const handleChange = React.useCallback(
    (key: FieldKey, raw: string) => {
      const parsed = Number(raw);
      setFlightPlan((prev) => {
        const next: AircraftPerformanceOverrides = { ...prev.performanceOverrides };
        if (raw.trim() === '' || !Number.isFinite(parsed) || parsed <= 0) {
          delete next[key];
        } else {
          next[key] = parsed;
        }
        return {
          ...prev,
          performanceOverrides: Object.keys(next).length > 0 ? next : undefined,
        };
      });
    },
    [setFlightPlan],
  );

  const handleDescentMode = React.useCallback(
    (mode: DescentMode) => {
      setFlightPlan((prev) => ({ ...prev, descentMode: mode }));
    },
    [setFlightPlan],
  );

  const handleReset = React.useCallback(() => {
    setFlightPlan((prev) => ({
      ...prev,
      performanceOverrides: undefined,
      descentMode: 'standard',
    }));
  }, [setFlightPlan]);

  const overrideCount = overrides ? Object.keys(overrides).length : 0;

  const renderField = (field: Field) => (
    <div key={field.key}>
      <label
        htmlFor={`perf-${field.key}`}
        className="mb-1 block text-2xs text-gray-300 sm:text-xs"
      >
        {field.label} ({field.unit})
      </label>
      <input
        id={`perf-${field.key}`}
        type="number"
        inputMode="decimal"
        min="0"
        step={field.step ?? 1}
        value={overrides?.[field.key] ?? ''}
        placeholder={defaults[field.key] ? String(defaults[field.key]) : '--'}
        onChange={(event) => handleChange(field.key, event.target.value)}
        className={inputClass}
      />
    </div>
  );

  if (!preset) {
    return (
      <p className="text-2xs text-gray-400 sm:text-xs">
        機体プリセットを選ぶと上昇・降下の性能値を編集できます。
      </p>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <p className="max-w-prose text-2xs leading-relaxed text-gray-400">
          プリセットは教育用モックです。空欄はプリセット既定（薄字）を使います。値を入れると
          この計画だけ上書きされ、保存・読み込みにも引き継がれます。
        </p>
        <button
          type="button"
          onClick={handleReset}
          disabled={overrideCount === 0 && descentMode === 'standard'}
          className="min-h-[44px] rounded border border-whiskyPapa-yellow/30 px-3 py-2 text-xs text-white hover:bg-whiskyPapa-yellow/10 disabled:cursor-not-allowed disabled:opacity-40"
        >
          既定に戻す{overrideCount > 0 ? `（${overrideCount}）` : ''}
        </button>
      </div>

      <fieldset>
        <legend className="mb-1 text-xs font-medium text-whiskyPapa-yellow">上昇</legend>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">{CLIMB_FIELDS.map(renderField)}</div>
      </fieldset>

      <fieldset>
        <legend className="mb-1 text-xs font-medium text-whiskyPapa-yellow">降下</legend>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {DESCENT_FIELDS.map(renderField)}
        </div>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <span className="text-2xs text-gray-300 sm:text-xs">計算に使う降下率</span>
          {(['standard', 'idle'] as const).map((mode) => (
            <button
              key={mode}
              type="button"
              aria-pressed={descentMode === mode}
              onClick={() => handleDescentMode(mode)}
              className={`min-h-[44px] rounded border px-3 py-1.5 text-xs ${
                descentMode === mode
                  ? 'border-whiskyPapa-yellow/60 text-whiskyPapa-yellow'
                  : 'border-whiskyPapa-yellow/20 text-gray-300'
              }`}
            >
              {mode === 'standard' ? '標準' : 'アイドル'}
            </button>
          ))}
        </div>
      </fieldset>

      <fieldset>
        <legend className="mb-1 text-xs font-medium text-whiskyPapa-yellow">巡航・限界</legend>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">{LIMIT_FIELDS.map(renderField)}</div>
      </fieldset>
    </div>
  );
}

export default AircraftPerformancePanel;
