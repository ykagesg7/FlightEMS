/**
 * SWIM デジタルノータム検索の共有ロジック（Vercel api/lib バンドル用）
 *
 * - ログイン: https://top.swim.mlit.go.jp/swim/webapi/login （付録01）
 * - 検索: https://web.swim.mlit.go.jp/f2dnrq/web/search （付録04）
 *
 * undici fetch の代替として IPv4 明示 + node:https（openskyStatesCore と同方針）
 */
import dns from 'node:dns';
import https from 'node:https';
import type { ClientRequest, IncomingHttpHeaders } from 'node:http';
import type { Geometry } from 'geojson';
import { XMLParser } from 'fast-xml-parser';
import { extractGeometryFromDigitalNotamXml } from './swimNotamGeometry';

try {
  if (typeof dns.setDefaultResultOrder === 'function') {
    dns.setDefaultResultOrder('ipv4first');
  }
} catch {
  /* ignore */
}

const SWIM_LOGIN_URL = 'https://top.swim.mlit.go.jp/swim/webapi/login';
const SWIM_SEARCH_BASE = 'https://web.swim.mlit.go.jp/f2dnrq/web/search';

const LOGIN_TIMEOUT_MS = 14000;
const SEARCH_TIMEOUT_MS = 22000;
/** JSON 応答肥大化防止のため 1 件あたりの原文 XML 上限 */
const RAW_XML_MAX_CHARS = 32768;
const DETAIL_NOTES_MAX = 5;
const DETAIL_NOTE_MIN_SCORE = 1;

const xmlParser = new XMLParser({
  ignoreAttributes: false,
  removeNSPrefix: true,
  attributeNamePrefix: '@_',
  trimValues: true,
});

export type SwimNotamSummary = {
  /** 一覧用の安定キー */
  key: string;
  /** 一覧・互換用の一行要約（概要＋本文断片） */
  summary: string;
  /** イベント設計子等から組み立てた短い概要 */
  headline?: string;
  /** note / CDATA 等から取れた本文断片 */
  noteSnippet?: string;
  /** 地点・イベントID（ICAO 等） */
  locationText?: string;
  /** 高度・垂直制限の要約（取れた場合） */
  verticalText?: string;
  /** 抽出したイベント設計子（例 RJFF_TWCL.UNS.JP_20260306） */
  eventCode?: string;
  /** hasMember 直下の AIXM 要素名由来の表示ラベル */
  featureLabel?: string;
  /** 折りたたみ用の本文候補（スコア上位・重複除去） */
  detailNotes?: string[];
  /** 原文 XML（includeRawXml 時。上限で切り詰めあり） */
  rawXml?: string;
  rawXmlTruncated?: boolean;
  /** GML posList/pos から推定した幾何（参考・日本域ヒューリスティック） */
  geometry?: Geometry;
  begin?: string;
  end?: string;
};

export type SwimNotamSearchOk = {
  ok: true;
  current: SwimNotamSummary[];
  future: SwimNotamSummary[];
  swimErrorCode: string;
  totalCount?: string;
};

export type SwimNotamSearchErr = {
  ok: false;
  error: string;
  httpStatus?: number;
  swimErrorCode?: string;
};

export type SwimNotamSearchResult = SwimNotamSearchOk | SwimNotamSearchErr;

export type SwimNotamQuery = {
  location?: string;
  keyword?: string;
  fir?: string;
  nof?: string;
  /** keyword 指定時は必須（0: AND, 1: OR） */
  andOrCondition?: '0' | '1';
  /**
   * false のとき rawXml を応答に含めない（幾何・要約のみ）。
   * クエリ `includeRawXml=0` で指定。
   */
  includeRawXml?: boolean;
};

type HttpsTextResult = {
  statusCode: number;
  headers: IncomingHttpHeaders;
  text: string;
};

function httpsRequestTextIpv4(options: {
  urlStr: string;
  method: 'GET' | 'POST';
  headers: Record<string, string>;
  body?: string;
  timeoutMs: number;
}): Promise<HttpsTextResult> {
  const { urlStr, method, headers, body, timeoutMs } = options;
  const u = new URL(urlStr);
  return new Promise((resolve, reject) => {
    let settled = false;
    let req: ClientRequest | null = null;

    const fail = (err: Error) => {
      if (settled) return;
      settled = true;
      clearTimeout(deadline);
      req?.destroy();
      reject(err);
    };

    const ok = (v: HttpsTextResult) => {
      if (settled) return;
      settled = true;
      clearTimeout(deadline);
      resolve(v);
    };

    const deadline = setTimeout(() => {
      fail(Object.assign(new Error('SWIM upstream timeout'), { name: 'TimeoutError' }));
    }, timeoutMs);

    dns.promises
      .lookup(u.hostname, { family: 4 })
      .then(({ address }) => {
        if (settled) return;
        const payload = body ?? '';
        const h: Record<string, string> = { ...headers, Host: u.hostname };
        if (method === 'POST' && payload.length > 0) {
          h['Content-Length'] = String(Buffer.byteLength(payload, 'utf8'));
        }

        req = https.request(
          {
            host: address,
            servername: u.hostname,
            port: u.port || 443,
            path: `${u.pathname}${u.search}`,
            method,
            headers: h,
            agent: false,
          },
          (res) => {
            const chunks: Buffer[] = [];
            res.on('data', (ch) => chunks.push(ch));
            res.on('end', () => {
              ok({
                statusCode: res.statusCode ?? 0,
                headers: res.headers,
                text: Buffer.concat(chunks).toString('utf8'),
              });
            });
            res.on('error', (err) => {
              fail(err instanceof Error ? err : new Error(String(err)));
            });
          }
        );

        req.on('error', (err) => {
          fail(err instanceof Error ? err : new Error(String(err)));
        });

        if (payload.length > 0) req.write(payload, 'utf8');
        req.end();
      })
      .catch((err) => {
        fail(err instanceof Error ? err : new Error(String(err)));
      });
  });
}

/** Asia/Tokyo の YYYYMMDDhhmm（仕様書の日時形式） */
export function formatSwimJstDateTime(d: Date): string {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Tokyo',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).formatToParts(d);
  const g = (t: Intl.DateTimeFormatPartTypes) =>
    parts.find((p) => p.type === t)?.value?.replace(/\D/g, '') ?? '';
  const y = g('year');
  const mo = g('month').padStart(2, '0');
  const da = g('day').padStart(2, '0');
  const h = g('hour').padStart(2, '0');
  const mi = g('minute').padStart(2, '0');
  if (!y || mo.length !== 2 || da.length !== 2 || h.length !== 2 || mi.length !== 2) {
    return formatSwimJstDateTimeFallback(d);
  }
  return `${y}${mo}${da}${h}${mi}`;
}

function formatSwimJstDateTimeFallback(d: Date): string {
  const t = d.getTime() + 9 * 60 * 60 * 1000;
  const u = new Date(t);
  const y = u.getUTCFullYear();
  const mo = String(u.getUTCMonth() + 1).padStart(2, '0');
  const da = String(u.getUTCDate()).padStart(2, '0');
  const h = String(u.getUTCHours()).padStart(2, '0');
  const mi = String(u.getUTCMinutes()).padStart(2, '0');
  return `${y}${mo}${da}${h}${mi}`;
}

function extractCookiePair(setCookie: string[] | undefined): string | null {
  if (!setCookie?.length) return null;
  const found = new Map<string, string>();
  for (const line of setCookie) {
    const name = line.match(/^(MSMSI|MSMAI)=/);
    if (!name) continue;
    const semi = line.indexOf(';');
    const pair = semi >= 0 ? line.slice(0, semi) : line;
    const eq = pair.indexOf('=');
    if (eq < 0) continue;
    found.set(pair.slice(0, eq), pair.slice(eq + 1));
  }
  const msi = found.get('MSMSI');
  const mai = found.get('MSMAI');
  if (!msi || !mai) return null;
  return `MSMSI=${msi}; MSMAI=${mai}`;
}

function parseIsoInstant(s: string): Date | null {
  const t = Date.parse(s.trim());
  return Number.isFinite(t) ? new Date(t) : null;
}

/** SWIM デジタルノータムのイベント設計子（XML 内に出現する形式） */
function extractPrimaryEventDesignator(xml: string): string | undefined {
  const longForm = xml.match(/\bRJ[A-Z]{2}_[A-Z0-9./]+_JP_\d{8}\b/);
  if (longForm) return longForm[0];
  const shortForm = xml.match(/\bRJ[A-Z]{2}_[A-Z0-9_]+_\d{8}\b/);
  if (shortForm) return shortForm[0];
  const urn = xml.match(/urn:uuid[:\s]+(RJ[A-Z]{2}_[^\s<"']+)/i);
  if (urn) return urn[1].trim().replace(/\s+/g, '');
  return undefined;
}

/** 設計子トークン → 日本語ラベル（完全でなくてもパイロット向けの目安） */
const EVENT_TOKEN_JA: Record<string, string> = {
  TWCL: '誘導路',
  TWY: '誘導路',
  RWY: '滑走路',
  RWYL: '滑走路',
  APN: 'エプロン',
  OTH: 'その他',
  EVT: '施設',
  CLS: '閉鎖',
  LIM: '制限',
  NEW: '新設',
  UNS: '注意',
  SAA: '進入・離陸',
  DR: '',
};

function headlineFromEventDesignator(code: string | undefined): string | undefined {
  if (!code) return undefined;
  const icao = code.match(/^(R[A-Z]{3})/)?.[1];
  const noJp = code.replace(/_JP_\d{8}$/, '');
  const rest = icao ? noJp.slice(icao.length + 1) : noJp;
  if (!rest) return icao ?? code.slice(0, 72);

  const segments = rest.split('_').flatMap((s) => s.split(/[./]+/)).filter(Boolean);
  const parts: string[] = [];
  for (const seg of segments) {
    if (/^\d{1,2}[LRC]?$/i.test(seg)) {
      parts.push(`滑走路${seg.toUpperCase()}`);
      continue;
    }
    if (Object.prototype.hasOwnProperty.call(EVENT_TOKEN_JA, seg)) {
      const ja = EVENT_TOKEN_JA[seg];
      if (ja) parts.push(ja);
    } else if (/^[A-Z]{2,8}$/.test(seg) && seg !== 'JP') {
      parts.push(seg);
    }
  }
  const uniq = [...new Set(parts.filter(Boolean))];
  const tail = uniq.join('・');
  if (icao && tail) return `${icao}：${tail}`;
  if (tail) return tail;
  return icao ?? code.slice(0, 72);
}

function stripXmlishInner(s: string): string {
  return s
    .replace(/<[^>]+>/g, ' ')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, ' ')
    .trim();
}

function isNotamNoiseText(s: string): boolean {
  const t = s.trim();
  if (t.length < 8) return true;
  if (/^1\.0$/.test(t) || /^UTF-8$/i.test(t)) return true;
  if (/^urn:uuid:?$/i.test(t) || /^TEMPDELTA$/i.test(t) || /^BASELINE$/i.test(t)) return true;
  if (/^https?:\/\//i.test(t) || /aixm\.aero|AIXM_BasicMessage|schema\/5/i.test(t)) return true;
  if (/^uuid\.[0-9a-f-]{8,}$/i.test(t)) return true;
  if (/^[0-9a-f]{8}-[0-9a-f-]{4}-[0-9a-f-]{4}-[0-9a-f-]{4}-[0-9a-f-]{12}$/i.test(t)) return true;
  return false;
}

function scoreNotamCandidate(s: string): number {
  if (isNotamNoiseText(s)) return -999;
  let score = Math.min(s.length, 500);
  if (/[\u3040-\u9fff]/.test(s)) score += 120;
  if (/RWY|TAXI|TWY|CLOS|CLSD|APRON|GPS|ILS|RESTRICT|UNAVAIL|誘導|滑走|閉鎖|制限|空港/i.test(s)) {
    score += 60;
  }
  return score;
}

function pickBestNotamText(candidates: string[]): string | undefined {
  let best: string | undefined;
  let bestScore = -Infinity;
  for (const c of candidates) {
    const t = stripXmlishInner(c);
    if (!t) continue;
    const sc = scoreNotamCandidate(t);
    if (sc > bestScore) {
      bestScore = sc;
      best = t;
    }
  }
  return bestScore > 0 ? best : undefined;
}

function extractNoteTagContents(xml: string): string[] {
  const out: string[] = [];
  for (const m of xml.matchAll(/<([\w.-]+):note\b[^>]*>([\s\S]*?)<\/\1:note>/gi)) {
    const inner = stripXmlishInner(m[2] ?? '');
    if (inner.length > 5) out.push(inner);
  }
  for (const m of xml.matchAll(/<note\b[^>]*>([\s\S]*?)<\/note>/gi)) {
    const inner = stripXmlishInner(m[1] ?? '');
    if (inner.length > 5) out.push(inner);
  }
  return out;
}

function extractCdataNotamText(xml: string): string[] {
  const out: string[] = [];
  for (const m of xml.matchAll(/<!\[CDATA\[([\s\S]*?)\]\]>/gi)) {
    const t = stripXmlishInner(m[1] ?? '');
    if (t.length < 15) continue;
    if (isNotamNoiseText(t)) continue;
    out.push(t);
  }
  return out;
}

function pushNoteLikeValue(v: unknown, out: string[]): void {
  if (v === null || v === undefined) return;
  if (typeof v === 'string') {
    const t = v.trim();
    if (t.length > 5 && !isNotamNoiseText(t)) out.push(t);
    return;
  }
  if (Array.isArray(v)) {
    for (const x of v) pushNoteLikeValue(x, out);
    return;
  }
  if (typeof v !== 'object') return;
  const o = v as Record<string, unknown>;
  if (typeof o['#text'] === 'string') {
    pushNoteLikeValue(o['#text'], out);
  }
  for (const [k, val] of Object.entries(o)) {
    if (k === '#text' || k.startsWith('@_')) continue;
    if (/translation|interpretation|txt|remark/i.test(k)) {
      pushNoteLikeValue(val, out);
    }
  }
}

function collectDeepNoteStrings(obj: unknown, depth: number, out: string[]): void {
  if (depth > 60 || obj === null || obj === undefined) return;
  if (Array.isArray(obj)) {
    for (const x of obj) collectDeepNoteStrings(x, depth + 1, out);
    return;
  }
  if (typeof obj !== 'object') return;
  const o = obj as Record<string, unknown>;
  for (const [k, v] of Object.entries(o)) {
    if (k.startsWith('@_')) continue;
    const lk = k.toLowerCase();
    if (lk === 'note' || lk === 'notes') {
      pushNoteLikeValue(v, out);
    } else {
      collectDeepNoteStrings(v, depth + 1, out);
    }
  }
}

const WHITELIST_TEXT_KEYS = new Set(['interpretation', 'annotation', 'remark']);

/** note 以外のホワイトリスト要素（収集後にスコアでノイズ除去） */
function collectWhitelistStrings(obj: unknown, depth: number, out: string[]): void {
  if (depth > 60 || obj === null || obj === undefined) return;
  if (Array.isArray(obj)) {
    for (const x of obj) collectWhitelistStrings(x, depth + 1, out);
    return;
  }
  if (typeof obj !== 'object') return;
  const o = obj as Record<string, unknown>;
  for (const [k, v] of Object.entries(o)) {
    if (k.startsWith('@_')) continue;
    const lk = k.toLowerCase();
    if (WHITELIST_TEXT_KEYS.has(lk)) {
      pushNoteLikeValue(v, out);
    } else if (lk === 'name' && typeof v === 'string') {
      const t = v.trim();
      if (t.length > 2 && t.length <= 200 && !isNotamNoiseText(t)) {
        out.push(t);
      }
    } else {
      collectWhitelistStrings(v, depth + 1, out);
    }
  }
}

function extractInterpretationTagContents(xml: string): string[] {
  const out: string[] = [];
  for (const m of xml.matchAll(/<([\w.-]+):interpretation\b[^>]*>([\s\S]*?)<\/\1:interpretation>/gi)) {
    const inner = stripXmlishInner(m[2] ?? '');
    if (inner.length > 5) out.push(inner);
  }
  for (const m of xml.matchAll(/<interpretation\b[^>]*>([\s\S]*?)<\/interpretation>/gi)) {
    const inner = stripXmlishInner(m[1] ?? '');
    if (inner.length > 5) out.push(inner);
  }
  return out;
}

function pickDetailNotes(candidates: string[]): string[] {
  const seen = new Set<string>();
  const scored: { t: string; s: number }[] = [];
  for (const c of candidates) {
    const t = stripXmlishInner(c);
    if (!t || t.length < 8) continue;
    const s = scoreNotamCandidate(t);
    if (s < DETAIL_NOTE_MIN_SCORE) continue;
    const norm = t.slice(0, 400);
    if (seen.has(norm)) continue;
    seen.add(norm);
    scored.push({ t: t.slice(0, 900), s });
  }
  scored.sort((a, b) => b.s - a.s);
  return scored.slice(0, DETAIL_NOTES_MAX).map((x) => x.t);
}

const FEATURE_LABEL_JA: Record<string, string> = {
  Taxiway: '誘導路',
  TaxiwayElement: '誘導路',
  RunwayDirection: '滑走路方向',
  RunwayCentrelinePoint: '滑走路',
  RunwayElement: '滑走路',
  AirportHeliport: '空港',
  ApronElement: 'エプロン',
  Helipad: 'ヘリパッド',
  MarkingElement: '標識',
  VerticalStructure: '構築物',
  AirspaceGeometryComponent: '空域形状',
  DeicingArea: '除氷エリア',
  PassengerLoadingBridge: '搭乗橋',
};

function extractAixmFeatureLabel(xml: string): string | undefined {
  const m = xml.match(/<(?:[\w.-]+:)?hasMember[^>]*>\s*<(?:[\w.-]+:)?(\w+)/i);
  const raw = m?.[1];
  if (!raw) return undefined;
  const ja = FEATURE_LABEL_JA[raw];
  return ja ? `${ja}（${raw}）` : raw;
}

function extractVerticalSummary(xml: string): string | undefined {
  const fls = [...xml.matchAll(/\bFL\s*0*(\d{1,3})\b/gi)].map((m) => `FL${m[1].padStart(3, '0')}`);
  const uniqFl = [...new Set(fls)];
  if (uniqFl.length) return uniqFl.slice(0, 8).join(', ');

  const alts: string[] = [];
  for (const m of xml.matchAll(
    /(?:lower|upper)Limit[^>]*>[\s\S]{0,1200}?<(?:[\w.-]+:)?value[^>]*>([^<]+)</gi,
  )) {
    const t = (m[1] ?? '').trim();
    if (t && !/^true$|^false$/i.test(t)) alts.push(t);
  }
  const u = [...new Set(alts)];
  if (u.length) return u.slice(0, 6).join(' / ');
  return undefined;
}

function buildLocationText(eventCode: string | undefined, xml: string): string | undefined {
  const parts: string[] = [];
  const icao = eventCode?.match(/^(R[A-Z]{3})/)?.[1];
  if (icao) parts.push(icao);
  if (eventCode && (!icao || eventCode.length > icao.length)) {
    parts.push(eventCode);
  }
  const des = xml.match(
    /<(?:[\w.-]+:)?designator[^>]*>([A-Z0-9]{3,5})<\/(?:[\w.-]+:)?designator>/i,
  );
  if (des?.[1] && !parts.includes(des[1])) {
    parts.unshift(des[1]);
  }
  return parts.length ? [...new Set(parts)].join(' · ') : undefined;
}

/** AIXM 断片から有効期間と要約を抽出 */
function summarizeDigitalNotamXml(
  xml: string,
  index: number,
  opts: { includeRawXml: boolean },
): SwimNotamSummary {
  const begins = [...xml.matchAll(/beginPosition[^>]*>([^<]+)</gi)].map((m) => m[1].trim());
  const ends = [...xml.matchAll(/endPosition[^>]*>([^<]+)</gi)].map((m) => m[1].trim());
  const begin = begins[0];
  const end = ends[0];

  const eventCode = extractPrimaryEventDesignator(xml);
  const headline = headlineFromEventDesignator(eventCode);
  const featureLabel = extractAixmFeatureLabel(xml);

  const noteCandidates: string[] = [];
  noteCandidates.push(...extractNoteTagContents(xml));
  noteCandidates.push(...extractInterpretationTagContents(xml));
  noteCandidates.push(...extractCdataNotamText(xml));
  try {
    const obj = xmlParser.parse(xml) as Record<string, unknown>;
    collectDeepNoteStrings(obj, 0, noteCandidates);
    collectWhitelistStrings(obj, 0, noteCandidates);
  } catch {
    /* ignore */
  }
  const noteSnippet = pickBestNotamText(noteCandidates);
  const detailNotes = pickDetailNotes(noteCandidates);
  const verticalText = extractVerticalSummary(xml);
  const locationText = buildLocationText(eventCode, xml);

  let geometry: Geometry | undefined;
  try {
    geometry = extractGeometryFromDigitalNotamXml(xml);
  } catch {
    geometry = undefined;
  }

  let rawXml: string | undefined;
  let rawXmlTruncated = false;
  if (opts.includeRawXml) {
    if (xml.length > RAW_XML_MAX_CHARS) {
      rawXml = xml.slice(0, RAW_XML_MAX_CHARS);
      rawXmlTruncated = true;
    } else {
      rawXml = xml;
    }
  }

  const summaryParts = [headline, noteSnippet].filter(
    (x): x is string => typeof x === 'string' && x.length > 0,
  );
  let summary = summaryParts.join(' — ').trim();
  if (!summary) {
    summary = headline ?? eventCode ?? `デジタルノータム（${index + 1}）`;
  }
  summary = summary.slice(0, 500);

  const idMatch = xml.match(/gml:id="([^"]+)"/);
  const key = idMatch?.[1] ?? `notam-${index}`;

  return {
    key,
    summary,
    headline,
    noteSnippet,
    detailNotes: detailNotes.length > 0 ? detailNotes : undefined,
    locationText,
    verticalText,
    eventCode,
    featureLabel,
    rawXml,
    rawXmlTruncated: rawXmlTruncated || undefined,
    geometry,
    begin,
    end,
  };
}

function classifyNotams(items: SwimNotamSummary[], now: Date): { current: SwimNotamSummary[]; future: SwimNotamSummary[] } {
  const current: SwimNotamSummary[] = [];
  const future: SwimNotamSummary[] = [];

  for (const item of items) {
    const b = item.begin ? parseIsoInstant(item.begin) : null;
    const e = item.end ? parseIsoInstant(item.end) : null;

    if (b && b > now) {
      future.push(item);
      continue;
    }
    if (b && b <= now) {
      if (!e || e >= now) {
        current.push(item);
      }
      continue;
    }
    if (!b) {
      if (!e || e >= now) {
        current.push(item);
      }
    }
  }

  return { current, future };
}

type SwimSearchJson = {
  error_info?: { error_code?: string | number; error_description?: string };
  data?: Array<{ totalCount?: string; digitalNotam?: string[] }>;
};

/** API が data を単一オブジェクトで返す場合がある */
function normalizeSwimDataBlocks(
  data: unknown,
): Array<{ totalCount?: string; digitalNotam?: unknown }> {
  if (data === undefined || data === null) return [];
  if (Array.isArray(data)) {
    return data as Array<{ totalCount?: string; digitalNotam?: unknown }>;
  }
  if (typeof data === 'object') {
    return [data as { totalCount?: string; digitalNotam?: unknown }];
  }
  return [];
}

/** digitalNotam が 1 件だけのとき文字列で返る場合がある */
function normalizeDigitalNotamStrings(digitalNotam: unknown): string[] {
  if (digitalNotam === undefined || digitalNotam === null) return [];
  if (Array.isArray(digitalNotam)) {
    return digitalNotam.filter((x): x is string => typeof x === 'string' && x.length > 0);
  }
  if (typeof digitalNotam === 'string' && digitalNotam.length > 0) return [digitalNotam];
  return [];
}

function swimSearchErrorMessage(code: string): string {
  const table: Record<string, string> = {
    '2': '必須パラメータ不足（アカウントIDなど）',
    '7': 'キーワード指定時は AND/OR 条件が必要です',
    '14': '取得件数が検索上限を超えました',
    '15': '有効終了日時が指定されていません',
    '99': 'SWIM 側で障害が発生しました',
  };
  return table[code] ?? `SWIM 検索エラー（コード ${code}）`;
}

/**
 * 環境変数: SWIM_LOGIN_ID, SWIM_LOGIN_PASSWORD 必須。
 * SWIM_SEARCH_USER_ID があれば検索の userId に使用（なければ SWIM_LOGIN_ID）。
 */
export async function searchSwimDigitalNotam(query: SwimNotamQuery): Promise<SwimNotamSearchResult> {
  const loginId = process.env.SWIM_LOGIN_ID?.trim();
  const password = process.env.SWIM_LOGIN_PASSWORD;
  const userId = (process.env.SWIM_SEARCH_USER_ID?.trim() || loginId) ?? '';

  if (!loginId || !password) {
    return { ok: false, error: 'サーバに SWIM 認証が設定されていません' };
  }

  const loc = query.location?.trim();
  const kw = query.keyword?.trim();
  if (!loc && !kw) {
    return { ok: false, error: 'location または keyword のいずれかが必要です' };
  }
  if (kw && query.andOrCondition !== '0' && query.andOrCondition !== '1') {
    /* 呼び出し側でデフォルト付与するが、型上はここでも保険 */
    query.andOrCondition = '0';
  }

  let cookie: string;
  try {
    const loginRes = await httpsRequestTextIpv4({
      urlStr: SWIM_LOGIN_URL,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        'User-Agent': 'FlightAcademyTsx/1.0',
      },
      body: JSON.stringify({ id: loginId, password }),
      timeoutMs: LOGIN_TIMEOUT_MS,
    });

    if (loginRes.statusCode === 401) {
      return { ok: false, error: 'SWIM ログインに失敗しました（認証エラー）', httpStatus: 401 };
    }
    if (loginRes.statusCode < 200 || loginRes.statusCode >= 300) {
      return {
        ok: false,
        error: `SWIM ログイン HTTP ${loginRes.statusCode}`,
        httpStatus: loginRes.statusCode,
      };
    }

    type SwimLoginJson = { error_info?: { error_code?: number | string } };
    let loginBody: SwimLoginJson;
    try {
      loginBody = JSON.parse(loginRes.text) as SwimLoginJson;
    } catch {
      return { ok: false, error: 'SWIM ログイン応答の解析に失敗しました' };
    }
    const loginCode = loginBody.error_info?.error_code;
    if (loginCode !== 0 && loginCode !== '0') {
      return { ok: false, error: 'SWIM ログインに失敗しました' };
    }

    const c = extractCookiePair(loginRes.headers['set-cookie']);
    if (!c) {
      return { ok: false, error: 'SWIM セッション Cookie を取得できませんでした' };
    }
    cookie = c;
  } catch (e: unknown) {
    const name = e instanceof Error ? e.name : '';
    if (name === 'TimeoutError') {
      return { ok: false, error: 'SWIM ログインがタイムアウトしました' };
    }
    return {
      ok: false,
      error: e instanceof Error ? e.message : 'SWIM ログイン要求に失敗しました',
    };
  }

  const now = new Date();
  const validEnd = new Date(now.getTime() + 366 * 24 * 60 * 60 * 1000);
  const qs = new URLSearchParams();
  qs.set('userId', userId);
  qs.set('display', '0');
  qs.set('validDatetimeEnd', formatSwimJstDateTime(validEnd));
  if (loc) qs.set('location', loc);
  if (kw) {
    qs.set('keyword', kw);
    qs.set('andOrCondition', query.andOrCondition ?? '0');
  }
  const fir = query.fir?.trim();
  const nof = query.nof?.trim();
  if (fir) qs.set('fir', fir);
  if (nof) qs.set('nof', nof);

  const searchUrl = `${SWIM_SEARCH_BASE}?${qs.toString()}`;

  let searchText: string;
  let searchStatus: number;
  try {
    const searchRes = await httpsRequestTextIpv4({
      urlStr: searchUrl,
      method: 'GET',
      headers: {
        Accept: 'application/json',
        Cookie: cookie,
        'User-Agent': 'FlightAcademyTsx/1.0',
        'Cache-Control': 'no-cache',
      },
      timeoutMs: SEARCH_TIMEOUT_MS,
    });
    searchStatus = searchRes.statusCode;
    searchText = searchRes.text;
  } catch (e: unknown) {
    const name = e instanceof Error ? e.name : '';
    if (name === 'TimeoutError') {
      return { ok: false, error: 'デジタルノータム検索がタイムアウトしました' };
    }
    return {
      ok: false,
      error: e instanceof Error ? e.message : 'デジタルノータム検索に失敗しました',
    };
  }

  if (searchStatus === 403) {
    return { ok: false, error: 'SWIM セッションが無効です（再試行してください）', httpStatus: 403 };
  }
  if (searchStatus < 200 || searchStatus >= 300) {
    return {
      ok: false,
      error: `デジタルノータム検索 HTTP ${searchStatus}`,
      httpStatus: searchStatus,
    };
  }

  let body: SwimSearchJson;
  try {
    body = JSON.parse(searchText) as SwimSearchJson;
  } catch {
    return { ok: false, error: 'デジタルノータム応答が JSON ではありません' };
  }

  const codeRaw = body.error_info?.error_code;
  const swimCode = codeRaw === undefined || codeRaw === null ? '' : String(codeRaw);

  if (swimCode && swimCode !== '0' && swimCode !== '1') {
    return {
      ok: false,
      error: swimSearchErrorMessage(swimCode),
      swimErrorCode: swimCode,
      httpStatus: 200,
    };
  }

  const allXml: string[] = [];
  let totalCount: string | undefined;
  for (const block of normalizeSwimDataBlocks(body.data)) {
    if (block.totalCount !== undefined) totalCount = block.totalCount;
    for (const x of normalizeDigitalNotamStrings(block.digitalNotam)) {
      allXml.push(x);
    }
  }

  const includeRawXml = query.includeRawXml !== false;
  const summaries = allXml.map((xml, i) =>
    summarizeDigitalNotamXml(xml, i, { includeRawXml }),
  );
  const { current, future } = classifyNotams(summaries, now);

  return {
    ok: true,
    current,
    future,
    swimErrorCode: swimCode || '0',
    totalCount,
  };
}
