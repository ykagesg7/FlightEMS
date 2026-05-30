import React, { useState } from 'react';
import L from 'leaflet';
import { formatDMS } from '../../../../utils';

export type NavaidDistanceInfo = {
  bearing: number;
  distance: number;
  id: string;
};

type Props = {
  cursorPosition: L.LatLng | null;
  navaidInfos: NavaidDistanceInfo[];
  /** Mobile HUD overlay: larger touch targets and text-xs base */
  mobileHud?: boolean;
};

export const MapCursorReadout: React.FC<Props> = ({
  cursorPosition,
  navaidInfos,
  mobileHud = false,
}) => {
  const [expanded, setExpanded] = useState(false);
  const textSize = mobileHud ? 'text-xs' : 'text-2xs sm:text-xs';
  const navaidButtonClass = mobileHud
    ? 'inline-flex min-h-[44px] min-w-[44px] shrink-0 items-center justify-center text-xs text-whiskyPapa-yellow/80 hover:text-whiskyPapa-yellow underline-offset-2 hover:underline'
    : 'shrink-0 text-whiskyPapa-yellow/80 hover:text-whiskyPapa-yellow underline-offset-2 hover:underline';

  if (!cursorPosition) {
    return (
      <span className={`${textSize} text-gray-400 font-mono whitespace-nowrap`}>
        位置(DMS/DD)：--
      </span>
    );
  }

  return (
    <div className="min-w-0 flex flex-col gap-0.5">
      <div className={`flex flex-wrap items-center gap-x-2 gap-y-0.5 ${textSize}`}>
        <span className="hud-text hud-readout font-mono whitespace-nowrap">
          {formatDMS(cursorPosition.lat, cursorPosition.lng)}
        </span>
        <span className="text-gray-300 font-mono whitespace-nowrap">
          {cursorPosition.lat.toFixed(4)}°N, {cursorPosition.lng.toFixed(4)}°E
        </span>
        {navaidInfos.length > 0 ? (
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            className={navaidButtonClass}
            aria-expanded={expanded}
          >
            NAVAID{expanded ? '▲' : '▼'}
          </button>
        ) : null}
      </div>
      {expanded && navaidInfos.length > 0 ? (
        <div className="flex flex-col gap-0.5 pl-0.5">
          {navaidInfos.map((info, index) => (
            <div key={info.id} className={`${textSize} text-gray-300 font-mono`}>
              from Navaid{index + 1}:{' '}
              <span className="hud-text hud-readout">
                {Math.round(info.bearing)}°/{info.distance}nm
              </span>{' '}
              {info.id}
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
};
