import React from 'react';
import { formatProvenanceTimestamp, buildAirspaceProvenance } from './mapDataProvenance';
import { GSI_TILE_ATTRIBUTION_JA } from '../flight/flightViewer3d/gsiTileConfig';

type Props = {
  airspaceLastModifiedIso: string | null;
  airspaceLoading: boolean;
  /** モバイルではフッター直上に出典を逃がす */
  stackAboveFooter?: boolean;
};

/**
 * 空域データの取得日と地図出典を常時表示（A1）。
 */
export const MapPlanningDataStatusBar: React.FC<Props> = ({
  airspaceLastModifiedIso,
  airspaceLoading,
  stackAboveFooter = false,
}) => {
  const airspace = buildAirspaceProvenance(airspaceLastModifiedIso ?? undefined);
  const fetchedLabel = airspaceLoading
    ? '取得中…'
    : formatProvenanceTimestamp(airspace.fetchedAtIso);

  return (
    <div
      className={`pointer-events-none absolute inset-x-0 z-[460] flex flex-wrap items-center justify-between gap-x-2 gap-y-0.5 px-2 ${
        stackAboveFooter ? 'bottom-[3.25rem]' : 'bottom-2'
      }`}
      aria-live="polite"
    >
      <div className="rounded bg-black/70 px-2 py-1 text-2xs text-gray-100 shadow-sm">
        {GSI_TILE_ATTRIBUTION_JA}
      </div>
      <div
        className="max-w-[min(100%,18rem)] rounded bg-black/70 px-2 py-1 text-2xs text-gray-200 shadow-sm"
        title={airspace.sourceLabel}
      >
        <span className="text-whiskyPapa-yellow/90">空域データ</span>
        {' 取得日（目安）：'}
        {fetchedLabel}
      </div>
    </div>
  );
};
