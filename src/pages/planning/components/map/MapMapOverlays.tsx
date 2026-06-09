import React, { useCallback, useState } from 'react';
import type L from 'leaflet';
import { MapAirspaceSheet } from './MapAirspaceSheet';
import { MapCursorHudOverlay } from './MapCursorHudOverlay';
import { useMapSelectionPan } from './hooks/useMapSelectionPan';
import type { NavaidDistanceInfo } from './MapCursorReadout';
import type { AirspaceSelection } from './planningAirspaceTypes';

type Props = {
  map: L.Map | null;
  cursorPosition: L.LatLng | null;
  navaidInfos: NavaidDistanceInfo[];
  selection: AirspaceSelection | null;
  cruiseAltitudeFt: number;
  onClearSelection: () => void;
};

export const MapMapOverlays: React.FC<Props> = ({
  map,
  cursorPosition,
  navaidInfos,
  selection,
  cruiseAltitudeFt,
  onClearSelection,
}) => {
  const [sheetHeightPx, setSheetHeightPx] = useState(0);

  const handleSheetHeightChange = useCallback((height: number) => {
    setSheetHeightPx(height);
  }, []);

  useMapSelectionPan(map, selection, sheetHeightPx);

  const showAirspace = selection != null && selection.hits.length > 0;

  return (
    <div className="pointer-events-none absolute inset-0 z-[10001]" aria-hidden={false}>
      <MapCursorHudOverlay cursorPosition={cursorPosition} navaidInfos={navaidInfos} />
      {showAirspace && selection ? (
        <MapAirspaceSheet
          selection={selection}
          cruiseAltitudeFt={cruiseAltitudeFt}
          onClearSelection={onClearSelection}
          onSheetHeightChange={handleSheetHeightChange}
        />
      ) : null}
    </div>
  );
};
