/**
 * SWIM デジタルノータム検索の HTTP 層共有（Vercel handler・Vite dev・dev-weather-server）
 */
import { searchSwimDigitalNotam, type SwimNotamQuery } from './swimNotamCore';

function firstQuery(v: string | string[] | undefined): string | undefined {
  if (v === undefined) return undefined;
  const s = Array.isArray(v) ? v[0] : v;
  const t = typeof s === 'string' ? s.trim() : '';
  return t.length > 0 ? t : undefined;
}

export function parseSwimNotamSearchQuery(
  query: Record<string, string | string[] | undefined>,
): SwimNotamQuery {
  const location = firstQuery(query.location);
  const keyword = firstQuery(query.keyword);
  let fir = firstQuery(query.fir);
  let nof = firstQuery(query.nof);
  const andOrRaw = firstQuery(query.andOrCondition);

  const includeRawXmlParam = firstQuery(query.includeRawXml);

  const q: SwimNotamQuery = {
    location,
    keyword,
    fir,
    nof,
    andOrCondition: andOrRaw === '1' ? '1' : andOrRaw === '0' ? '0' : undefined,
    /** `includeRawXml=0` で原文 XML を応答から省略 */
    includeRawXml: includeRawXmlParam !== '0',
  };

  if (keyword && q.andOrCondition === undefined) {
    q.andOrCondition = '0';
  }

  const japaneseHint =
    (location && /^RJ[A-Z0-9]{2}$/i.test(location)) || Boolean(keyword);
  if (japaneseHint && !fir) fir = 'RJJJ';
  if (japaneseHint && !nof) nof = 'RJAAYNYX';
  q.fir = fir;
  q.nof = nof;
  return q;
}

export type SwimNotamHttpDispatchResult = {
  status: number;
  body: unknown;
  cacheControl?: string;
};

export async function dispatchSwimNotamSearch(
  query: Record<string, string | string[] | undefined>,
): Promise<SwimNotamHttpDispatchResult> {
  const swimQuery = parseSwimNotamSearchQuery(query);
  const result = await searchSwimDigitalNotam(swimQuery);

  if (result.ok === true) {
    return {
      status: 200,
      cacheControl: 'private, no-store',
      body: {
        ok: true,
        current: result.current,
        future: result.future,
        swimErrorCode: result.swimErrorCode,
        totalCount: result.totalCount,
        disclaimer:
          '参考情報です。実際の航行には公式のノータム類を必ず確認してください。',
      },
    };
  }

  const status =
    result.httpStatus === 401
      ? 401
      : result.httpStatus === 403
        ? 403
        : result.error.includes('タイムアウト')
          ? 504
          : 502;
  return {
    status,
    body: {
      ok: false,
      error: result.error,
      swimErrorCode: result.swimErrorCode,
    },
  };
}

/** Vite loadEnv 結果などから process.env に SWIM 系を補完（未設定時のみ） */
export function mergeSwimEnvFromLoaded(env: Record<string, string>): void {
  for (const k of ['SWIM_LOGIN_ID', 'SWIM_LOGIN_PASSWORD', 'SWIM_SEARCH_USER_ID'] as const) {
    const v = env[k];
    if (typeof v === 'string' && v.length > 0 && !process.env[k]) {
      process.env[k] = v;
    }
  }
}
