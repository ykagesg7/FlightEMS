/**
 * Client-side `opens_at` gate for display (PR ③). Server RPC still enforces `opens_at` until elapsed.
 * @see scripts/database/INDEX.md — 表示上の opens_at 解除
 */
export function isSpiralNodeOpensAtLocked(
  opensAt: string | null | undefined,
  now: Date = new Date(),
): boolean {
  if (!opensAt) {
    return false;
  }
  const opensMs = Date.parse(opensAt);
  if (Number.isNaN(opensMs)) {
    return false;
  }
  return opensMs > now.getTime();
}
