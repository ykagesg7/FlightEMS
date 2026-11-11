import React from 'react';
import { GSI_TILE_ATTRIBUTION_JA } from '../flight/flightViewer3d/gsiTileConfig';

/** ベース地図の出典（Leaflet attribution に加え、画面内に固定表示） */
export const MapGsiAttribution: React.FC = () => (
  <div
    className="pointer-events-none absolute bottom-2 left-2 z-[450] max-w-[min(100%-1rem,20rem)] rounded bg-black/55 px-2 py-1 text-2xs text-gray-200 shadow-sm"
    aria-label="地図出典"
  >
    {GSI_TILE_ATTRIBUTION_JA}
  </div>
);
