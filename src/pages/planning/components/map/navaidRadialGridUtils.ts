import { calculateOffsetPoint } from '../../../../utils/offset';

/** NAVAID ラジアル／DME 網の最大距離（海里） */
export const NAVAID_RADIAL_MAX_NM = 100;
/** 磁方位ラジアルの刻み（度） */
export const NAVAID_RADIAL_STEP_DEG = 10;
/** DME リングの刻み（海里） */
export const NAVAID_DME_STEP_NM = 10;
/** ラジアル折れ線のサンプル間隔（海里） */
export const NAVAID_RADIAL_SAMPLE_STEP_NM = 10;

/**
 * 方位ラベルを置く距離（海里）。
 * 000/090/180/270 は 10 nm 刻み、その他は 50 nm と 100 nm。
 * DME 距離ラベルは 010/100/190/280 上（方位ラベルと重ならないよう分離）。
 */
export const NAVAID_RADIAL_MAJOR_BEARINGS = [0, 90, 180, 270] as const;
export const NAVAID_RADIAL_MAJOR_LABEL_STEP_NM = 10;
export const NAVAID_RADIAL_MINOR_LABEL_NM = [50, 100] as const;
/** DME 距離ラベルを置く磁方位（主要方位から 10° ずらし） */
export const NAVAID_DME_LABEL_BEARINGS = [10, 100, 190, 280] as const;

export type LatLon = { lat: number; lon: number };

/** 0, 10, … 350 */
export function listRadialBearings(
  stepDeg: number = NAVAID_RADIAL_STEP_DEG,
): number[] {
  const out: number[] = [];
  for (let b = 0; b < 360; b += stepDeg) {
    out.push(b);
  }
  return out;
}

/** 10, 20, … maxNm */
export function listDmeRingNm(
  stepNm: number = NAVAID_DME_STEP_NM,
  maxNm: number = NAVAID_RADIAL_MAX_NM,
): number[] {
  const out: number[] = [];
  for (let d = stepNm; d <= maxNm; d += stepNm) {
    out.push(d);
  }
  return out;
}

export function isMajorRadialBearing(magneticBearingDeg: number): boolean {
  const b = ((Math.round(magneticBearingDeg) % 360) + 360) % 360;
  return (NAVAID_RADIAL_MAJOR_BEARINGS as readonly number[]).includes(b);
}

export function isDmeLabelBearing(magneticBearingDeg: number): boolean {
  const b = ((Math.round(magneticBearingDeg) % 360) + 360) % 360;
  return (NAVAID_DME_LABEL_BEARINGS as readonly number[]).includes(b);
}

/** 指定磁方位ラジアルに出す方位ラベル距離（海里）一覧 */
export function radialLabelDistancesNm(
  magneticBearingDeg: number,
  maxNm: number = NAVAID_RADIAL_MAX_NM,
): number[] {
  // DME 距離ラベル用ラジアルには方位数字を置かない（重なり防止）
  if (isDmeLabelBearing(magneticBearingDeg)) {
    return [];
  }
  if (isMajorRadialBearing(magneticBearingDeg)) {
    return listDmeRingNm(NAVAID_RADIAL_MAJOR_LABEL_STEP_NM, maxNm);
  }
  return [...NAVAID_RADIAL_MINOR_LABEL_NM].filter((d) => d <= maxNm);
}

/** DME 距離ラベルを置く磁方位一覧 */
export function dmeLabelBearings(): number[] {
  return [...NAVAID_DME_LABEL_BEARINGS];
}

/**
 * 基準点から磁方位に沿った折れ線（Leaflet [lat, lng][]）。
 * 各サンプルは calculateOffsetPoint（教育用固定磁気偏差）を用いる。
 */
export function buildRadialPolyline(
  origin: LatLon,
  magneticBearingDeg: number,
  maxNm: number = NAVAID_RADIAL_MAX_NM,
  sampleStepNm: number = NAVAID_RADIAL_SAMPLE_STEP_NM,
): [number, number][] {
  const pts: [number, number][] = [[origin.lat, origin.lon]];
  for (let d = sampleStepNm; d <= maxNm; d += sampleStepNm) {
    const p = calculateOffsetPoint(origin.lat, origin.lon, magneticBearingDeg, d);
    pts.push([p.lat, p.lon]);
  }
  return pts;
}

/** ラジアル端点（ラベル用） */
export function radialEndpoint(
  origin: LatLon,
  magneticBearingDeg: number,
  distanceNm: number = NAVAID_RADIAL_MAX_NM,
): LatLon {
  const p = calculateOffsetPoint(origin.lat, origin.lon, magneticBearingDeg, distanceNm);
  return { lat: p.lat, lon: p.lon };
}

export function formatRadialLabel(magneticBearingDeg: number): string {
  return String(Math.round(magneticBearingDeg) % 360).padStart(3, '0');
}

export function formatDmeLabel(distanceNm: number): string {
  return `${distanceNm}`;
}
