/**
 * 航空気象データ取得サービス
 * NOAA Aviation Weather Center APIを使用してMETAR/TAF情報を取得
 */

import axios from 'axios';
import type { METARData, TAFData, AviationWeatherData } from '../types/aviation';

// 本番環境かどうかを判定する
const isProd = import.meta.env.PROD;
// デプロイ先のドメインを取得（未設定の場合はnull）
const deploymentDomain = isProd ? window.location.origin : null;

/**
 * Aviation Weather API エンドポイントを構築
 * 開発環境ではプロキシされるように相対パスを、本番環境では完全なURLを使用
 */
function getApiEndpoint(type: 'metar' | 'taf', icaoCode: string): string {
  const params = `type=${type}&icao=${icaoCode}`;

  if (deploymentDomain) {
    return `${deploymentDomain}/api/aviation-weather?${params}`;
  }
  return `/api/aviation-weather?${params}`;
}

/**
 * ICAOコードからMETAR情報を取得
 * Vercel Serverless Function経由でNOAA APIにアクセス（CORSエラー回避）
 * @param icaoCode ICAOコード（例: RJAA, RJBB, RJTT）
 * @returns METAR情報、取得失敗時はnull
 */
export async function fetchMETAR(icaoCode: string): Promise<METARData | null> {
  try {
    const url = getApiEndpoint('metar', icaoCode);
    const response = await axios.get<METARData[]>(url, {
      timeout: 10000,
      headers: {
        'Accept': 'application/json',
      },
    });

    // APIは配列で返すため、最初の要素を取得
    if (response.data && response.data.length > 0) {
      return response.data[0];
    }

    return null;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      // 404エラー（データなし）は静かに処理
      if (error.response?.status === 404) {
        console.log(`METAR データなし (${icaoCode})`);
        return null;
      }
      console.error(`METAR取得エラー (${icaoCode}):`, error.response?.data || error.message);
    } else {
      console.error(`METAR取得エラー (${icaoCode}):`, error);
    }
    return null;
  }
}

/**
 * ICAOコードからTAF情報を取得
 * Vercel Serverless Function経由でNOAA APIにアクセス（CORSエラー回避）
 * @param icaoCode ICAOコード（例: RJAA, RJBB, RJTT）
 * @returns TAF情報、取得失敗時はnull
 */
export async function fetchTAF(icaoCode: string): Promise<TAFData | null> {
  try {
    const url = getApiEndpoint('taf', icaoCode);
    const response = await axios.get<TAFData[]>(url, {
      timeout: 10000,
      headers: {
        'Accept': 'application/json',
      },
    });

    // APIは配列で返すため、最初の要素を取得
    if (response.data && response.data.length > 0) {
      return response.data[0];
    }

    return null;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      // 404エラー（データなし）は静かに処理
      if (error.response?.status === 404) {
        console.log(`TAF データなし (${icaoCode})`);
        return null;
      }
      console.error(`TAF取得エラー (${icaoCode}):`, error.response?.data || error.message);
    } else {
      console.error(`TAF取得エラー (${icaoCode}):`, error);
    }
    return null;
  }
}

/**
 * ICAOコードからMETARとTAFを同時に取得
 * @param icaoCode ICAOコード（例: RJAA, RJBB, RJTT）
 * @returns 航空気象データ
 */
export async function fetchAviationWeather(
  icaoCode: string
): Promise<AviationWeatherData> {
  // METAR と TAF を並列で取得してパフォーマンスを最適化
  const [metar, taf] = await Promise.all([
    fetchMETAR(icaoCode),
    fetchTAF(icaoCode),
  ]);

  return {
    metar,
    taf,
    fetchedAt: new Date(),
  };
}

/**
 * METAR生テキストを人間が読みやすい形式に変換
 * @param metarRaw 生METARテキスト
 * @returns 整形されたMETARテキスト
 */
export function formatMETAR(metarRaw: string | undefined | null): string {
  if (!metarRaw) return 'データなし';
  // 基本的な整形（余分な空白を除去）
  return metarRaw.replace(/\s+/g, ' ').trim();
}

/**
 * TAF生テキストを人間が読みやすい形式に変換
 * 変化指標（TEMPO、BECMG、FM）の前で改行を入れる
 * @param tafRaw 生TAFテキスト
 * @returns 整形されたTAFテキスト
 */
export function formatTAF(tafRaw: string | undefined | null): string {
  if (!tafRaw) return 'データなし';
  // TEMPO、BECMG、FMの前で改行を入れる
  return tafRaw
    .replace(/(TEMPO|BECMG|FM\d{6})/g, '\n  $1')
    .trim();
}

/**
 * フライトカテゴリーを日本語に変換
 * @param category フライトカテゴリー
 * @returns 日本語表示
 */
export function translateFlightCategory(
  category: 'VFR' | 'MVFR' | 'IFR' | 'LIFR'
): string {
  const translations: Record<string, string> = {
    VFR: '有視界飛行方式（VFR）',
    MVFR: '有視界限定（MVFR）',
    IFR: '計器飛行方式（IFR）',
    LIFR: '計器飛行制限（LIFR）',
  };
  return translations[category] || category;
}

/**
 * 雲量コードを日本語に変換
 * @param skyCover 雲量コード
 * @returns 日本語表示
 */
export function translateSkyCover(
  skyCover: 'SKC' | 'FEW' | 'SCT' | 'BKN' | 'OVC' | 'OVX'
): string {
  const translations: Record<string, string> = {
    SKC: '快晴',
    FEW: '晴れ',
    SCT: '点在する雲',
    BKN: '曇り',
    OVC: '全天曇',
    OVX: '不明',
  };
  return translations[skyCover] || skyCover;
}

/**
 * 天気現象コードを日本語に変換（簡易版）
 * @param wxString 天気現象コード（例: RA, SN, FG）
 * @returns 日本語表示
 */
export function translateWeatherPhenomena(wxString: string): string {
  const translations: Record<string, string> = {
    'RA': '雨',
    'SN': '雪',
    'FG': '霧',
    'BR': 'もや',
    'HZ': '煙霧',
    'DZ': '霧雨',
    'TS': '雷雨',
    'SH': 'しゅう雨',
    'GR': 'ひょう',
    'GS': '氷あられ',
    'PL': '氷じん',
    'IC': '氷晶',
    'FU': '煙',
    'VA': '火山灰',
    'DU': 'ちり',
    'SA': '砂',
    'SQ': 'スコール',
    'FC': '漏斗雲',
    'DS': 'じん嵐',
    'SS': '砂嵐',
  };

  // 強度修飾子の処理
  let intensity = '';
  let phenomenon = wxString;

  if (wxString.startsWith('-')) {
    intensity = '弱い';
    phenomenon = wxString.substring(1);
  } else if (wxString.startsWith('+')) {
    intensity = '強い';
    phenomenon = wxString.substring(1);
  }

  // 複数の現象が組み合わさっている場合の処理（簡易版）
  const parts = phenomenon.match(/.{1,2}/g) || [];
  const translatedParts = parts
    .map(part => translations[part] || part)
    .join('、');

  return intensity ? `${intensity}${translatedParts}` : translatedParts;
}

