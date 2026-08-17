export type DemoTrackPoint = {
  lon: number;
  lat: number;
  altFt: number;
  /** デモ開始からの秒 */
  tSec: number;
};

/**
 * 九州沖付近を通過し、変更予定 N-1 空域に一時侵入する教育用デモ航跡。
 * （参考・架空コース）
 */
export const DEMO_TRACK_POINTS: DemoTrackPoint[] = [
  { lon: 129.35, lat: 34.95, altFt: 2500, tSec: 0 },
  { lon: 129.45, lat: 34.95, altFt: 2800, tSec: 60 },
  { lon: 129.55, lat: 34.95, altFt: 3200, tSec: 120 },
  { lon: 129.70, lat: 34.95, altFt: 4500, tSec: 180 },
  { lon: 129.85, lat: 34.95, altFt: 6000, tSec: 240 },
  { lon: 130.0, lat: 34.95, altFt: 8000, tSec: 300 },
  { lon: 130.15, lat: 34.9, altFt: 9000, tSec: 360 },
  { lon: 130.28, lat: 34.85, altFt: 7500, tSec: 420 },
  { lon: 130.4, lat: 34.75, altFt: 5000, tSec: 480 },
  { lon: 130.5, lat: 34.7, altFt: 3500, tSec: 540 },
];

export const DEMO_TRACK_NAME = 'Demo: pending N-1 transit (教育用架空)';
