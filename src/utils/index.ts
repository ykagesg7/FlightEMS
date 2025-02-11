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

export const SPEED_INCREMENT = 10;
export const ALTITUDE_INCREMENT = 1000;

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
  