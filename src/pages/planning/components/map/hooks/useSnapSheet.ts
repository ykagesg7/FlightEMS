import { useCallback, useEffect, useMemo, useRef, useState, type MutableRefObject } from 'react';
import { useMediaQuery } from '../../../../../hooks/useMediaQuery';
import {
  computeSnapHeights,
  getInitialSnap,
  resolveNearestSnap,
  type SnapHeights,
  type SnapPoint,
} from '../snapSheetUtils';

type UseSnapSheetResult = {
  snap: SnapPoint;
  setSnap: (next: SnapPoint) => void;
  heights: SnapHeights;
  sheetHeightPx: number;
  onDragEnd: (currentHeightPx: number) => void;
};

export function useSnapSheet(
  active: boolean,
  hitCount: number,
  selectionKey: string,
  userAdjustedSnap: MutableRefObject<boolean>,
): UseSnapSheetResult {
  const isDesktop = useMediaQuery('(min-width: 768px)');
  const [viewportHeight, setViewportHeight] = useState(
    typeof window !== 'undefined' ? window.innerHeight : 800,
  );
  const [snap, setSnap] = useState<SnapPoint>(() => getInitialSnap(hitCount));
  const prevSelectionKey = useRef(selectionKey);

  useEffect(() => {
    const onResize = () => setViewportHeight(window.innerHeight);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const heights = useMemo(
    () => computeSnapHeights(viewportHeight, isDesktop),
    [viewportHeight, isDesktop],
  );

  useEffect(() => {
    if (!active) return;
    if (prevSelectionKey.current !== selectionKey) {
      prevSelectionKey.current = selectionKey;
      userAdjustedSnap.current = false;
      setSnap(getInitialSnap(hitCount));
    } else if (!userAdjustedSnap.current) {
      setSnap(getInitialSnap(hitCount));
    }
  }, [active, hitCount, selectionKey, userAdjustedSnap]);

  const onDragEnd = useCallback(
    (currentHeightPx: number) => {
      setSnap(resolveNearestSnap(currentHeightPx, heights));
    },
    [heights],
  );

  return {
    snap,
    setSnap,
    heights,
    sheetHeightPx: heights[snap],
    onDragEnd,
  };
}
