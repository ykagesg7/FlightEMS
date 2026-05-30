/** Returns negative Y pan (pixels) to shift map up so latlng stays above bottom sheet. */
export function computePanByY(
  pointY: number,
  mapHeightPx: number,
  bottomPaddingPx: number,
): number {
  if (mapHeightPx <= 0 || bottomPaddingPx <= 0) return 0;

  const visibleCenterY = (mapHeightPx - bottomPaddingPx) / 2;
  if (pointY <= visibleCenterY) return 0;

  const delta = pointY - visibleCenterY;
  const maxPan = bottomPaddingPx * 0.5;
  return -Math.min(delta, maxPan);
}
