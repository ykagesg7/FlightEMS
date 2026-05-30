import React from 'react';
import { MapCursorReadout } from './MapCursorReadout';
import type { NavaidDistanceInfo } from './MapCursorReadout';
import type L from 'leaflet';

type Props = {
  cursorPosition: L.LatLng | null;
  navaidInfos: NavaidDistanceInfo[];
};

export const MapCursorHudOverlay: React.FC<Props> = ({ cursorPosition, navaidInfos }) => {
  return (
    <div
      className="map-cursor-hud pointer-events-auto absolute inset-x-2 top-12 z-[10001] lg:hidden"
      role="status"
      aria-label="カーソル位置"
    >
      <div className="hud-overlay-panel map-cursor-hud-panel rounded-lg px-3 py-2 shadow-lg backdrop-blur-sm">
        <MapCursorReadout cursorPosition={cursorPosition} navaidInfos={navaidInfos} mobileHud />
      </div>
    </div>
  );
};
