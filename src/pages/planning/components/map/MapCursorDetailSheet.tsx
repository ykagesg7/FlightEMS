import React, { useMemo, useState } from 'react';
import { X } from 'lucide-react';
import type L from 'leaflet';
import type { CursorNavaidDistance } from './cursorNavaidUtils';
import { filterNavaidsByQuery } from './cursorNavaidUtils';
import type { PlanningMapNavaid } from './planningMapTypes';

type Props = {
  open: boolean;
  onClose: () => void;
  cursorPosition: L.LatLng;
  distanceInfo: CursorNavaidDistance | null;
  navaidData: PlanningMapNavaid[];
  selectedNavaidId: string | null;
  nearestId: string | null;
  onSelectNavaidId: (id: string) => void;
  onSelectNearest: () => void;
};

/**
 * 地図上に重ねる詳細シート（DD + 選択 NAVAID 1件の磁方位/距離）。
 * 地図の flex 高さは変えず、オーバーレイのみで展開する。
 */
export const MapCursorDetailSheet: React.FC<Props> = ({
  open,
  onClose,
  cursorPosition,
  distanceInfo,
  navaidData,
  selectedNavaidId,
  nearestId,
  onSelectNavaidId,
  onSelectNearest,
}) => {
  const [query, setQuery] = useState('');

  const suggestions = useMemo(
    () => filterNavaidsByQuery(navaidData, query, 40),
    [navaidData, query],
  );

  if (!open) return null;

  const isNearest = selectedNavaidId != null && selectedNavaidId === nearestId;

  return (
    <div
      className="map-cursor-detail-sheet pointer-events-auto absolute inset-x-0 bottom-0 z-[10002] max-h-[45%] flex flex-col rounded-t-lg border border-whiskyPapa-yellow/30 bg-whiskyPapa-black-dark/95 shadow-xl"
      role="dialog"
      aria-label="固定位置の詳細"
    >
      <div className="flex shrink-0 items-center justify-between border-b border-whiskyPapa-yellow/25 px-3 py-2">
        <span className="text-xs font-semibold text-whiskyPapa-yellow">位置の詳細</span>
        <button
          type="button"
          onClick={onClose}
          className="rounded p-1 text-gray-400 hover:bg-whiskyPapa-yellow/10 hover:text-whiskyPapa-yellow"
          aria-label="詳細を閉じる"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto overscroll-y-contain px-3 py-2 space-y-2 text-2xs sm:text-xs">
        <div className="font-mono text-gray-200">
          <div className="text-gray-400">十進度 (DD)</div>
          <div className="hud-text hud-readout">
            {cursorPosition.lat.toFixed(4)}°N, {cursorPosition.lng.toFixed(4)}°E
          </div>
        </div>

        <div className="space-y-1.5 border-t border-whiskyPapa-yellow/20 pt-2">
          <div className="flex flex-wrap items-center justify-between gap-1">
            <label htmlFor="cursor-navaid-search" className="text-gray-400">
              基準 NAVAID
            </label>
            {!isNearest && nearestId ? (
              <button
                type="button"
                onClick={onSelectNearest}
                className="text-whiskyPapa-yellow/90 underline-offset-2 hover:underline"
              >
                最寄りに戻す（{nearestId}）
              </button>
            ) : null}
          </div>

          <input
            id="cursor-navaid-search"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="ID または名称で検索…"
            className="w-full rounded border border-whiskyPapa-yellow/30 bg-whiskyPapa-black px-2 py-1.5 text-white placeholder:text-gray-500 focus:border-whiskyPapa-yellow/60 focus:outline-none"
            autoComplete="off"
          />

          <ul className="max-h-28 overflow-y-auto rounded border border-whiskyPapa-yellow/20 divide-y divide-whiskyPapa-yellow/10">
            {suggestions.length === 0 ? (
              <li className="px-2 py-1.5 text-gray-500">該当なし</li>
            ) : (
              suggestions.map((n) => {
                const selected = n.id === selectedNavaidId;
                return (
                  <li key={n.id}>
                    <button
                      type="button"
                      onClick={() => {
                        onSelectNavaidId(n.id);
                        setQuery('');
                      }}
                      className={`flex w-full items-center justify-between gap-2 px-2 py-1.5 text-left hover:bg-whiskyPapa-yellow/10 ${
                        selected ? 'bg-whiskyPapa-yellow/15 text-whiskyPapa-yellow' : 'text-gray-200'
                      }`}
                    >
                      <span className="font-mono font-medium">{n.id}</span>
                      <span className="truncate text-gray-400">{n.name}</span>
                    </button>
                  </li>
                );
              })
            )}
          </ul>

          {distanceInfo ? (
            <div className="rounded border border-whiskyPapa-yellow/20 bg-black/30 px-2 py-1.5 font-mono text-gray-200">
              <div className="text-gray-400">
                from {distanceInfo.id}
                {distanceInfo.name ? `（${distanceInfo.name}）` : ''}
                {isNearest ? ' · 最寄り' : ''}
              </div>
              <div className="hud-text hud-readout">
                磁方位 {Math.round(distanceInfo.bearing)}° ／ 距離 {distanceInfo.distanceNm} nm
              </div>
            </div>
          ) : (
            <p className="text-gray-500">NAVAID を選択してください</p>
          )}
        </div>
      </div>
    </div>
  );
};
