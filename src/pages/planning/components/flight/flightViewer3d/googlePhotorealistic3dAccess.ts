/**
 * Google Photorealistic 3D Tiles — 本番では Pro 限定（将来）。
 * 開発中は Vite dev で Pro なしでも明示トグル時のみ利用可能にする。
 */
export function canUseGooglePhotorealistic3D(isProUser: boolean): boolean {
  if (isProUser) return true;
  if (import.meta.env.DEV) return true;
  return false;
}

/** Pro アップセルモーダルを出すか（本番の非 Pro のみ） */
export function shouldShowGooglePhotorealistic3dProUpsell(isProUser: boolean): boolean {
  return !canUseGooglePhotorealistic3D(isProUser);
}
