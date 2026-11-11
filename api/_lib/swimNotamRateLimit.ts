const WINDOW_MS = 60_000;
const MAX_REQUESTS_PER_WINDOW = 30;

type WindowState = {
  windowStartMs: number;
  count: number;
};

const buckets = new Map<string, WindowState>();

export type SwimNotamRateLimitResult =
  | { ok: true }
  | { ok: false; retryAfterSeconds: number };

export function checkSwimNotamRateLimit(
  clientKey: string,
  nowMs = Date.now(),
): SwimNotamRateLimitResult {
  const key = clientKey.trim() || 'unknown';
  let bucket = buckets.get(key);
  if (!bucket || nowMs - bucket.windowStartMs >= WINDOW_MS) {
    bucket = { windowStartMs: nowMs, count: 0 };
    buckets.set(key, bucket);
  }
  bucket.count += 1;
  if (bucket.count > MAX_REQUESTS_PER_WINDOW) {
    const retryAfterSeconds = Math.max(
      1,
      Math.ceil((bucket.windowStartMs + WINDOW_MS - nowMs) / 1000),
    );
    return { ok: false, retryAfterSeconds };
  }
  return { ok: true };
}

export function __resetSwimNotamRateLimitForTests(): void {
  buckets.clear();
}
