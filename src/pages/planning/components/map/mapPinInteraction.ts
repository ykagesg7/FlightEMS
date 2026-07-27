/**
 * 地図背景クリックかどうか（空域・マーカー等の interactive は除外）。
 */
export function shouldPinFromMapClick(target: EventTarget | null): boolean {
  if (!(target instanceof Element)) return true;
  if (target.closest('.leaflet-interactive')) return false;
  if (target.closest('.map-airspace-sheet')) return false;
  if (target.closest('.map-notam-sheet')) return false;
  if (target.closest('.map-cursor-detail-sheet')) return false;
  if (target.closest('.map-center-crosshair')) return false;
  return true;
}
