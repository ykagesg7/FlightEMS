export type SnapPoint = 'peek' | 'half' | 'full';

export type SnapHeights = Record<SnapPoint, number>;

const SNAP_ORDER: SnapPoint[] = ['peek', 'half', 'full'];

export function computeSnapHeights(viewportHeight: number, isDesktop: boolean): SnapHeights {
  return {
    // デスクトップ: ヘッダー1行のみ / モバイル: ドラッグハンドル + ヘッダー
    peek: isDesktop ? 56 : 108,
    half: viewportHeight * (isDesktop ? 0.32 : 0.38),
    full: Math.min(viewportHeight * 0.72, 520),
  };
}

export function getInitialSnap(_hitCount: number): SnapPoint {
  return 'peek';
}

export function resolveNearestSnap(draggedHeightPx: number, heights: SnapHeights): SnapPoint {
  let best: SnapPoint = 'peek';
  let minDist = Number.POSITIVE_INFINITY;

  for (const key of SNAP_ORDER) {
    const dist = Math.abs(heights[key] - draggedHeightPx);
    if (dist < minDist) {
      minDist = dist;
      best = key;
    }
  }

  return best;
}

export function cycleSnap(current: SnapPoint, direction: 'up' | 'down'): SnapPoint {
  const idx = SNAP_ORDER.indexOf(current);
  if (direction === 'up') {
    return SNAP_ORDER[Math.min(idx + 1, SNAP_ORDER.length - 1)];
  }
  return SNAP_ORDER[Math.max(idx - 1, 0)];
}
