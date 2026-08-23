import React from 'react';
import { FlightPlan, RouteSegment } from '../../../../types/index';
import { formatBearing } from '../../../../utils/format';
import type { PlanningPanelLayout } from '../../planningPanelLayout';
import { RouteProfilePanel } from '../profile/RouteProfilePanel';

interface FlightSummaryProps {
  layout?: PlanningPanelLayout;
  flightPlan: FlightPlan;
  fuelBelowReserve?: boolean;
  aboveServiceCeiling?: boolean;
  aboveMaxFuel?: boolean;
  onSegmentOverrideChange?: (from: string, to: string, patch: { casKt?: number; altitudeFt?: number }) => void;
  onOpenAirspace3d?: () => void;
  onPreloadAirspace3d?: () => void;
}

function overrideEndpoints(segment: RouteSegment): [string, string] {
  const key = segment.overrideKey ?? `${segment.from}->${segment.to}`;
  const sep = key.indexOf('->');
  if (sep < 0) return [segment.from, segment.to];
  return [key.slice(0, sep), key.slice(sep + 2) || segment.to];
}

export const FlightSummary: React.FC<FlightSummaryProps> = ({
  layout = 'full',
  flightPlan,
  fuelBelowReserve = false,
  aboveServiceCeiling = false,
  aboveMaxFuel = false,
  onSegmentOverrideChange,
  onOpenAirspace3d,
  onPreloadAirspace3d,
}) => {
  const isSplitLayout = layout === 'split';
  const [view, setView] = React.useState<'log' | 'profile'>('log');
  const segments = flightPlan.routeSegments ?? [];

  return (
    <div>
      <div className={isSplitLayout ? 'grid grid-cols-1 sm:grid-cols-2 gap-3' : 'grid grid-cols-2 gap-3'}>
        <div className="p-2 md:p-3 rounded-md border border-whiskyPapa-yellow/20">
          <div className="text-xs text-gray-300">合計距離</div>
          <div className="text-sm md:text-base font-medium text-white">
            {flightPlan.totalDistance ? `${flightPlan.totalDistance.toFixed(1)} nm` : '--'}
          </div>
        </div>
        <div className="p-2 md:p-3 rounded-md border border-whiskyPapa-yellow/20">
          <div className="text-xs text-gray-300">予想飛行時間</div>
          <div className="text-sm md:text-base font-medium text-white">{flightPlan.ete || '--:--'}</div>
        </div>
        <div className="p-2 md:p-3 rounded-md border border-whiskyPapa-yellow/20">
          <div className="text-xs text-gray-300">出発時刻 (JST)</div>
          <div className="text-sm md:text-base font-medium text-white">{flightPlan.departureTime || '--:--'}</div>
        </div>
        <div className="p-2 md:p-3 rounded-md border border-whiskyPapa-yellow/20">
          <div className="text-xs text-gray-300">到着予定時刻 (JST)</div>
          <div className="text-sm md:text-base font-medium text-white">{flightPlan.eta || '--:--'}</div>
        </div>
      </div>

      {fuelBelowReserve ? (
        <p className="mt-3 rounded border border-amber-500/40 bg-amber-950/40 px-3 py-2 text-xs text-amber-100">
          残燃料が予備＋代替を下回っています。燃料計画を見直してください（教育用表示）。
        </p>
      ) : null}

      {aboveServiceCeiling ? (
        <p className="mt-3 rounded border border-amber-500/40 bg-amber-950/40 px-3 py-2 text-xs text-amber-100">
          巡航高度が機体の実用上昇限度を超えています（教育用表示）。
        </p>
      ) : null}

      {aboveMaxFuel ? (
        <p className="mt-3 rounded border border-amber-500/40 bg-amber-950/40 px-3 py-2 text-xs text-amber-100">
          初期燃料が最大搭載量を超えています（教育用表示）。
        </p>
      ) : null}

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => setView('log')}
          className={`min-h-[44px] rounded border px-3 py-1.5 text-xs ${
            view === 'log'
              ? 'border-whiskyPapa-yellow/60 text-whiskyPapa-yellow'
              : 'border-whiskyPapa-yellow/20 text-gray-300'
          }`}
        >
          NavLog
        </button>
        <button
          type="button"
          onClick={() => setView('profile')}
          className={`min-h-[44px] rounded border px-3 py-1.5 text-xs ${
            view === 'profile'
              ? 'border-whiskyPapa-yellow/60 text-whiskyPapa-yellow'
              : 'border-whiskyPapa-yellow/20 text-gray-300'
          }`}
        >
          断面
        </button>
        {onOpenAirspace3d ? (
          <button
            type="button"
            data-testid="planning-open-airspace3d"
            onMouseEnter={onPreloadAirspace3d}
            onFocus={onPreloadAirspace3d}
            onClick={onOpenAirspace3d}
            className="ml-auto min-h-[44px] text-xs text-brand-primary underline-offset-2 hover:underline"
          >
            3D空域エクスプローラ
          </button>
        ) : null}
      </div>

      {view === 'profile' ? (
        <div className="mt-3">
          <RouteProfilePanel flightPlan={flightPlan} embedded />
        </div>
      ) : segments.length > 0 ? (
        <div className="mt-3 overflow-x-auto">
          <table className="min-w-full divide-y border-whiskyPapa-yellow/20 text-xs md:text-sm">
            <thead className="bg-whiskyPapa-black-dark">
              <tr>
                <th className="px-2 py-1 text-left text-xs font-medium text-white uppercase">From</th>
                <th className="px-2 py-1 text-left text-xs font-medium text-white uppercase">To</th>
                <th className="px-2 py-1 text-left text-xs font-medium text-white uppercase">相</th>
                <th className="px-2 py-1 text-right text-xs font-medium text-white uppercase">CAS</th>
                <th className="px-2 py-1 text-right text-xs font-medium text-white uppercase">MC</th>
                <th className="px-2 py-1 text-right text-xs font-medium text-white uppercase">MH</th>
                <th className="px-2 py-1 text-right text-xs font-medium text-white uppercase">高度</th>
                <th className="px-2 py-1 text-right text-xs font-medium text-white uppercase">距離</th>
                <th className="px-2 py-1 text-right text-xs font-medium text-white uppercase">ETA</th>
                <th className="px-2 py-1 text-right text-xs font-medium text-white uppercase">Fuel</th>
                <th className="px-2 py-1 text-left text-xs font-medium text-white uppercase">Freq</th>
              </tr>
            </thead>
            <tbody className="divide-y border-whiskyPapa-yellow/20">
              {segments.map((segment: RouteSegment, index: number) => (
                <tr key={`${segment.from}-${segment.to}-${index}`}>
                  <td className="px-2 py-1 text-white">{segment.from}</td>
                  <td className="px-2 py-1 text-white">{segment.to}</td>
                  <td className="px-2 py-1 text-gray-300">{segment.phase ?? 'cruise'}</td>
                  <td className="px-2 py-1 text-white text-right">
                    <input
                      type="number"
                      min="1"
                      value={Number.isFinite(segment.speed) ? segment.speed : ''}
                      onChange={(e) => {
                        const [from, to] = overrideEndpoints(segment);
                        onSegmentOverrideChange?.(from, to, { casKt: parseInt(e.target.value, 10) });
                      }}
                      className="w-16 bg-whiskyPapa-black-dark border border-whiskyPapa-yellow/20 text-white text-right rounded px-1 py-0.5 focus:outline-none focus:ring-2 focus:ring-whiskyPapa-yellow"
                    />
                    <span className="ml-1">kt</span>
                  </td>
                  <td className="px-2 py-1 text-white text-right">{formatBearing(segment.bearing)}°</td>
                  <td className="px-2 py-1 text-white text-right">
                    {segment.magneticHeadingDeg != null ? `${formatBearing(segment.magneticHeadingDeg)}°` : '--'}
                    {segment.windUnsolvable ? <span className="ml-1 text-amber-300">!</span> : null}
                  </td>
                  <td className="px-2 py-1 text-white text-right">
                    <input
                      type="number"
                      min="0"
                      value={Number.isFinite(segment.altitude) ? segment.altitude : ''}
                      onChange={(e) => {
                        const [from, to] = overrideEndpoints(segment);
                        onSegmentOverrideChange?.(from, to, { altitudeFt: parseInt(e.target.value, 10) });
                      }}
                      className="w-16 bg-whiskyPapa-black-dark border border-whiskyPapa-yellow/20 text-white text-right rounded px-1 py-0.5 focus:outline-none focus:ring-2 focus:ring-whiskyPapa-yellow"
                    />
                    <span className="ml-1">ft</span>
                  </td>
                  <td className="px-2 py-1 text-white text-right">{segment.distance?.toFixed(1)} nm</td>
                  <td className="px-2 py-1 text-white text-right">
                    <div>{segment.eta || '--:--'}</div>
                    <div className="text-xs opacity-70">{segment.duration || '--:--'}</div>
                  </td>
                  <td className="px-2 py-1 text-white text-right">
                    <div>{Number.isFinite(segment.fuelUsedLb) ? `${segment.fuelUsedLb?.toFixed(0)} lb` : '--'}</div>
                    <div className="text-xs opacity-70">
                      {Number.isFinite(segment.fuelRemainingLb)
                        ? `${((segment.fuelRemainingLb as number) / 1000).toFixed(1)} k`
                        : '--'}
                    </div>
                  </td>
                  <td className="px-2 py-1 text-white text-left">{segment.frequency || '--'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="mt-3 text-sm text-gray-400">出発地・到着地を設定すると NavLog を生成します。</p>
      )}
    </div>
  );
};

export default React.memo(FlightSummary);
