import React from 'react';
import { Layers } from 'lucide-react';
import L from 'leaflet';
import { MapCursorReadout } from './MapCursorReadout';
import type { NavaidDistanceInfo } from './MapCursorReadout';
import { usePlanningMapLayerControllerContext } from './planningMapLayerControllerContext';

type Props = {
  hintVisible: boolean;
  onDismissHint: () => void;
  onOpenHelp: () => void;
  onOpenLayers: () => void;
  layersOpen: boolean;
  cursorPosition: L.LatLng | null;
  navaidInfos: NavaidDistanceInfo[];
};

const MAX_VISIBLE_CHIPS = 3;

export const MapToolbar: React.FC<Props> = ({
  hintVisible,
  onDismissHint,
  onOpenHelp,
  onOpenLayers,
  layersOpen,
  cursorPosition,
  navaidInfos,
}) => {
  const controller = usePlanningMapLayerControllerContext();
  const labels = controller?.activeLayerLabels ?? [];
  const visibleLabels = labels.slice(0, MAX_VISIBLE_CHIPS);
  const overflow = labels.length - visibleLabels.length;

  return (
    <div
      className="shrink-0 z-[10000] flex flex-col gap-1.5 border-b border-whiskyPapa-yellow/30 bg-whiskyPapa-black-dark/95 px-2 py-1.5 sm:px-3 sm:py-2"
      role="region"
      aria-label="地図ツールバー"
    >
      <div className="flex flex-wrap items-center gap-2">
        <div className="hidden min-w-0 flex-1 lg:block">
          <MapCursorReadout cursorPosition={cursorPosition} navaidInfos={navaidInfos} />
        </div>
        <div className="flex min-w-0 flex-1 flex-wrap items-center justify-end gap-1.5 lg:flex-none lg:shrink-0">
          {visibleLabels.map((label) => (
            <button
              key={label}
              type="button"
              onClick={onOpenLayers}
              className="rounded border border-whiskyPapa-yellow/25 bg-whiskyPapa-yellow/10 px-1.5 py-0.5 text-2xs text-whiskyPapa-yellow hover:bg-whiskyPapa-yellow/20"
            >
              {label}
            </button>
          ))}
          {overflow > 0 ? (
            <button
              type="button"
              onClick={onOpenLayers}
              className="rounded border border-whiskyPapa-yellow/25 px-1.5 py-0.5 text-2xs text-gray-300 hover:bg-whiskyPapa-yellow/10"
            >
              +{overflow}
            </button>
          ) : null}
          <button
            type="button"
            onClick={onOpenLayers}
            aria-expanded={layersOpen}
            className={`inline-flex min-h-[36px] items-center gap-1 rounded border px-2.5 text-2xs sm:text-xs ${
              layersOpen
                ? 'border-whiskyPapa-yellow bg-whiskyPapa-yellow/15 text-whiskyPapa-yellow'
                : 'border-whiskyPapa-yellow/40 text-whiskyPapa-yellow hover:bg-whiskyPapa-yellow/10'
            }`}
          >
            <Layers className="h-3.5 w-3.5" />
            レイヤー
          </button>
          <button
            type="button"
            onClick={onOpenHelp}
            className="min-h-[36px] rounded border border-whiskyPapa-yellow/40 px-2.5 text-2xs sm:text-xs text-whiskyPapa-yellow hover:bg-whiskyPapa-yellow/10"
          >
            地図の使い方
          </button>
        </div>
      </div>
      {hintVisible ? (
        <div className="flex flex-wrap items-center gap-2 text-2xs sm:text-xs text-gray-200">
          <span role="status">
            地図上を<strong className="text-whiskyPapa-yellow font-medium">ダブルクリック</strong>
            すると、その位置にウェイポイントを追加できます。
          </span>
          <button
            type="button"
            onClick={onDismissHint}
            className="shrink-0 rounded border border-whiskyPapa-yellow/40 px-2 py-0.5 text-whiskyPapa-yellow hover:bg-whiskyPapa-yellow/10"
            aria-label="ヒントを閉じる"
          >
            閉じる
          </button>
        </div>
      ) : null}
    </div>
  );
};
