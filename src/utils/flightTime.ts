/**
 * フライト計画の出発時刻など（hh:mm または hh:mm:ss）を当日の Date に変換する。
 * 無効な入力は `new Date(NaN)` を返す。
 */
export function parseFlightPlanTime(timeStr: string): Date {
  if (!timeStr || timeStr === '--' || typeof timeStr !== 'string') {
    return new Date(NaN);
  }
  const parts = timeStr.split(':').map((p) => parseInt(p, 10));
  const now = new Date();
  const date = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  if (parts.length === 2) {
    const [h, m] = parts;
    if (!isNaN(h) && !isNaN(m)) {
      date.setHours(h, m, 0, 0);
    } else {
      return new Date(NaN);
    }
  } else if (parts.length === 3) {
    const [h, m, s] = parts;
    if (!isNaN(h) && !isNaN(m) && !isNaN(s)) {
      date.setHours(h, m, s, 0);
    } else {
      return new Date(NaN);
    }
  } else {
    return new Date(NaN);
  }
  if (isNaN(date.getTime())) {
    return new Date(NaN);
  }
  return date;
}
