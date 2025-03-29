import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function calculateTAS(speed: number, altitude: number): number {
  // 高度をフィートからメートルに変換
  const altitudeMeters = altitude * 0.3048;

  // ISA標準に基づく高度における温度（ケルビン）
  const temperature = 288.15 - 0.0065 * altitudeMeters;

  // TASを計算：TAS = IAS * sqrt(T0 / T)
  const tas = speed * Math.sqrt(288.15 / temperature);

  return tas;
}

export function calculateMach(tas: number, altitude: number): number {
  // 高度をフィートからメートルに変換
  const altitudeMeters = altitude * 0.3048;

  // ISA標準に基づく高度における温度（ケルビン）
  const temperature = 288.15 - 0.0065 * altitudeMeters;

  // 音速を計算（m/s）：a = sqrt(gamma * R * T)
  const gamma = 1.4; // 比熱比
  const R = 287.05; // 空気の比気体定数 (J/(kg·K))
  const speedOfSound = Math.sqrt(gamma * R * temperature);

  // TASをknotsからm/sに変換
  const tasMs = tas * 0.514444;

  // Mach数を計算
  const mach = tasMs / speedOfSound;

  return mach;
}

export function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 3440.069; // 地球の半径（海里）
  const rad = (deg: number) => deg * Math.PI / 180;
  const dLat = rad(lat2 - lat1);
  const dLon = rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(rad(lat1)) * Math.cos(rad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export function formatTime(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = Math.floor(minutes % 60);
  return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
}

export function calculateETE(totalDistance: number, tas: number | undefined): number {
  return tas !== undefined && tas !== 0 ? (totalDistance / tas) * 60 : 0; // 分単位でETEを返す
}

export function calculateETA(departureTime: string | null | undefined, eteMinutes: number): string {
  if (departureTime && eteMinutes > 0) {
    const [hours, minutes] = departureTime.split(':').map(Number);
    let departureTimeInMinutes = hours * 60 + minutes;
    let etaMinutes = departureTimeInMinutes + eteMinutes;
    return formatTime(etaMinutes);
  }
  return '--:--';
}

export const groupBy = (items: any[], key: string) =>
  items.reduce((result: any, item: any) => {
    (result[item[key]] = result[item[key]] || []).push(item);
    return result;
  }, {});

/**
 * 緯度経度を DMS (度分秒) 形式に変換する関数 (表示形式変更)
 * @param {number} lat 緯度
 * @param {number} lng 経度
 * @returns {string} DMS形式の緯度経度文字列 (例: "位置(DMS)：N354336 E1404760")
 */
export const formatDMS = (lat: number, lng: number): string => {
  const latDir = lat >= 0 ? 'N' : 'S';
  const lngDir = lng >= 0 ? 'E' : 'W';

  const latDegrees = Math.floor(Math.abs(lat));
  const latMinutes = Math.floor((Math.abs(lat) - latDegrees) * 60);
  const latSeconds = Math.round((Math.abs(lat) - latDegrees - latMinutes / 60) * 3600);

  const lngDegrees = Math.floor(Math.abs(lng));
  const lngMinutes = Math.floor((Math.abs(lng) - lngDegrees) * 60);
  const lngSeconds = Math.round((Math.abs(lng) - lngDegrees - lngMinutes / 60) * 3600);

  // DMS 形式で返す (表示形式変更)
  return `位置(DMS)：${latDir}${String(latDegrees).padStart(2, '0')}${String(latMinutes).padStart(2, '0')}${String(latSeconds).padStart(2, '0')} ${lngDir}${String(lngDegrees).padStart(3, '0')}${String(lngMinutes).padStart(2, '0')}${String(lngSeconds).padStart(2, '0')}`;
};

/**
 * 緯度経度(Decimal)をDMS形式に変換
 * @param {number} lat 緯度(Decimal)
 * @param {number} lng 経度(Decimal)
 * @returns {{latDMS: string, lonDMS: string}} DMS形式の緯度経度
 */
export const decimalToDMS = (lat: number, lng: number): { latDMS: string, lonDMS: string } => {
  const latDir = lat >= 0 ? 'N' : 'S';
  const lngDir = lng >= 0 ? 'E' : 'W';

  const latDegrees = Math.floor(Math.abs(lat));
  const latMinutes = Math.floor((Math.abs(lat) - latDegrees) * 60);
  const latSeconds = Math.round((Math.abs(lat) - latDegrees - latMinutes / 60) * 3600);

  const lngDegrees = Math.floor(Math.abs(lng));
  const lngMinutes = Math.floor((Math.abs(lng) - lngDegrees) * 60);
  const lngSeconds = Math.round((Math.abs(lng) - lngDegrees - lngMinutes / 60) * 3600);

  const latDMS = `${latDir}${String(latDegrees).padStart(2, '0')}°${String(latMinutes).padStart(2, '0')}'${String(latSeconds).padStart(2, '0')}"`;
  const lonDMS = `${lngDir}${String(lngDegrees).padStart(3, '0')}°${String(lngMinutes).padStart(2, '0')}'${String(lngSeconds).padStart(2, '0')}"`;

  return { latDMS, lonDMS };
};

/**
 * DMS形式の緯度経度をDecimal形式に変換
 * @param {string} dms 緯度経度のDMS文字列 (例: "N35°43'36"")
 * @param {boolean} isLatitude 緯度かどうか (経度の場合はfalse)
 * @returns {number | null} Decimal形式の緯度または経度、変換失敗時はnull
 */
export const dmsToDecimal = (dms: string, isLatitude: boolean): number | null => {
  const regex = isLatitude 
    ? /([NS])(\d{2})°(\d{2})'(\d{2})"/i 
    : /([EW])(\d{3})°(\d{2})'(\d{2})"/i;
  const match = dms.toUpperCase().match(regex);

  if (!match) return null;

  const hemisphere = match[1];
  const degrees = parseInt(match[2], 10);
  const minutes = parseInt(match[3], 10);
  const seconds = parseInt(match[4], 10);

  // 値の範囲チェックを追加
  if (
    (isLatitude && degrees > 90) ||
    (!isLatitude && degrees > 180) ||
    minutes >= 60 ||
    seconds >= 60
  ) {
    return null;
  }

  let decimal = degrees + minutes / 60 + seconds / 3600;
  return (hemisphere === 'S' || hemisphere === 'W') ? -decimal : decimal;
};

export const SPEED_INCREMENT = 5;
export const ALTITUDE_INCREMENT = 500;

export const parseTimeString = (timeString: string): Date => {
  const [hours, minutes] = timeString.split(':').map(Number);
  const date = new Date();
  date.setHours(hours);
  date.setMinutes(minutes);
  return date;
};

export const formatDMSValue = (
  degrees: string,
  minutes: string,
  seconds: string,
  latitude?: boolean
): string => {
  return degrees.padStart(latitude ? 2 : 3, '0') + 
         minutes.padStart(2, '0') + 
         seconds.padStart(2, '0');
};

export const parseDMSValue = (
  dmsValue: string, 
  latitude?: boolean
) => {
  const regex = latitude ? 
    /([NS])?(\d{2})?(\d{2})?(\d{2})?([NS])?/i : 
    /([EW])?(\d{3})?(\d{2})?(\d{2})?([EW])?/i;
  const match = dmsValue.match(regex);

  if (match) {
    return {
      degrees: match[2] || '',
      minutes: match[3] || '',
      seconds: match[4] || ''
    };
  }
  return null;
};

export const DEFAULT_CENTER = { lat: 35.6762, lng: 139.6503 }; // 東京の座標
export const DEFAULT_ZOOM = 6;

export const getNavaidColor = (type: string) => {
  switch (type) {
    case 'TACAN':
      return 'red';
    case 'VOR':
      return 'blue';
    case 'VORTAC':
      return 'purple';
    default:
      return 'gray';
  }
};

export function calculateCASFromTAS(tas: number, altitude: number): number {
  // 高度をフィートからメートルに変換
  const altitudeMeters = altitude * 0.3048;

  // ISA標準に基づく高度における温度（ケルビン）
  const temperature = 288.15 - 0.0065 * altitudeMeters;

  // CASを計算：CAS = TAS / sqrt(T0 / T)
  const cas = tas / Math.sqrt(288.15 / temperature);

  return cas;
}

export function calculateTASFromMach(mach: number, altitude: number): number {
  // 高度をフィートからメートルに変換
  const altitudeMeters = altitude * 0.3048;

  // ISA標準に基づく高度における温度（ケルビン）
  const temperature = 288.15 - 0.0065 * altitudeMeters;

  // 音速を計算（m/s）：a = sqrt(gamma * R * T)
  const gamma = 1.4; // 比熱比
  const R = 287.05; // 空気の比気体定数 (J/(kg·K))
  const speedOfSound = Math.sqrt(gamma * R * temperature);

  // Mach数からTASをm/sで計算
  const tasMs = mach * speedOfSound;

  // m/sからknotsに変換
  const tas = tasMs / 0.514444;

  return tas;
}

// --- 新しい高精度計算モデル ---

// 定数
const GAMMA = 1.4; // 比熱比
const R_AIR = 287.05287; // J/(kg·K)
const T0_K = 288.15; // K (15 °C)
const P0_PA = 101325.0; // Pa
const RHO0_KGM3 = P0_PA / (R_AIR * T0_K); // kg/m^3
const G0_MPS2 = 9.80665; // m/s^2
const LAMBDA_KPM = -0.0065; // K/m (対流圏)
const H_TROP_M = 11000.0; // m
const T_TROP_K = T0_K + LAMBDA_KPM * H_TROP_M; // K

// 単位変換係数
const KT_TO_MPS = 0.514444;
const FT_TO_M = 0.3048;
const C_TO_K = 273.15;

// マッハ数と速度の微調整単位
export const MACH_INCREMENT = 0.001; // マッハ数の微調整単位 (0.001)
export const TAS_INCREMENT = 1;      // TASの微調整単位 (1 kt)

/**
 * 高精度計算結果のインターフェース
 */
export interface AirspeedResult {
  easKt: number;       // 等価対気速度 (ノット)
  tasKt: number;       // 真対気速度 (ノット)
  mach: number;        // マッハ数
  satK: number;        // 計算された静大気温度 (ケルビン)
  pressurePa: number;  // 計算された静圧 (パスカル)
  densityKgm3: number; // 計算された空気密度 (kg/m^3)
}

/**
 * IAS (CASと近似), 高度, 地上気温, 地上標高から EAS, TAS, Mach を高精度で計算する。
 * ISA偏差と圧縮性を考慮する。
 * @param iasKt 指示対気速度 (ノット) - CASとして扱われる
 * @param altitudeFt 気圧高度 (フィート)
 * @param groundTempC 地上の気温 (摂氏)
 * @param groundElevationFt 地上の標高 (フィート)
 * @returns 計算結果オブジェクト (AirspeedResult) または計算不能の場合 null
 */
export function calculateAirspeeds(
  iasKt: number,
  altitudeFt: number,
  groundTempC: number,
  groundElevationFt: number
): AirspeedResult | null {

  // Step 1: 単位変換
  const casMps = iasKt * KT_TO_MPS;
  const hM = altitudeFt * FT_TO_M;
  const elevM = groundElevationFt * FT_TO_M;
  const tGroundK = groundTempC + C_TO_K;

  // Step 2: ISA偏差 (ΔT_isa) の計算
  const tStdElevK = T0_K + LAMBDA_KPM * Math.min(elevM, H_TROP_M);
  const deltaTisaK = tGroundK - tStdElevK;

  // Step 3: 飛行高度における静大気温度 (SAT) の計算
  let tStdAltK: number;
  if (hM <= H_TROP_M) {
    tStdAltK = T0_K + LAMBDA_KPM * hM;
  } else {
    tStdAltK = T_TROP_K;
  }
  let tAltK = tStdAltK + deltaTisaK;
  tAltK = Math.max(tAltK, 1.0); // 物理的な下限値 (絶対零度以上)

  // Step 4: 飛行高度における静圧 (P) の計算
  let pAltPa: number;
  try {
    if (hM <= H_TROP_M) {
      if (T0_K <= 0) return null; // Avoid division by zero or log of non-positive
      const base = 1 + LAMBDA_KPM * hM / T0_K;
      if (base <= 0) return null; // Avoid power of non-positive base if exponent is not integer
      pAltPa = P0_PA * Math.pow(base, -G0_MPS2 / (R_AIR * LAMBDA_KPM));
    } else {
      if (T0_K <= 0 || T_TROP_K <= 0) return null; // Avoid invalid temperature values
      const pTropBase = T_TROP_K / T0_K;
      if (pTropBase <= 0) return null; // Avoid power of non-positive base
      const pTrop = P0_PA * Math.pow(pTropBase, -G0_MPS2 / (R_AIR * LAMBDA_KPM));
      pAltPa = pTrop * Math.exp(-G0_MPS2 * (hM - H_TROP_M) / (R_AIR * T_TROP_K));
    }
    if (isNaN(pAltPa) || pAltPa < 0) return null; // Pressure must be non-negative
  } catch (e) {
    console.error("Error calculating pressure:", e);
    return null;
  }

  // Step 5: CAS -> EAS の計算 (圧縮性考慮)
  let easMps: number;
  let easKt: number;
  try {
    const a0Mps = Math.sqrt(GAMMA * R_AIR * T0_K);
    if (a0Mps === 0) return null; // Avoid division by zero

    const casRatioSq = Math.pow(casMps / a0Mps, 2);
    // Check if the base for the power is valid
    const pressureRatioBase = 1 + (GAMMA - 1) / 2 * casRatioSq;
    if (pressureRatioBase <= 0 && GAMMA / (GAMMA - 1) % 1 !== 0) return null; // Avoid power of non-positive base for non-integer exponent
    const pressureRatioTerm = Math.pow(pressureRatioBase, GAMMA / (GAMMA - 1));
    const qC = P0_PA * (pressureRatioTerm - 1);

    if (isNaN(qC) || RHO0_KGM3 <= 0) return null; // Check validity before sqrt
    const qCDivRho = 2 * qC / RHO0_KGM3;
    if (qCDivRho < 0) return null; // Avoid sqrt of negative number

    easMps = Math.sqrt(qCDivRho);
    easKt = easMps / KT_TO_MPS;
  } catch (e) {
    console.error("Error calculating EAS:", e);
    return null;
  }

  // Step 6: EAS -> TAS の計算
  let tasMps: number;
  let tasKt: number;
  let rhoAltKgm3: number;
  try {
    if (tAltK === 0) return null; // Avoid division by zero
    rhoAltKgm3 = pAltPa / (R_AIR * tAltK);
    if (isNaN(rhoAltKgm3) || rhoAltKgm3 <= 0 || RHO0_KGM3 <= 0) return null; // Density must be positive

    const sigma = rhoAltKgm3 / RHO0_KGM3;
    if (sigma <= 0) return null; // Avoid sqrt of non-positive

    tasMps = easMps / Math.sqrt(sigma);
    tasKt = tasMps / KT_TO_MPS;
  } catch (e) {
    console.error("Error calculating TAS:", e);
    return null;
  }

  // Step 7: Mach数の計算
  let mach: number;
  try {
    if (tAltK <= 0) return null; // Temperature must be positive for sound speed calculation
    const aAltMps = Math.sqrt(GAMMA * R_AIR * tAltK);
    if (aAltMps === 0) return null; // Avoid division by zero

    mach = tasMps / aAltMps;
  } catch (e) {
    console.error("Error calculating Mach:", e);
    return null;
  }

  // Check final results for NaN or Infinity
  if (isNaN(easKt) || isNaN(tasKt) || isNaN(mach) || !isFinite(easKt) || !isFinite(tasKt) || !isFinite(mach) || isNaN(rhoAltKgm3)) {
      console.error("Invalid final calculation result.");
      return null;
  }

  return {
    easKt: easKt,
    tasKt: tasKt,
    mach: mach,
    satK: tAltK,
    pressurePa: pAltPa,
    densityKgm3: rhoAltKgm3,
  };
}

/**
 * TAS, 高度, 地上気温, 地上標高から CAS を高精度で計算する。
 * ISA偏差と圧縮性を考慮する。
 * @param tasKt 真対気速度 (ノット)
 * @param altitudeFt 気圧高度 (フィート)
 * @param groundTempC 地上の気温 (摂氏)
 * @param groundElevationFt 地上の標高 (フィート)
 * @returns 計算された CAS (ノット) または計算不能の場合 null
 */
export function calculateCASFromTASPrecise(
  tasKt: number,
  altitudeFt: number,
  groundTempC: number,
  groundElevationFt: number
): number | null {
  const tasMps = tasKt * KT_TO_MPS;
  const hM = altitudeFt * FT_TO_M;
  const elevM = groundElevationFt * FT_TO_M;
  const tGroundK = groundTempC + C_TO_K;

  // Step 2: ISA偏差
  const tStdElevK = T0_K + LAMBDA_KPM * Math.min(elevM, H_TROP_M);
  const deltaTisaK = tGroundK - tStdElevK;

  // Step 3: 飛行高度の SAT
  let tStdAltK: number;
  let tAltK: number;
  if (hM <= H_TROP_M) {
    tStdAltK = T0_K + LAMBDA_KPM * hM;
  } else {
    tStdAltK = T_TROP_K;
  }
  tAltK = tStdAltK + deltaTisaK;
  tAltK = Math.max(tAltK, 1.0);

  // Step 4: 飛行高度の静圧
  let pAltPa: number;
  try {
    if (hM <= H_TROP_M) {
      if (T0_K <= 0) return null;
      const base = 1 + LAMBDA_KPM * hM / T0_K;
      if (base <= 0) return null;
      pAltPa = P0_PA * Math.pow(base, -G0_MPS2 / (R_AIR * LAMBDA_KPM));
    } else {
      if (T0_K <= 0 || T_TROP_K <= 0) return null;
      const pTropBase = T_TROP_K / T0_K;
      if (pTropBase <= 0) return null;
      pAltPa = P0_PA * Math.pow(pTropBase, -G0_MPS2 / (R_AIR * LAMBDA_KPM));
    }
    if (isNaN(pAltPa) || pAltPa < 0) return null;
  } catch (e) {
    console.error("Error calculating pressure:", e);
    return null;
  }

  // Step 6 の逆算 (TAS -> EAS)
  let easMps: number;
  try {
    if (tAltK === 0) return null;
    const rhoAltKgm3 = pAltPa / (R_AIR * tAltK);
    if (isNaN(rhoAltKgm3) || rhoAltKgm3 <= 0 || RHO0_KGM3 <= 0) return null;
    const sigma = rhoAltKgm3 / RHO0_KGM3;
    if (sigma <= 0) return null;
    easMps = tasMps * Math.sqrt(sigma);
  } catch (e) {
    console.error("Error calculating EAS from TAS:", e);
    return null;
  }

  // Step 5 の逆算 (EAS -> CAS)
  let casKt: number;
  try {
    if (RHO0_KGM3 <= 0) return null;
    const qC = 0.5 * RHO0_KGM3 * Math.pow(easMps, 2);
    const pressureRatio = qC / P0_PA + 1;
    // Check if base for power is valid and exponent is valid
    if (pressureRatio <= 0 && (GAMMA - 1) / GAMMA % 1 !== 0) return null; // Base must be positive for non-integer exponent
    const exponent = (GAMMA - 1) / GAMMA;
    const insideTermBase = Math.pow(pressureRatio, exponent);
    if (isNaN(insideTermBase)) return null;
    const insideTerm = insideTermBase - 1;
    if (isNaN(insideTerm) || (GAMMA - 1) === 0) return null; // Check validity and avoid division by zero
    const casRatioSq = (2 / (GAMMA - 1)) * insideTerm;
    if (casRatioSq < 0) return null; // Cannot take sqrt of negative number

    const a0Mps = Math.sqrt(GAMMA * R_AIR * T0_K);
    const casMps = a0Mps * Math.sqrt(casRatioSq);
    casKt = casMps / KT_TO_MPS;
  } catch (e) {
    console.error("Error calculating CAS from EAS:", e);
    return null;
  }

  if (isNaN(casKt) || !isFinite(casKt)) return null;

  return casKt;
}

/**
 * Mach, 高度, 地上気温, 地上標高から TAS を高精度で計算する。
 * ISA偏差を考慮する。
 * @param mach マッハ数
 * @param altitudeFt 気圧高度 (フィート)
 * @param groundTempC 地上の気温 (摂氏)
 * @param groundElevationFt 地上の標高 (フィート)
 * @returns 計算された TAS (ノット) または計算不能の場合 null
 */
export function calculateTASFromMachPrecise(
  mach: number,
  altitudeFt: number,
  groundTempC: number,
  groundElevationFt: number
): number | null {
  const hM = altitudeFt * FT_TO_M;
  const elevM = groundElevationFt * FT_TO_M;
  const tGroundK = groundTempC + C_TO_K;

  // Step 2: ISA偏差
  const tStdElevK = T0_K + LAMBDA_KPM * Math.min(elevM, H_TROP_M);
  const deltaTisaK = tGroundK - tStdElevK;

  // Step 3: 飛行高度の SAT
  let tStdAltK: number;
  let tAltK: number;
  if (hM <= H_TROP_M) {
    tStdAltK = T0_K + LAMBDA_KPM * hM;
  } else {
    tStdAltK = T_TROP_K;
  }
  tAltK = tStdAltK + deltaTisaK;
  tAltK = Math.max(tAltK, 1.0);

  // Step 7 の逆算 (Mach -> TAS)
  let tasKt: number;
  try {
    if (tAltK <= 0) return null; // Temperature must be positive for sound speed calculation
    const aAltMps = Math.sqrt(GAMMA * R_AIR * tAltK);
    const tasMps = mach * aAltMps;
    tasKt = tasMps / KT_TO_MPS;
  } catch (e) {
    console.error("Error calculating TAS from Mach:", e);
    return null;
  }

  if (isNaN(tasKt) || !isFinite(tasKt)) return null;

  return tasKt;
}

/**
 * TASを1kt単位で増加させるために必要なCASの変化量を計算する
 * @param currentCasKt 現在のCAS (ノット)
 * @param altitudeFt 飛行高度 (フィート)
 * @param groundTempC 地上気温 (摂氏)
 * @param groundElevationFt 地上標高 (フィート)
 * @returns CASの変化量 (ノット)
 */
export function calculateCASIncrementForTAS(
  currentCasKt: number,
  altitudeFt: number,
  groundTempC: number,
  groundElevationFt: number
): number {
  // 現在のスピード情報を計算
  const currentAirspeeds = calculateAirspeeds(currentCasKt, altitudeFt, groundTempC, groundElevationFt);
  if (!currentAirspeeds) return 1; // 計算できない場合はデフォルト値を返す

  // TASを1kt増加させた場合のCASを計算
  const targetTasKt = currentAirspeeds.tasKt + 1;
  const newCasKt = calculateCASFromTASPrecise(targetTasKt, altitudeFt, groundTempC, groundElevationFt);
  if (!newCasKt) return 1; // 計算できない場合はデフォルト値を返す

  // CASの変化量を計算して返す
  return newCasKt - currentCasKt;
}

/**
 * Machを0.001単位で増加させるために必要なCASの変化量を計算する
 * @param currentCasKt 現在のCAS (ノット)
 * @param altitudeFt 飛行高度 (フィート)
 * @param groundTempC 地上気温 (摂氏)
 * @param groundElevationFt 地上標高 (フィート)
 * @returns CASの変化量 (ノット)
 */
export function calculateCASIncrementForMach(
  currentCasKt: number,
  altitudeFt: number,
  groundTempC: number,
  groundElevationFt: number
): number {
  // 現在のスピード情報を計算
  const currentAirspeeds = calculateAirspeeds(currentCasKt, altitudeFt, groundTempC, groundElevationFt);
  if (!currentAirspeeds) return 1; // 計算できない場合はデフォルト値を返す

  // Machを0.001増加させた場合のTASを計算
  const targetMach = currentAirspeeds.mach + 0.001;
  const targetTasKt = calculateTASFromMachPrecise(targetMach, altitudeFt, groundTempC, groundElevationFt);
  if (!targetTasKt) return 1; // 計算できない場合はデフォルト値を返す

  // TASからCASを計算
  const newCasKt = calculateCASFromTASPrecise(targetTasKt, altitudeFt, groundTempC, groundElevationFt);
  if (!newCasKt) return 1; // 計算できない場合はデフォルト値を返す

  // CASの変化量を計算して返す
  return newCasKt - currentCasKt;
}
  