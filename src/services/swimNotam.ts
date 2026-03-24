import type { Geometry } from 'geojson';
import { getDevApiBase } from '@/utils/devApiBase';

export type SwimNotamItem = {
  key: string;
  summary: string;
  headline?: string;
  noteSnippet?: string;
  detailNotes?: string[];
  locationText?: string;
  verticalText?: string;
  eventCode?: string;
  featureLabel?: string;
  rawXml?: string;
  rawXmlTruncated?: boolean;
  geometry?: Geometry;
  begin?: string;
  end?: string;
};

export type SwimNotamFetchOk = {
  ok: true;
  current: SwimNotamItem[];
  future: SwimNotamItem[];
  disclaimer?: string;
  swimErrorCode?: string;
  totalCount?: string;
};

export type SwimNotamFetchErr = {
  ok: false;
  error: string;
  swimErrorCode?: string;
};

export type SwimNotamFetchResult = SwimNotamFetchOk | SwimNotamFetchErr;

function buildNotamSearchUrl(search: URLSearchParams): string {
  const isProd = import.meta.env.PROD;
  const deploymentDomain =
    isProd && typeof window !== 'undefined' ? window.location.origin : null;
  const devApi = getDevApiBase();
  const path = `/api/swim-notam-search?${search.toString()}`;
  if (deploymentDomain) return `${deploymentDomain}${path}`;
  if (devApi) return `${devApi}${path}`;
  return path;
}

/**
 * Planning 地図用: SWIM デジタルノータム（サーバプロキシ経由）
 */
export async function fetchSwimNotams(params: {
  location?: string;
  keyword?: string;
  andOrCondition?: '0' | '1';
  /** `0` で原文 XML を省略（サーバの includeRawXml=0） */
  includeRawXml?: boolean;
}): Promise<SwimNotamFetchResult> {
  const qs = new URLSearchParams();
  if (params.location?.trim()) qs.set('location', params.location.trim());
  if (params.keyword?.trim()) {
    qs.set('keyword', params.keyword.trim());
    qs.set('andOrCondition', params.andOrCondition ?? '0');
  }
  if (params.includeRawXml === false) qs.set('includeRawXml', '0');
  const url = buildNotamSearchUrl(qs);

  try {
    const res = await fetch(url, {
      method: 'GET',
      headers: { Accept: 'application/json' },
    });
    const json: unknown = await res.json().catch(() => null);
    if (!json || typeof json !== 'object') {
      return { ok: false, error: '応答の解析に失敗しました' };
    }
    const o = json as Record<string, unknown>;
    if (o.ok === true) {
      return {
        ok: true,
        current: Array.isArray(o.current) ? (o.current as SwimNotamItem[]) : [],
        future: Array.isArray(o.future) ? (o.future as SwimNotamItem[]) : [],
        disclaimer: typeof o.disclaimer === 'string' ? o.disclaimer : undefined,
        swimErrorCode: typeof o.swimErrorCode === 'string' ? o.swimErrorCode : undefined,
        totalCount: typeof o.totalCount === 'string' ? o.totalCount : undefined,
      };
    }
    const errMsg = typeof o.error === 'string' ? o.error : `HTTP ${res.status}`;
    return {
      ok: false,
      error: errMsg,
      swimErrorCode: typeof o.swimErrorCode === 'string' ? o.swimErrorCode : undefined,
    };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : 'ネットワークエラー',
    };
  }
}
