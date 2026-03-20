import type L from 'leaflet';
import { useEffect, useState } from 'react';

export function useMapCursorPosition(map: L.Map | null): L.LatLng | null {
  const [cursorPosition, setCursorPosition] = useState<L.LatLng | null>(null);

  useEffect(() => {
    if (!map) return;
    const onMouseMove = (e: L.LeafletMouseEvent) => {
      setCursorPosition(e.latlng);
    };
    map.on('mousemove', onMouseMove);
    return () => {
      map.off('mousemove', onMouseMove);
    };
  }, [map]);

  return cursorPosition;
}
