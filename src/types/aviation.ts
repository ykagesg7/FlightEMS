/**
 * 航空気象データの型定義
 * NOAA Aviation Weather Center APIのレスポンス構造に基づく
 */

/**
 * 雲の状態（NOAA API形式）
 */
export interface CloudLayer {
  /** 雲量コード */
  cover: string;
  /** 雲底高度（フィート） */
  base: number;
  /** 雲のタイプ（オプション） */
  type?: string | null;
}

/**
 * METAR情報の型定義
 * METARは定時飛行場実況気象通報式
 * NOAA Aviation Weather Center APIの実際のフィールド名に基づく
 */
export interface METARData {
  /** ICAOコード */
  icaoId: string;
  /** 受信時刻（ISO 8601形式） */
  receiptTime: string;
  /** 観測時刻（Unixタイムスタンプ） */
  obsTime: number;
  /** 報告時刻（ISO 8601形式） */
  reportTime: string;
  /** 気温（摂氏） */
  temp: number;
  /** 露点温度（摂氏） */
  dewp: number;
  /** 風向（度） */
  wdir: number;
  /** 風速（ノット） */
  wspd: number;
  /** 視程 */
  visib: string;
  /** 高度計規正値（ミリバール） */
  altim: number;
  /** QCフィールド */
  qcField: number;
  /** METARタイプ */
  metarType: string;
  /** 生のMETAR観測テキスト */
  rawOb: string;
  /** 緯度 */
  lat: number;
  /** 経度 */
  lon: number;
  /** 標高（メートル） */
  elev: number;
  /** 空港名 */
  name: string;
  /** 雲量カバー */
  cover?: string;
  /** 雲の状態 */
  clouds?: CloudLayer[];
  /** フライトカテゴリー */
  fltCat: 'VFR' | 'MVFR' | 'IFR' | 'LIFR';
  /** 天気現象（オプション） */
  wxString?: string;
}

/**
 * TAF予報期間データ
 */
export interface TAFForecast {
  /** 予報開始時刻（Unixタイムスタンプ） */
  timeFrom: number;
  /** 予報終了時刻（Unixタイムスタンプ） */
  timeTo: number;
  /** BECMG時刻（Unixタイムスタンプ、オプション） */
  timeBec: number | null;
  /** 変化指標（TEMPO, BECMGなど） */
  fcstChange: string | null;
  /** 確率（オプション） */
  probability: number | null;
  /** 風向（度） */
  wdir: number;
  /** 風速（ノット） */
  wspd: number;
  /** 突風（ノット、オプション） */
  wgst: number | null;
  /** 視程 */
  visib: string;
  /** 高度計規正値（オプション） */
  altim: number | null;
  /** 天気現象（オプション） */
  wxString: string | null;
  /** 雲の状態 */
  clouds: CloudLayer[];
  /** アイシング・乱気流データ */
  icgTurb: any[];
  /** 気温データ */
  temp: any[];
  /** デコードされていないフィールド */
  notDecoded: string | null;
  /** ウィンドシア高度 */
  wshearHgt: number | null;
  /** ウィンドシア風向 */
  wshearDir: number | null;
  /** ウィンドシア風速 */
  wshearSpd: number | null;
  /** 垂直視程 */
  vertVis: number | null;
}

/**
 * TAF情報の型定義
 * TAFは飛行場予報
 * NOAA Aviation Weather Center APIの実際のフィールド名に基づく
 */
export interface TAFData {
  /** ICAOコード */
  icaoId: string;
  /** データベース登録時刻（ISO 8601形式） */
  dbPopTime: string;
  /** 電報時刻（ISO 8601形式） */
  bulletinTime: string;
  /** 発表時刻（ISO 8601形式） */
  issueTime: string;
  /** 有効開始時刻（Unixタイムスタンプ） */
  validTimeFrom: number;
  /** 有効終了時刻（Unixタイムスタンプ） */
  validTimeTo: number;
  /** 生のTAFテキスト */
  rawTAF: string;
  /** 最新フラグ */
  mostRecent: number;
  /** 備考 */
  remarks: string;
  /** 緯度 */
  lat: number;
  /** 経度 */
  lon: number;
  /** 標高（メートル） */
  elev: number;
  /** 過去データ数 */
  prior: number;
  /** 空港名 */
  name: string;
  /** 予報データの配列 */
  fcsts?: TAFForecast[];
}

/**
 * 航空気象データ統合型
 * METARとTAFの両方を含む
 */
export interface AviationWeatherData {
  /** METAR情報（取得できない場合はnull） */
  metar: METARData | null;
  /** TAF情報（取得できない場合はnull） */
  taf: TAFData | null;
  /** データ取得時刻 */
  fetchedAt: Date;
}
