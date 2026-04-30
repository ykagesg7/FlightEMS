import React from 'react';
import type { TrackDeviationSummary } from '../../tracks/types';

interface DebriefSummaryProps {
  summaries: TrackDeviationSummary[];
}

export const DebriefSummary: React.FC<DebriefSummaryProps> = ({ summaries }) => {
  if (!summaries.length) return null;

  return (
    <div className="mt-4 grid gap-2">
      {summaries.map((summary) => (
        <div key={summary.trackId} className="rounded border border-gray-700 bg-black/20 p-3 text-xs text-gray-200">
          <p className="font-semibold text-whiskyPapa-yellow">{summary.trackName}</p>
          <p>平均横偏差: {summary.averageCrossTrackNm?.toFixed(2) ?? '--'} nm / 最大: {summary.maxCrossTrackNm?.toFixed(2) ?? '--'} nm / 1nm以内: {summary.withinOneNmPercent?.toFixed(0) ?? '--'}%</p>
          <p>高度: {summary.minAltitudeFt?.toFixed(0) ?? '--'} - {summary.maxAltitudeFt?.toFixed(0) ?? '--'} ft</p>
          {summary.waypointPassages.length ? (
            <p>通過点: {summary.waypointPassages.map((passage) => `${passage.name} ${passage.distanceNm.toFixed(1)}nm`).join(' / ')}</p>
          ) : null}
        </div>
      ))}
    </div>
  );
};
