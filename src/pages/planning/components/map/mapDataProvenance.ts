/** 計画地図のデータ出典・取得日表示（AIRAC 等は文書化されている場合のみ記載） */

export type DataProvenanceLine = {
  category: 'airspace' | 'notam' | 'weather';
  sourceLabel: string;
  fetchedAtIso?: string;
  airacLabel?: string;
  note?: string;
};

export const AIRSPACE_GEOJSON_SOURCE =
  'FlightAcademy 同梱 GeoJSON（public/geojson/・docs/GeoJSON_Waypoints_And_Assets.md）';

export const NOTAM_SWIM_SOURCE =
  '国交省 AIS・SWIM デジタル NOTAM（https://top.swim.mlit.go.jp/swim/）';

export const WEATHER_RAINVIEWER_SOURCE = 'RainViewer（https://www.rainviewer.com/）';

export const WEATHER_OPEN_METEO_SOURCE =
  'Open-Meteo（https://open-meteo.com/・非商用・参考）';

/** Preflight Briefing の METAR/TAF 自動取得（画面表示用） */
export const WEATHER_AWC_BRIEFING_SOURCE = 'NOAA AWC（aviationweather.gov）';

/** Preflight Briefing の SWIM NOTAM 自動取得（画面表示用） */
export const NOTAM_SWIM_BRIEFING_SOURCE = '国交省 AIS・SWIM デジタル NOTAM';

export const STATIC_AIRSPACE_GEOJSON_PATH = '/geojson/RestrictedAirspace.geojson';

export function formatProvenanceTimestamp(iso: string | undefined): string {
  if (!iso) return '—';
  try {
    return new Intl.DateTimeFormat('ja-JP', {
      dateStyle: 'medium',
      timeStyle: 'short',
      timeZone: 'Asia/Tokyo',
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

/** Briefing 欄用（例: 取得 19:06 JST） */
export function formatBriefingAcquiredLabel(iso: string | undefined): string | null {
  if (!iso) return null;
  try {
    const time = new Intl.DateTimeFormat('ja-JP', {
      hour: '2-digit',
      minute: '2-digit',
      hourCycle: 'h23',
      timeZone: 'Asia/Tokyo',
    }).format(new Date(iso));
    return `取得 ${time} JST`;
  } catch {
    return null;
  }
}

export function buildAirspaceProvenance(fetchedAtIso: string | undefined): DataProvenanceLine {
  return {
    category: 'airspace',
    sourceLabel: AIRSPACE_GEOJSON_SOURCE,
    fetchedAtIso,
    note: 'AIRAC 版はリポジトリに未記録のため表示しません。実運航は最新 AIP・NOTAM を確認してください。',
  };
}

export function buildNotamProvenance(fetchedAtIso: string | undefined): DataProvenanceLine {
  return {
    category: 'notam',
    sourceLabel: NOTAM_SWIM_SOURCE,
    fetchedAtIso,
    note: '参考表示。航行判断は公式ノータムで確認してください。',
  };
}

export function buildRainViewerProvenance(fetchedAtIso: string | undefined): DataProvenanceLine {
  return {
    category: 'weather',
    sourceLabel: WEATHER_RAINVIEWER_SOURCE,
    fetchedAtIso,
  };
}

export function buildWindProvenance(
  fetchedAtIso: string | undefined,
  forecastLabel?: string,
): DataProvenanceLine {
  return {
    category: 'weather',
    sourceLabel: WEATHER_OPEN_METEO_SOURCE,
    fetchedAtIso,
    note: forecastLabel,
  };
}

export const ITALY_NAVAIDS_GEOJSON_PATH = '/geojson/Navaids_ITALY.geojson';

/** イタリア NAVAID 同梱 GeoJSON（metadata 出典・AIRAC シート） */
export function buildItalyNavaidsProvenance(input: {
  sourceLabel: string;
  fetchedAtIso?: string;
  airacLabel?: string;
  extraNote?: string;
}): DataProvenanceLine {
  return {
    category: 'airspace',
    sourceLabel: input.sourceLabel,
    fetchedAtIso: input.fetchedAtIso,
    airacLabel: input.airacLabel,
    note:
      input.extraNote ??
      '実運航は最新 AIP Italia・NOTAM を確認してください。日本向け SWIM NOTAM リンクは参考です。',
  };
}
