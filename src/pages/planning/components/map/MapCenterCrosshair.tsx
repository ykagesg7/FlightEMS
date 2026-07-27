import React from 'react';

/**
 * タッチ端末向け：画面中央の照準（地図パンで下の経緯度が変わる）。
 * pointer-events: none（地図操作を妨げない）。
 */
export const MapCenterCrosshair: React.FC = () => (
  <div
    className="map-center-crosshair pointer-events-none absolute inset-0 z-[900] flex items-center justify-center"
    aria-hidden
  >
    <div className="map-center-crosshair__mark" />
  </div>
);
