import React, { useCallback, useState } from 'react';
import type L from 'leaflet';
import { MapAirspaceSheet } from './MapAirspaceSheet';
import { useMapSelectionPan } from './hooks/useMapSelectionPan';
import type { AirspaceSelection } from './planningAirspaceTypes';

type Props = {
  map: L.Map | null;
  selection: AirspaceSelection | null;
  cruiseAltitudeFt: number;
  onClearSelection: () => void;
};

export const MapMapOverlays: React.FC<Props> = ({
  map,
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

  if (!showAirspace || !selection) return null;

  return (
    <div className="pointer-events-none absolute inset-0 z-[10001]" aria-hidden={false}>
      <MapAirspaceSheet
        selection={selection}
        cruiseAltitudeFt={cruiseAltitudeFt}
        onClearSelection={onClearSelection}
        onSheetHeightChange={handleSheetHeightChange}
      />
    </div>
  );
};
