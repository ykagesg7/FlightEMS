import { useCallback, useEffect, useRef, useState } from 'react';
import type { NotamSheetRequest } from '../planningNotamSheetContext';
import {
  fetchSwimNotams,
  type SwimNotamFetchResult,
} from '../../../../../services/swimNotam';

export type PlanningNotamFetchState = {
  loading: boolean;
  error: string | null;
  data: SwimNotamFetchResult | null;
};

export function usePlanningNotamFetch(request: NotamSheetRequest | null): PlanningNotamFetchState {
  const [state, setState] = useState<PlanningNotamFetchState>({
    loading: false,
    error: null,
    data: null,
  });
  const lastKeyRef = useRef<string | null>(null);

  const fetchKey = request
    ? `${request.kind}:${request.code.trim().toUpperCase()}`
    : null;

  const load = useCallback(async (req: NotamSheetRequest) => {
    const code = req.code.trim();
    if (!code) {
      setState({ loading: false, error: '検索コードが空です', data: null });
      return;
    }
    setState({ loading: true, error: null, data: null });
    const res = await fetchSwimNotams(
      req.kind === 'location'
        ? { location: code }
        : { keyword: code, andOrCondition: '0' },
    );
    if (!res.ok) {
      setState({ loading: false, error: res.error, data: res });
      return;
    }
    setState({ loading: false, error: null, data: res });
  }, []);

  useEffect(() => {
    if (!request || !fetchKey) {
      lastKeyRef.current = null;
      setState({ loading: false, error: null, data: null });
      return;
    }
    if (lastKeyRef.current === fetchKey) return;
    lastKeyRef.current = fetchKey;
    void load(request);
  }, [request, fetchKey, load]);

  return state;
}
