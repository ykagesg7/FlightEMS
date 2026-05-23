import React from 'react';
import L from 'leaflet';
import { MapCursorReadout } from './MapCursorReadout';
import type { NavaidDistanceInfo } from './MapCursorReadout';

type Props = {
  cursorPosition: L.LatLng | null;
  navaidInfos: NavaidDistanceInfo[];
};

export const MapCursorFooter: React.FC<Props> = ({ cursorPosition, navaidInfos }) => {
  return (
    <footer
      className="hud-overlay-panel shrink-0 border-t border-whiskyPapa-yellow/20 px-2 py-1 lg:hidden"
      role="status"
      aria-label="カーソル位置"
    >
      <MapCursorReadout cursorPosition={cursorPosition} navaidInfos={navaidInfos} />
    </footer>
  );
};
