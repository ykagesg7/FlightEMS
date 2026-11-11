import React from 'react';
import type { DataProvenanceLine } from './mapDataProvenance';
import { formatProvenanceTimestamp } from './mapDataProvenance';

type Props = {
  lines: DataProvenanceLine[];
  compact?: boolean;
};

export const MapDataProvenancePanel: React.FC<Props> = ({ lines, compact = false }) => {
  if (lines.length === 0) return null;

  return (
    <div
      className={`rounded border border-whiskyPapa-yellow/25 bg-whiskyPapa-black-dark/90 text-gray-300 ${
        compact ? 'px-2 py-1.5 text-2xs' : 'px-3 py-2 text-xs'
      }`}
    >
      <p className="mb-1 font-semibold text-whiskyPapa-yellow/90">データ出典・取得日（参考）</p>
      <ul className="space-y-1.5">
        {lines.map((line) => (
          <li key={`${line.category}-${line.sourceLabel}`}>
            <div className="text-gray-200">
              {line.category === 'airspace' ? '空域' : line.category === 'notam' ? 'NOTAM' : '気象'}
              ：{line.sourceLabel}
            </div>
            <div className="text-gray-400">
              取得日（目安）：{formatProvenanceTimestamp(line.fetchedAtIso)}
              {line.airacLabel ? ` ／ AIRAC：${line.airacLabel}` : null}
            </div>
            {line.note ? <div className="text-gray-500">{line.note}</div> : null}
          </li>
        ))}
      </ul>
    </div>
  );
};
