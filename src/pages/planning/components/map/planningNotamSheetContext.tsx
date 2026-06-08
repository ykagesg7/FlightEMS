import type L from 'leaflet';
import { createContext, useContext } from 'react';

export type NotamSheetRequest = {
  code: string;
  kind: 'location' | 'keyword';
  latlng?: L.LatLng;
};

export type PlanningNotamSheetContextValue = {
  request: NotamSheetRequest | null;
  openNotamSheet: (req: NotamSheetRequest) => void;
  closeNotamSheet: () => void;
  mapInstance: L.Map | null;
  setMapInstance: (map: L.Map | null) => void;
};

export const PlanningNotamSheetContext = createContext<PlanningNotamSheetContextValue | null>(
  null,
);

export function usePlanningNotamSheet(): PlanningNotamSheetContextValue {
  const ctx = useContext(PlanningNotamSheetContext);
  if (!ctx) {
    throw new Error('usePlanningNotamSheet must be used within PlanningNotamSheetContext');
  }
  return ctx;
}

export function usePlanningNotamSheetOptional(): PlanningNotamSheetContextValue | null {
  return useContext(PlanningNotamSheetContext);
}

/** Leaflet ポップアップ（React 外）から NOTAM シートを開く */
let imperativeOpenNotamSheet: ((req: NotamSheetRequest) => void) | null = null;

export function registerPlanningNotamSheetOpener(
  fn: ((req: NotamSheetRequest) => void) | null,
): void {
  imperativeOpenNotamSheet = fn;
}

export function requestOpenPlanningNotamSheet(req: NotamSheetRequest): void {
  imperativeOpenNotamSheet?.(req);
}
