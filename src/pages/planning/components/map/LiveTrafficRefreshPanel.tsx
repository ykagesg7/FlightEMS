import React, { useMemo } from 'react';
import type { LiveTrafficLayerControls } from './hooks/useLiveTrafficLayer';
import { formatTrafficAgeLabel } from './liveTrafficLayerState';
import { LiveTrafficRefreshButton } from './LiveTrafficRefreshButton';

type Props = {
  controls: LiveTrafficLayerControls;
};

export const LiveTrafficRefreshPanel: React.FC<Props> = ({ controls }) => {
  const statusText = useMemo(() => {
    if (controls.isRefreshing) {
      return '航空機位置 取得中…';
    }
    const ageLabel = formatTrafficAgeLabel(
      {
        lastSuccessAtMs: controls.lastUpdatedAtMs,
        lastFetchFailed: controls.lastFetchFailed,
        openSkyTimeSec: null,
      },
      Date.now(),
    );
    if (controls.lastFetchFailed && controls.lastUpdatedAtMs === null) {
      return '取得できませんでした';
    }
    return `最終更新: ${ageLabel}`;
  }, [controls.isRefreshing, controls.lastFetchFailed, controls.lastUpdatedAtMs]);

  return (
    <div
      className="rounded border border-whiskyPapa-yellow/30 bg-whiskyPapa-black-dark/90 px-2 py-1.5"
      role="status"
      aria-live="polite"
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-2xs text-gray-300">航空機（参考）</p>
        <LiveTrafficRefreshButton controls={controls} />
      </div>
      <p className="mt-1 text-2xs text-gray-400">{statusText}</p>
    </div>
  );
};
