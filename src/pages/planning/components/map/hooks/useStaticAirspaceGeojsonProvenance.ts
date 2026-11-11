import { useEffect, useState } from 'react';
import { STATIC_AIRSPACE_GEOJSON_PATH } from '../mapDataProvenance';

export type StaticAirspaceProvenanceState = {
  loading: boolean;
  lastModifiedIso: string | null;
};

/**
 * 空域レイヤー用 GeoJSON の HTTP Last-Modified（取得日の目安）。
 * AIRAC 版は GeoJSON に含まれないため返さない。
 */
/** 空域 GeoJSON の取得日（A1）。`alwaysFetch` でレイヤー未選択でも取得する。 */
export function useStaticAirspaceGeojsonProvenance(
  enabled: boolean,
  alwaysFetch = false,
): StaticAirspaceProvenanceState {
  const [state, setState] = useState<StaticAirspaceProvenanceState>({
    loading: false,
    lastModifiedIso: null,
  });

  const shouldFetch = enabled || alwaysFetch;

  useEffect(() => {
    if (!shouldFetch) return;
    let cancelled = false;
    setState((s) => ({ ...s, loading: true }));
    void (async () => {
      try {
        const res = await fetch(STATIC_AIRSPACE_GEOJSON_PATH, { method: 'HEAD' });
        const lm = res.headers.get('last-modified');
        if (cancelled) return;
        setState({
          loading: false,
          lastModifiedIso: lm ? new Date(lm).toISOString() : null,
        });
      } catch {
        if (!cancelled) {
          setState({ loading: false, lastModifiedIso: null });
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [shouldFetch]);

  return state;
}
