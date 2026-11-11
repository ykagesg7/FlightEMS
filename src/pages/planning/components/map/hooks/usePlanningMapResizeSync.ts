import type L from 'leaflet';
import { type RefObject, useEffect } from 'react';

/** タブ表示・レイアウト変更後に Leaflet のタイル再計算を行う */
export function usePlanningMapResizeSync(
  map: L.Map | null,
  containerRef: RefObject<HTMLElement | null>,
): void {
  useEffect(() => {
    if (!map || !containerRef.current) return;

    const sync = () => {
      map.invalidateSize({ pan: false });
    };

    const frame = window.requestAnimationFrame(sync);
    const ro = new ResizeObserver(() => {
      sync();
    });
    ro.observe(containerRef.current);

    return () => {
      window.cancelAnimationFrame(frame);
      ro.disconnect();
    };
  }, [map, containerRef]);
}
