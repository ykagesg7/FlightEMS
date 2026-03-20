import L from 'leaflet';
import 'leaflet-groupedlayercontrol';
import 'leaflet-groupedlayercontrol/dist/leaflet.groupedlayercontrol.min.css';
import 'leaflet/dist/leaflet.css';
import { MapContainer } from 'react-leaflet';
import { FlightPlan } from '../../../../types/index';
import { DEFAULT_CENTER, DEFAULT_ZOOM, formatDMS } from '../../../../utils';
import icon from '/images/marker-icon.png';
import iconShadow from '/images/marker-shadow.png';
import React, { useCallback, useState } from 'react';
import { useCursorNearestNavaids } from './hooks/useCursorNearestNavaids';
import { useMapCursorPosition } from './hooks/useMapCursorPosition';
import { useMapDoubleClickWaypoint } from './hooks/useMapDoubleClickWaypoint';
import { useNavaidGeojson } from './hooks/useNavaidGeojson';
import { useRegionsIndex } from './hooks/useRegionsIndex';
import { MapTabContent } from './MapTabContent';
import './mapStyles.css';

const MAP_DBLCLICK_HINT_DISMISSED_KEY = 'planning-map-dblclick-hint-dismissed';

const DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

interface MapTabProps {
  flightPlan: FlightPlan;
  setFlightPlan: React.Dispatch<React.SetStateAction<FlightPlan>>;
}

const MapTab: React.FC<MapTabProps> = ({ flightPlan, setFlightPlan }) => {
  const [map, setMap] = useState<L.Map | null>(null);
  const [hintVisible, setHintVisible] = useState(() => {
    try {
      return localStorage.getItem(MAP_DBLCLICK_HINT_DISMISSED_KEY) !== '1';
    } catch {
      return true;
    }
  });
  const dismissHint = useCallback(() => {
    try {
      localStorage.setItem(MAP_DBLCLICK_HINT_DISMISSED_KEY, '1');
    } catch {
      /* ignore */
    }
    setHintVisible(false);
  }, []);

  const regions = useRegionsIndex();
  const navaidData = useNavaidGeojson();
  useMapDoubleClickWaypoint(map, setFlightPlan);
  const cursorPosition = useMapCursorPosition(map);
  const navaidInfos = useCursorNearestNavaids(cursorPosition, navaidData);

  return (
    <div className="relative h-[calc(100vh-4rem)] bg-[color:var(--bg)] rounded-lg shadow-sm overflow-hidden flex flex-col">
      {hintVisible && (
        <div
          className="shrink-0 z-[10000] flex items-start gap-2 px-2 py-1.5 sm:px-3 sm:py-2 bg-whiskyPapa-black-dark/95 border-b border-whiskyPapa-yellow/30 text-2xs sm:text-xs text-gray-200"
          role="status"
        >
          <span className="flex-1 pt-0.5">
            地図上を<strong className="text-whiskyPapa-yellow font-medium">ダブルクリック</strong>
            すると、その位置にウェイポイントを追加できます。
          </span>
          <button
            type="button"
            onClick={dismissHint}
            className="shrink-0 rounded px-2 py-0.5 text-whiskyPapa-yellow hover:bg-whiskyPapa-yellow/10 border border-whiskyPapa-yellow/40 text-2xs sm:text-xs"
            aria-label="ヒントを閉じる"
          >
            閉じる
          </button>
        </div>
      )}
      <div className="relative flex-1 min-h-0">
        <MapContainer
          center={[DEFAULT_CENTER.lat, DEFAULT_CENTER.lng]}
          zoom={DEFAULT_ZOOM}
          className="h-full w-full"
          ref={setMap}
          worldCopyJump={true}
        >
          <MapTabContent
            flightPlan={flightPlan}
            map={map}
            setFlightPlan={setFlightPlan}
            regions={regions}
          />
        </MapContainer>
        <div className="absolute bottom-2 left-2 z-[9999] pointer-events-none hud-overlay-panel text-[color:var(--text-primary)] px-2 py-1 rounded max-w-full sm:max-w-sm md:max-w-md">
          {cursorPosition ? (
            <div className="text-xs sm:text-sm space-y-0.5">
              <div className="text-2xs sm:text-xs hud-text hud-readout">{formatDMS(cursorPosition.lat, cursorPosition.lng)}</div>
              <div className="text-2xs sm:text-xs">
                位置(Degree)： {cursorPosition.lat.toFixed(4)}°N, {cursorPosition.lng.toFixed(4)}°E
              </div>
              {navaidInfos.map((info, index) => (
                <div key={index} className="text-2xs sm:text-xs truncate">
                  位置(from Navaid{index + 1})：{' '}
                  <span className="hud-text hud-readout">
                    {Math.round(info.bearing)}°/{info.distance}nm
                  </span>{' '}
                  {info.id}
                </div>
              ))}
            </div>
          ) : (
            <span className="text-xs sm:text-sm">位置(DMS/ DD)：--</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default MapTab;
