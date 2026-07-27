import type L from 'leaflet';
import Leaflet from 'leaflet';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useMediaQuery } from '../../../../../hooks/useMediaQuery';
import { shouldPinFromMapClick } from '../mapPinInteraction';

export type MapPinnedPositionState = {
  /** Footer / 詳細 / NAVAID に使う位置（固定点、または coarse 時の地図中心プレビュー） */
  displayPosition: L.LatLng | null;
  pinnedPosition: L.LatLng | null;
  isPinned: boolean;
  /** タッチ優先端末（中央クロスヘア＋固定ボタン） */
  isCoarsePointer: boolean;
  pinCenter: () => void;
  clearPin: () => void;
};

/**
 * 地図上の座標固定。
 * - マウス（fine）: 地図背景クリックで固定
 * - タッチ（coarse）: 中央クロスヘア下の中心座標をプレビューし、「固定」で確定
 */
export function useMapPinnedPosition(map: L.Map | null): MapPinnedPositionState {
  const isCoarsePointer = useMediaQuery('(pointer: coarse)');
  const [pinnedPosition, setPinnedPosition] = useState<L.LatLng | null>(null);
  const [mapCenter, setMapCenter] = useState<L.LatLng | null>(null);

  const clearPin = useCallback(() => {
    setPinnedPosition(null);
  }, []);

  const pinCenter = useCallback(() => {
    if (!map) return;
    setPinnedPosition(map.getCenter());
  }, [map]);

  // 地図中心の追跡（coarse プレビュー用。pinned 中も移動に備えて更新しておく）
  useEffect(() => {
    if (!map) {
      setMapCenter(null);
      return;
    }
    const syncCenter = () => setMapCenter(map.getCenter());
    syncCenter();
    map.on('move', syncCenter);
    map.on('zoom', syncCenter);
    return () => {
      map.off('move', syncCenter);
      map.off('zoom', syncCenter);
    };
  }, [map]);

  // fine pointer: クリックで固定
  useEffect(() => {
    if (!map || isCoarsePointer) return;

    const onMapClick = (e: L.LeafletMouseEvent) => {
      if (!shouldPinFromMapClick(e.originalEvent.target)) return;
      setPinnedPosition(e.latlng);
    };

    map.on('click', onMapClick);
    return () => {
      map.off('click', onMapClick);
    };
  }, [map, isCoarsePointer]);

  // 固定マーカー
  useEffect(() => {
    if (!map || !pinnedPosition) return;

    const marker = Leaflet.circleMarker(pinnedPosition, {
      radius: 6,
      color: '#f5d76e',
      weight: 2,
      fillColor: '#f5d76e',
      fillOpacity: 0.85,
      interactive: false,
      className: 'map-pin-marker',
    });
    marker.addTo(map);

    return () => {
      marker.remove();
    };
  }, [map, pinnedPosition]);

  const displayPosition = useMemo(() => {
    if (pinnedPosition) return pinnedPosition;
    if (isCoarsePointer) return mapCenter;
    return null;
  }, [pinnedPosition, isCoarsePointer, mapCenter]);

  return {
    displayPosition,
    pinnedPosition,
    isPinned: pinnedPosition !== null,
    isCoarsePointer,
    pinCenter,
    clearPin,
  };
}
