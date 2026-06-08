import L from 'leaflet';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { MapNotamSheet } from './MapNotamSheet';
import {
  PlanningNotamSheetContext,
  registerPlanningNotamSheetOpener,
  type NotamSheetRequest,
  type PlanningNotamSheetContextValue,
} from './planningNotamSheetContext';

type Props = {
  children: React.ReactNode;
  /** モバイル等で地図タブへ切替（任意） */
  onFocusMapTab?: () => void;
};

export const PlanningNotamSheetProvider: React.FC<Props> = ({ children, onFocusMapTab }) => {
  const [request, setRequest] = useState<NotamSheetRequest | null>(null);
  const [mapInstance, setMapInstance] = useState<L.Map | null>(null);
  const [sheetHeightPx, setSheetHeightPx] = useState(0);

  const openNotamSheet = useCallback(
    (req: NotamSheetRequest) => {
      onFocusMapTab?.();
      setRequest(req);
    },
    [onFocusMapTab],
  );

  const closeNotamSheet = useCallback(() => {
    setRequest(null);
  }, []);

  useEffect(() => {
    registerPlanningNotamSheetOpener(openNotamSheet);
    return () => registerPlanningNotamSheetOpener(null);
  }, [openNotamSheet]);

  const contextValue = useMemo<PlanningNotamSheetContextValue>(
    () => ({
      request,
      openNotamSheet,
      closeNotamSheet,
      mapInstance,
      setMapInstance,
    }),
    [request, openNotamSheet, closeNotamSheet, mapInstance],
  );

  return (
    <PlanningNotamSheetContext.Provider value={contextValue}>
      {children}
      {request ? (
        <div
          className="pointer-events-none fixed inset-x-0 bottom-0 z-[20000]"
          style={{ paddingBottom: sheetHeightPx > 0 ? 0 : undefined }}
        >
          <MapNotamSheet
            map={mapInstance}
            request={request}
            onClose={closeNotamSheet}
            onSheetHeightChange={setSheetHeightPx}
          />
        </div>
      ) : null}
    </PlanningNotamSheetContext.Provider>
  );
};
