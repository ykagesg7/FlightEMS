import L from 'leaflet';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useDebouncedCallback } from 'use-debounce';
import { approxGeopotentialFeetIsaFromPressureHpa } from '../../../../../utils/pressureAltitudeIsa';
import { intersectWithJapanBBox } from '../../../../../utils/openskyTraffic';
import {
  WIND_GRID_DEFAULT_N,
  WIND_GRID_DEFAULT_PRESSURE_HPA,
  fetchWindGridForBounds,
  nearestWindGridPoint,
  type WindGridPoint,
} from '../../../../../utils/windGridOpenMeteo';

const DEBOUNCE_MS = 700;

export type WindGridMapOverlayModel = {
  loading: boolean;
  error: string | null;
  pressureHpa: number;
  approxAltitudeFt: number;
  approxFlightLevel: number;
  refTimeUtc: Date | null;
  centerSample: { windFromDeg: number; speedKt: number } | null;
};

/**
 * 上層風バーブ用の格子風を取得（moveend デバウンス・キャッシュは windGridOpenMeteo）。
 */
export function usePlanningMapWindGrid(
  map: L.Map | null,
  fetchEnabled: boolean
): {
  gridPoints: WindGridPoint[];
  overlay: WindGridMapOverlayModel | null;
} {
  const [gridPoints, setGridPoints] = useState<WindGridPoint[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refTimeUtc, setRefTimeUtc] = useState<Date | null>(null);
  const [centerSample, setCenterSample] = useState<{
    windFromDeg: number;
    speedKt: number;
  } | null>(null);

  const pressureHpa = WIND_GRID_DEFAULT_PRESSURE_HPA;
  const approxAltitudeFt = useMemo(
    () => Math.round(approxGeopotentialFeetIsaFromPressureHpa(pressureHpa)),
    [pressureHpa]
  );
  const approxFlightLevel = useMemo(
    () => Math.round(approxAltitudeFt / 100),
    [approxAltitudeFt]
  );

  const fetchGenRef = useRef(0);

  const runFetch = useCallback(async () => {
    if (!map) return;
    const gen = ++fetchGenRef.current;
    const b = map.getBounds();
    const box = intersectWithJapanBBox({
      south: b.getSouth(),
      west: b.getWest(),
      north: b.getNorth(),
      east: b.getEast(),
    });
    if (!box) {
      if (gen !== fetchGenRef.current) return;
      setGridPoints([]);
      setCenterSample(null);
      setError(null);
      setLoading(false);
      setRefTimeUtc(null);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const rt = new Date();
      const pts = await fetchWindGridForBounds(
        box.south,
        box.west,
        box.north,
        box.east,
        WIND_GRID_DEFAULT_N,
        WIND_GRID_DEFAULT_PRESSURE_HPA,
        rt
      );
      if (gen !== fetchGenRef.current) return;
      setGridPoints(pts);
      setRefTimeUtc(rt);
      const c = map.getCenter();
      const near = nearestWindGridPoint(c.lat, c.lng, pts);
      setCenterSample(
        near ? { windFromDeg: near.windFromDeg, speedKt: near.speedKt } : null
      );
    } catch (e) {
      if (gen !== fetchGenRef.current) return;
      const msg = e instanceof Error ? e.message : String(e);
      setError(msg);
      setGridPoints([]);
      setCenterSample(null);
      setRefTimeUtc(null);
    } finally {
      if (gen === fetchGenRef.current) {
        setLoading(false);
      }
    }
  }, [map]);

  const debouncedFetch = useDebouncedCallback(runFetch, DEBOUNCE_MS);

  useEffect(() => {
    if (!fetchEnabled) {
      debouncedFetch.cancel();
      setGridPoints([]);
      setCenterSample(null);
      setError(null);
      setLoading(false);
      setRefTimeUtc(null);
      return;
    }

    void runFetch();

    const onMoveEnd = () => {
      void debouncedFetch();
    };
    map?.on('moveend', onMoveEnd);

    return () => {
      map?.off('moveend', onMoveEnd);
      debouncedFetch.cancel();
    };
  }, [map, fetchEnabled, runFetch, debouncedFetch]);

  const overlay: WindGridMapOverlayModel | null = useMemo(() => {
    if (!fetchEnabled) return null;
    return {
      loading,
      error,
      pressureHpa,
      approxAltitudeFt,
      approxFlightLevel,
      refTimeUtc,
      centerSample,
    };
  }, [
    fetchEnabled,
    loading,
    error,
    pressureHpa,
    approxAltitudeFt,
    approxFlightLevel,
    refTimeUtc?.getTime() ?? null,
    centerSample?.windFromDeg ?? null,
    centerSample?.speedKt ?? null,
  ]);

  return { gridPoints, overlay };
}
