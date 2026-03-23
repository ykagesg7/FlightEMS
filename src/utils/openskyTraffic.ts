/**
 * OpenSky Network /states/all 用の BBOX 処理と状態ベクトル整形。
 * インデックスは REST API の state vector に準拠（時点により拡張される場合あり）。
 *
 * 0: icao24, 1: callsign, 2: origin_country, 3: time_position, 4: last_contact,
 * 5: longitude, 6: latitude, 7: baro_altitude, 8: on_ground, 9: velocity,
 * 10: true_track, 11: vertical_rate, 12: sensors, 13: geo_altitude,
 * 14: squawk, 15: spi, 16: position_source
 */

export interface GeoBBox {
  south: number;
  west: number;
  north: number;
  east: number;
}

/** 日本域（沖縄〜北海道・周辺を含む概略矩形）。api/opensky-states と数値を同期すること。 */
export const JAPAN_BBOX: GeoBBox = {
  south: 20.0,
  west: 122.0,
  north: 46.5,
  east: 154.5,
};

/**
 * 地図表示範囲と日本域の積集合。無ければ null。
 */
export function intersectWithJapanBBox(bounds: GeoBBox): GeoBBox | null {
  const j = JAPAN_BBOX;
  const south = Math.max(bounds.south, j.south);
  const north = Math.min(bounds.north, j.north);
  const west = Math.max(bounds.west, j.west);
  const east = Math.min(bounds.east, j.east);
  if (south > north || west > east) return null;
  return { south, west, north, east };
}

/**
 * OpenSky クエリ用 lamin/lamax/lomin/lomax（緯度経度の min/max）
 */
export function toOpenSkyBboxParams(box: GeoBBox): { lamin: number; lamax: number; lomin: number; lomax: number } {
  return {
    lamin: box.south,
    lamax: box.north,
    lomin: box.west,
    lomax: box.east,
  };
}

export function buildStatesQueryParams(box: GeoBBox): URLSearchParams {
  const { lamin, lamax, lomin, lomax } = toOpenSkyBboxParams(box);
  const p = new URLSearchParams();
  p.set('lamin', String(lamin));
  p.set('lamax', String(lamax));
  p.set('lomin', String(lomin));
  p.set('lomax', String(lomax));
  return p;
}

export interface ParsedOpenSkyAircraft {
  icao24: string;
  callsign: string | null;
  latitude: number;
  longitude: number;
  baroAltitudeM: number | null;
  geoAltitudeM: number | null;
  velocityMs: number | null;
  trueTrackDeg: number | null;
  onGround: boolean;
  lastContact: number;
  timePosition: number | null;
}

function numOrNull(v: unknown): number | null {
  return typeof v === 'number' && Number.isFinite(v) ? v : null;
}

function strOrNull(v: unknown): string | null {
  return typeof v === 'string' ? v.trim() || null : null;
}

export function parseStateVector(row: unknown): ParsedOpenSkyAircraft | null {
  if (!Array.isArray(row) || row.length < 9) return null;
  const lat = numOrNull(row[6]);
  const lon = numOrNull(row[5]);
  if (lat === null || lon === null) return null;
  const icao = row[0];
  if (typeof icao !== 'string' || !icao) return null;
  /** OpenSky は last_contact / time_position が null の行があり得る。位置があれば表示する。 */
  let lastContact = numOrNull(row[4]);
  if (lastContact === null) lastContact = numOrNull(row[3]);
  if (lastContact === null) lastContact = Math.floor(Date.now() / 1000);
  return {
    icao24: icao,
    callsign: strOrNull(row[1]),
    latitude: lat,
    longitude: lon,
    baroAltitudeM: numOrNull(row[7]),
    geoAltitudeM: numOrNull(row[13]),
    velocityMs: numOrNull(row[9]),
    trueTrackDeg: numOrNull(row[10]),
    onGround: row[8] === true,
    lastContact,
    timePosition: numOrNull(row[3]),
  };
}

export interface OpenSkyStatesResponse {
  time: number;
  states: ParsedOpenSkyAircraft[];
}

export function parseOpenSkyStatesJson(data: unknown): OpenSkyStatesResponse {
  if (!data || typeof data !== 'object') {
    return { time: 0, states: [] };
  }
  const o = data as Record<string, unknown>;
  const time = typeof o.time === 'number' ? o.time : 0;
  const raw = o.states;
  if (!Array.isArray(raw)) {
    return { time, states: [] };
  }
  const states: ParsedOpenSkyAircraft[] = [];
  for (const row of raw) {
    const p = parseStateVector(row);
    if (p) states.push(p);
  }
  return { time, states };
}
