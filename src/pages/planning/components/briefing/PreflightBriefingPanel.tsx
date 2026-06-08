import React, { useMemo } from 'react';
import L from 'leaflet';
import type { FlightPlan } from '../../../../types';
import { buildPreflightBriefing } from '../../briefing/buildPreflightBriefing';
import type { BriefingItem } from '../../briefing/briefingTypes';
import { roleLabelJa } from '../../briefing/preflightNotamBriefing';
import { usePreflightNotamBriefing } from '../../briefing/usePreflightNotamBriefing';
import { usePlanningNotamSheetOptional } from '../map/planningNotamSheetContext';

import type { PlanningPanelLayout } from '../../planningPanelLayout';

interface PreflightBriefingPanelProps {
  flightPlan: FlightPlan;
  layout?: PlanningPanelLayout;
}

function ItemList({ items }: { items: BriefingItem[] }) {
  return (
    <dl className="mt-2 grid gap-2">
      {items.map((item) => (
        <div key={`${item.label}-${item.value}`} className="rounded border border-gray-700 bg-black/20 px-3 py-2">
          <dt className="text-xs text-gray-400">{item.label}</dt>
          <dd className={item.status === 'warning' ? 'text-sm text-amber-200' : 'text-sm text-gray-100'}>{item.value}</dd>
        </div>
      ))}
    </dl>
  );
}

function PreflightNotamSection({ flightPlan }: { flightPlan: FlightPlan }) {
  const notamSheet = usePlanningNotamSheetOptional();
  const { snapshots, loading, targets } = usePreflightNotamBriefing(flightPlan);

  if (targets.length === 0) {
    return (
      <p className="mt-2 text-sm text-gray-400">
        出発地・到着地（ICAO）を設定すると、SWIM デジタル NOTAM を自動取得します。
      </p>
    );
  }

  return (
    <div className="mt-2 space-y-2">
      {loading && snapshots.every((s) => s.loading) ? (
        <p className="text-sm text-gray-400">NOTAM を取得中…</p>
      ) : null}
      {snapshots.map((snap) => {
        const target = targets.find((t) => t.icao === snap.icao);
        return (
        <div
          key={`${snap.role}-${snap.icao}`}
          className="rounded border border-gray-700 bg-black/20 px-3 py-2.5"
        >
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              <p className="text-xs text-gray-400">{roleLabelJa(snap.role)} — {snap.label}</p>
              <p
                className={
                  snap.error
                    ? 'text-sm text-red-300'
                    : snap.currentCount + snap.futureCount > 0
                      ? 'text-sm text-amber-100'
                      : 'text-sm text-gray-300'
                }
              >
                {snap.error ?? snap.peekSummary}
              </p>
            </div>
            {notamSheet ? (
              <button
                type="button"
                onClick={() =>
                  notamSheet.openNotamSheet({
                    code: snap.icao,
                    kind: 'location',
                    latlng:
                      target?.lat != null && target?.lon != null
                        ? L.latLng(target.lat, target.lon)
                        : undefined,
                  })
                }
                className="shrink-0 rounded border border-whiskyPapa-yellow/40 px-2 py-1 text-[11px] text-whiskyPapa-yellow hover:bg-whiskyPapa-yellow/10"
              >
                地図で確認
              </button>
            ) : null}
          </div>
          {snap.highlights.length > 0 ? (
            <ul className="mt-2 list-disc space-y-1 pl-4 text-xs text-gray-300">
              {snap.highlights.map((line) => (
                <li key={line.slice(0, 48)}>{line}</li>
              ))}
            </ul>
          ) : null}
          {!snap.loading && !snap.error && snap.highlights.length === 0 ? (
            <p className="mt-1 text-xs text-gray-500">有効 NOTAM はありません（参考表示）。</p>
          ) : null}
        </div>
        );
      })}
      <p className="text-[10px] leading-snug text-gray-500">
        参考表示です。航行判断は SWIM ポータル等の公式ノータムで必ず確認してください。
      </p>
    </div>
  );
}

export const PreflightBriefingPanel: React.FC<PreflightBriefingPanelProps> = ({
  flightPlan,
  layout = 'full',
}) => {
  const isSplitLayout = layout === 'split';
  const briefing = useMemo(() => buildPreflightBriefing(flightPlan), [flightPlan]);

  return (
    <section className="rounded-lg border border-whiskyPapa-yellow/20 bg-gray-900/70 p-4 min-w-0">
      <h3 className="text-lg font-semibold text-whiskyPapa-yellow">Preflight Briefing</h3>
      <p className="mt-1 text-xs text-gray-400">計画・NavLog・燃料・気象/NOTAM確認導線を一箇所に集約します。</p>

      <div
        className={
          isSplitLayout
            ? 'mt-4 grid grid-cols-1 gap-4'
            : 'mt-4 grid grid-cols-1 gap-4 xl:grid-cols-2'
        }
      >
        <div>
          <h4 className="text-sm font-semibold text-gray-200">Route Summary</h4>
          <ItemList items={briefing.routeSummary} />
        </div>
        <div>
          <h4 className="text-sm font-semibold text-gray-200">Fuel</h4>
          <ItemList items={briefing.fuel} />
        </div>
        <div>
          <h4 className="text-sm font-semibold text-gray-200">Weather / NOTAM</h4>
          <ItemList items={briefing.weatherAndNotam} />
          <h5 className="mt-3 text-xs font-semibold uppercase tracking-wide text-gray-400">SWIM NOTAM（自動）</h5>
          <PreflightNotamSection flightPlan={flightPlan} />
        </div>
        <div>
          <h4 className="text-sm font-semibold text-gray-200">NavLog</h4>
          <ItemList items={briefing.navLog} />
        </div>
      </div>

      <ul className="mt-4 list-disc space-y-1 pl-5 text-xs text-gray-400">
        {briefing.limitations.map((line) => <li key={line}>{line}</li>)}
      </ul>
    </section>
  );
};
