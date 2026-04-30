import React, { useMemo } from 'react';
import type { FlightPlan } from '../../../../types';
import { buildPreflightBriefing } from '../../briefing/buildPreflightBriefing';
import type { BriefingItem } from '../../briefing/briefingTypes';

interface PreflightBriefingPanelProps {
  flightPlan: FlightPlan;
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

export const PreflightBriefingPanel: React.FC<PreflightBriefingPanelProps> = ({ flightPlan }) => {
  const briefing = useMemo(() => buildPreflightBriefing(flightPlan), [flightPlan]);

  return (
    <section className="rounded-lg border border-whiskyPapa-yellow/20 bg-gray-900/70 p-4">
      <h3 className="text-lg font-semibold text-whiskyPapa-yellow">Preflight Briefing</h3>
      <p className="mt-1 text-xs text-gray-400">計画・NavLog・燃料・気象/NOTAM確認導線を一箇所に集約します。</p>

      <div className="mt-4 grid gap-4 xl:grid-cols-2">
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
