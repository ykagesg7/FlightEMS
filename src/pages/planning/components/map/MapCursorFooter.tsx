import React from 'react';
import type L from 'leaflet';
import { formatDMS } from '../../../../utils';

type Props = {
  cursorPosition: L.LatLng | null;
  isPinned: boolean;
  isCoarsePointer: boolean;
  detailOpen: boolean;
  onToggleDetail: () => void;
  onPinCenter: () => void;
  onClearPin: () => void;
};

/**
 * 地図下の固定1行ステータス（DMS）。詳細はボトムシート。
 * タッチ端末は中央クロスヘア位置の「固定／解除」を併設。
 */
export const MapCursorFooter: React.FC<Props> = ({
  cursorPosition,
  isPinned,
  isCoarsePointer,
  detailOpen,
  onToggleDetail,
  onPinCenter,
  onClearPin,
}) => {
  const dms = cursorPosition
    ? formatDMS(cursorPosition.lat, cursorPosition.lng)
    : isCoarsePointer
      ? '位置(DMS)：--'
      : '位置(DMS)：地図をクリックで固定';

  const statusLabel = !cursorPosition
    ? null
    : isPinned
      ? '固定'
      : isCoarsePointer
        ? '中心'
        : null;

  return (
    <div
      className="shrink-0 z-[10000] flex items-center justify-between gap-2 border-t border-whiskyPapa-yellow/30 bg-whiskyPapa-black-dark/95 px-2 py-1.5 sm:px-3"
      role="status"
      aria-label="地図上の位置"
    >
      <div className="min-w-0 flex items-center gap-1.5">
        {statusLabel ? (
          <span className="shrink-0 rounded border border-whiskyPapa-yellow/35 px-1 py-px text-[10px] leading-tight text-whiskyPapa-yellow/90">
            {statusLabel}
          </span>
        ) : null}
        <span className="min-w-0 truncate text-2xs sm:text-xs font-mono hud-text hud-readout">
          {dms}
        </span>
      </div>
      <div className="flex shrink-0 items-center gap-1.5">
        {isCoarsePointer ? (
          isPinned ? (
            <button
              type="button"
              onClick={onClearPin}
              className="rounded border border-whiskyPapa-yellow/40 px-2 py-0.5 text-2xs sm:text-xs text-whiskyPapa-yellow hover:bg-whiskyPapa-yellow/10"
            >
              解除
            </button>
          ) : (
            <button
              type="button"
              onClick={onPinCenter}
              disabled={!cursorPosition}
              className="rounded border border-whiskyPapa-yellow/40 px-2 py-0.5 text-2xs sm:text-xs text-whiskyPapa-yellow hover:bg-whiskyPapa-yellow/10 disabled:cursor-not-allowed disabled:opacity-40"
            >
              この位置を固定
            </button>
          )
        ) : isPinned ? (
          <button
            type="button"
            onClick={onClearPin}
            className="rounded border border-whiskyPapa-yellow/40 px-2 py-0.5 text-2xs sm:text-xs text-whiskyPapa-yellow hover:bg-whiskyPapa-yellow/10"
          >
            解除
          </button>
        ) : null}
        <button
          type="button"
          onClick={onToggleDetail}
          disabled={!cursorPosition || (!isPinned && isCoarsePointer)}
          aria-expanded={detailOpen}
          className="rounded border border-whiskyPapa-yellow/40 px-2 py-0.5 text-2xs sm:text-xs text-whiskyPapa-yellow hover:bg-whiskyPapa-yellow/10 disabled:cursor-not-allowed disabled:opacity-40"
          title={
            !isPinned && isCoarsePointer
              ? '詳細を開くには位置を固定してください'
              : undefined
          }
        >
          詳細{detailOpen ? '▲' : '▼'}
        </button>
      </div>
    </div>
  );
};
