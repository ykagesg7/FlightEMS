/**
 * CPL Phase1+2 スタブ MDX（docs/06 一覧）と Supabase 投入用 SQL を生成する。
 * 実行: node scripts/generate-cpl-stub-lessons.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const LESSONS_DIR = path.join(ROOT, 'src', 'content', 'lessons');
const SQL_OUT = path.join(ROOT, 'scripts', 'database', '20260410_cpl_stub_lessons_contents_and_mapping.sql');

/** @typedef {{ id: string, title: string, slug: string, subCategory: string, orderIndex: number, tags: string[], excerpt: string, placeholder: string, hubId: string | null, clusterMd: string, bullets: string[], mapping: boolean, sqlPredicate: string }} Lesson */

/** @type {Lesson[]} */
const LESSONS = [
  {
    id: '3.1.1_AviationLegal0',
    title: '【航空法規】戦闘機乗りへの第一歩（CPL学科・スタブ同期）',
    slug: '3-1-1-aviation-legal-0',
    subCategory: '航空法規',
    orderIndex: 325,
    tags: ['CPL', '学科試験', '航空法規', 'スタブ'],
    excerpt:
      'Supabase の learning_contents / learning_test_mapping と id を一致させるプレースホルダ。本文は後から拡充。',
    placeholder: 'Aviation+Legal+0',
    hubId: null,
    clusterMd:
      '**データ上の正本**は `unified_cpl_questions` の **航空法規**科目で、既存バッチ（四分位）により本記事 id に束ねられた verified 設問クラスタです。',
    bullets: [
      '法規シリーズ全体の入口として、試験で繰り返し出る「枠組み」用語を整理する。',
      '条文番号の暗記に逃げず、**定義・主体・義務**の型で読む。',
    ],
    mapping: false,
    sqlPredicate: '',
  },
  {
    id: '3.1.5_AirspaceClassification',
    title: '【航空法規】空域分類とクラスC空域（CPL学科・スタブ）',
    slug: '3-1-5-airspace-classification',
    subCategory: '航空法規',
    orderIndex: 326,
    tags: ['CPL', '学科試験', '航空法規', '空域', 'クラスC'],
    excerpt: '空域区分・進入条件など「空域」系 sub_subject に対応するスタブ。マッピングで verified UUID を束ねる。',
    placeholder: 'Airspace',
    hubId: null,
    clusterMd:
      '**main_subject**: `航空法規` / **sub_subject**: `空域`・`クラス` 等を含む設問クラスタ（ILIKE 条件は SQL 側。後で完全一致クラスタへ移行可）。',
    bullets: ['クラス空域の要件と VFR/IFR の論点', '管制圏・情報圏との関係（試験の定型）'],
    mapping: true,
    sqlPredicate: `q.main_subject = '航空法規' AND (q.sub_subject ILIKE '%空域%' OR q.sub_subject ILIKE '%クラス%')`,
  },
  {
    id: '3.1.6_IFRMinimumAltitude',
    title: '【航空法規】計器飛行方式の最低高度（CPL学科・スタブ）',
    slug: '3-1-6-ifr-minimum-altitude',
    subCategory: '航空法規',
    orderIndex: 327,
    tags: ['CPL', '学科試験', '航空法規', 'IFR', '最低高度'],
    excerpt: '計器飛行方式・最低安全高度まわりの法規クラスタ向けスタブ。',
    placeholder: 'IFR+Min+Alt',
    hubId: null,
    clusterMd:
      '**main_subject**: `航空法規` / **sub_subject**: `最低`・`計器`・`安全高度` 等を含むクラスタを対象とする。',
    bullets: ['最低高度の考え方（地形・障害・余裕）', '運用面との接続（問題の型）'],
    mapping: true,
    sqlPredicate: `q.main_subject = '航空法規' AND (q.sub_subject ILIKE '%最低安全%' OR q.sub_subject ILIKE '%計器飛行方式%' OR q.sub_subject ILIKE '%最低高度%')`,
  },
  {
    id: '3.1.7_FlightRules',
    title: '【航空法規】運航規則の詳細（CPL学科・スタブ）',
    slug: '3-1-7-flight-rules',
    subCategory: '航空法規',
    orderIndex: 328,
    tags: ['CPL', '学科試験', '航空法規', '運航'],
    excerpt: '運航・飛行方法に関する法規頻出論点のスタブ。',
    placeholder: 'Flight+Rules',
    hubId: null,
    clusterMd: '**main_subject**: `航空法規` / **sub_subject**: `運航` を含むクラスタを主対象とする。',
    bullets: ['Visual / Instrument の枠組みと例外の探し方', '実務と条文の橋渡し（スタブ段階は見出しのみ）'],
    mapping: true,
    sqlPredicate: `q.main_subject = '航空法規' AND q.sub_subject ILIKE '%運航%'`,
  },
  {
    id: '3.1.8_AirportOperations',
    title: '【航空法規】空港運用規則（CPL学科・スタブ）',
    slug: '3-1-8-airport-operations',
    subCategory: '航空法規',
    orderIndex: 329,
    tags: ['CPL', '学科試験', '航空法規', '空港'],
    excerpt: '空港・飛行場運用に関する法規クラスタ向けスタブ。',
    placeholder: 'Airport+Ops',
    hubId: null,
    clusterMd: '**main_subject**: `航空法規` / **sub_subject**: `空港` を含むクラスタを対象とする。',
    bullets: ['地上走行・進入・離陸に関する定型問題', '他科目（航法・通信）との境界の整理'],
    mapping: true,
    sqlPredicate: `q.main_subject = '航空法規' AND q.sub_subject ILIKE '%空港%'`,
  },
  {
    id: '3.2.7_LiftAndDrag',
    title: '【航空工学】揚力と抗力の詳細（CPL学科・スタブ）',
    slug: '3-2-7-lift-and-drag',
    subCategory: '航空工学',
    orderIndex: 350,
    tags: ['CPL', '学科試験', '航空工学', '揚力', '抗力'],
    excerpt: '航空力学クラスタ（揚力・抗力の深掘り）向け。既存 3.2.2 と役割分担しつつマッピングを分割予定。',
    placeholder: 'Lift+Drag',
    hubId: 'engineering_basics',
    clusterMd:
      '**main_subject**: `航空工学` / **sub_subject**: `航空力学`（`unified_cpl_questions` 上の単一クラスタ。細分化は後続 SQL で調整）。',
    bullets: ['揚力・抗力の分解（誘導・寄生）', '試験で出やすい定性情報問題の型'],
    mapping: true,
    sqlPredicate: `q.main_subject = '航空工学' AND q.sub_subject = '航空力学'`,
  },
  {
    id: '3.2.8_PowerAndPerformance',
    title: '【航空工学】必要馬力と利用馬力（CPL学科・スタブ）',
    slug: '3-2-8-power-and-performance',
    subCategory: '航空工学',
    orderIndex: 351,
    tags: ['CPL', '学科試験', '航空工学', '飛行性能', '馬力'],
    excerpt: '性能と耐空性／飛行性能クラスタ向けスタブ。',
    placeholder: 'Power+Performance',
    hubId: 'engineering_basics',
    clusterMd: '**main_subject**: `航空工学` / **sub_subject**: `飛行性能`・`性能と耐空性` を含むクラスタ。',
    bullets: ['必要馬力・利用馬力・余剰馬力', '上昇・巡航・高度と出力の関係（定性）'],
    mapping: true,
    sqlPredicate: `q.main_subject = '航空工学' AND (q.sub_subject ILIKE '%飛行性能%' OR q.sub_subject ILIKE '%性能と耐空性%')`,
  },
  {
    id: '3.2.9_PitotStaticSystem',
    title: '【航空工学】ピトー静圧系統の詳細（CPL学科・スタブ）',
    slug: '3-2-9-pitot-static-system',
    subCategory: '航空工学',
    orderIndex: 352,
    tags: ['CPL', '学科試験', '航空工学', 'ピトー', '静圧'],
    excerpt: '3.2.6 と同系統の深掘り記事用スタブ。マッピングは同一 LIKE 条件でプールを共有。',
    placeholder: 'Pitot+Static',
    hubId: 'engineering_basics',
    clusterMd:
      '**main_subject**: `航空工学` / **sub_subject**: `ピトー`・`エア・データー`・`高度計` を含むクラスタ（3.2.6 と同一条件）。',
    bullets: ['計器誤指示パターン（詰まり・漏れ・氷結）', 'クロスチェックの考え方'],
    mapping: true,
    sqlPredicate: `q.main_subject = '航空工学' AND (q.sub_subject ILIKE '%エア・データー%' OR q.sub_subject ILIKE '%高度計%' OR q.sub_subject ILIKE '%ピトー%')`,
  },
  {
    id: '3.2.10_WeightAndBalance',
    title: '【航空工学】重量と重心（CPL学科・スタブ）',
    slug: '3-2-10-weight-and-balance',
    subCategory: '航空工学',
    orderIndex: 353,
    tags: ['CPL', '学科試験', '航空工学', '重量', '重心'],
    excerpt: '重量・重心・載荷に関する工学クラスタ向けスタブ。',
    placeholder: 'W%26B',
    hubId: 'engineering_basics',
    clusterMd: '**main_subject**: `航空工学` / **sub_subject**: `重量`・`重心` を含むクラスタ。',
    bullets: ['重心位置と安定性・操縦性への影響（定性）', '制限重量・載荷表の読み方（後続で具体化）'],
    mapping: true,
    sqlPredicate: `q.main_subject = '航空工学' AND (q.sub_subject ILIKE '%重量%' OR q.sub_subject ILIKE '%重心%')`,
  },
  {
    id: '3.2.11_StallAndSpin',
    title: '【航空工学】失速とスピン（CPL学科・スタブ）',
    slug: '3-2-11-stall-and-spin',
    subCategory: '航空工学',
    orderIndex: 354,
    tags: ['CPL', '学科試験', '航空工学', '失速', 'スピン'],
    excerpt: '失速・スピン・高揚力装置周辺の空力クラスタ向けスタブ。',
    placeholder: 'Stall+Spin',
    hubId: 'engineering_basics',
    clusterMd: '**main_subject**: `航空工学` / **sub_subject**: `失速`・`スピン` を含むクラスタ。',
    bullets: ['失速のメカニズムと警告', 'スピン回復の考え方（学科の定型）'],
    mapping: true,
    sqlPredicate: `q.main_subject = '航空工学' AND (q.sub_subject ILIKE '%失速%' OR q.sub_subject ILIKE '%スピン%')`,
  },
  {
    id: '3.2.12_EngineSystems',
    title: '【航空工学】エンジン系統の詳細（CPL学科・スタブ）',
    slug: '3-2-12-engine-systems',
    subCategory: '航空工学',
    orderIndex: 355,
    tags: ['CPL', '学科試験', '航空工学', 'エンジン', '系統'],
    excerpt: '点火・潤滑・冷却・燃料などエンジン周辺系統のスタブ（3.2.5 との分担は後続で整理）。',
    placeholder: 'Engine+Sys',
    hubId: 'engineering_basics',
    clusterMd:
      '**main_subject**: `航空工学` / **sub_subject**: `点火`・`冷却`・`潤滑`・`燃料` を含むクラスタ。',
    bullets: ['各系統の目的と典型トラブル', '計器・警告とのつながり'],
    mapping: true,
    sqlPredicate: `q.main_subject = '航空工学' AND (q.sub_subject ILIKE '%点火%' OR q.sub_subject ILIKE '%冷却%' OR q.sub_subject ILIKE '%潤滑%' OR q.sub_subject ILIKE '%燃料系%')`,
  },
  {
    id: '3.3.1_StandardAtmosphere',
    title: '【航空気象】標準大気と大気構造（CPL学科・スタブ）',
    slug: '3-3-1-standard-atmosphere',
    subCategory: '航空気象',
    orderIndex: 360,
    tags: ['CPL', '学科試験', '航空気象', '標準大気'],
    excerpt: '大気の物理・標準大気まわりの気象クラスタ向けスタブ。',
    placeholder: 'Std+Atmosphere',
    hubId: 'CPL-Hub-Meteorology',
    clusterMd: '**main_subject**: `航空気象` / **sub_subject**: `大気の物理`・`標準` 等を含むクラスタ。',
    bullets: ['気温・気圧・高度の関係（標準大気）', '試験で出やすい数値・定義の型'],
    mapping: true,
    sqlPredicate: `q.main_subject = '航空気象' AND (q.sub_subject ILIKE '%大気の物理%' OR q.sub_subject ILIKE '%標準大気%')`,
  },
  {
    id: '3.3.2_CloudsAndPrecipitation',
    title: '【航空気象】雲と降水のメカニズム（CPL学科・スタブ）',
    slug: '3-3-2-clouds-and-precipitation',
    subCategory: '航空気象',
    orderIndex: 361,
    tags: ['CPL', '学科試験', '航空気象', '雲', '降水'],
    excerpt: '雲・降水・水循環まわりの気象クラスタ向けスタブ。',
    placeholder: 'Clouds',
    hubId: 'CPL-Hub-Meteorology',
    clusterMd: '**main_subject**: `航空気象` / **sub_subject**: `雲`・`降水` を含むクラスタ。',
    bullets: ['上昇・冷却と雲粒生成のイメージ', '航空危険との接続（後続）'],
    mapping: true,
    sqlPredicate: `q.main_subject = '航空気象' AND (q.sub_subject ILIKE '%雲%' OR q.sub_subject ILIKE '%降水%')`,
  },
  {
    id: '3.3.3_FrontsAndWeatherSystems',
    title: '【航空気象】前線と気象システム（CPL学科・スタブ）',
    slug: '3-3-3-fronts-and-weather-systems',
    subCategory: '航空気象',
    orderIndex: 362,
    tags: ['CPL', '学科試験', '航空気象', '前線', '天気図'],
    excerpt: '前線・低気圧トラフ・天気図解析クラスタ向けスタブ。',
    placeholder: 'Fronts',
    hubId: 'CPL-Hub-Meteorology',
    clusterMd: '**main_subject**: `航空気象` / **sub_subject**: `前線`・`天気図` を含むクラスタ。',
    bullets: ['温暖前線・寒冷前線の場の特徴', '実況・予報天気図の読みの型'],
    mapping: true,
    sqlPredicate: `q.main_subject = '航空気象' AND (q.sub_subject ILIKE '%前線%' OR q.sub_subject ILIKE '%天気図%')`,
  },
  {
    id: '3.3.4_LowPressureSystems',
    title: '【航空気象】低気圧システムと発達過程（CPL学科・スタブ）',
    slug: '3-3-4-low-pressure-systems',
    subCategory: '航空気象',
    orderIndex: 363,
    tags: ['CPL', '学科試験', '航空気象', '低気圧'],
    excerpt: '低気圧・斜面波などシナoptic スケールのスタブ。',
    placeholder: 'Low+Pressure',
    hubId: 'CPL-Hub-Meteorology',
    clusterMd: '**main_subject**: `航空気象` / **sub_subject**: `低気圧` を含むクラスタ。',
    bullets: ['発達・消滅のライフサイクル（定性）', '風・雲・降水とのセット問題'],
    mapping: true,
    sqlPredicate: `q.main_subject = '航空気象' AND q.sub_subject ILIKE '%低気圧%'`,
  },
  {
    id: '3.3.5_AtmosphericStability',
    title: '【航空気象】大気の安定性とショワルター指数（CPL学科・スタブ）',
    slug: '3-3-5-atmospheric-stability',
    subCategory: '航空気象',
    orderIndex: 364,
    tags: ['CPL', '学科試験', '航空気象', '安定度', 'SI'],
    excerpt: '大気安定度・対流・ショワルター指数クラスタ向けスタブ。',
    placeholder: 'Stability',
    hubId: 'CPL-Hub-Meteorology',
    clusterMd: '**main_subject**: `航空気象` / **sub_subject**: `安定`・`ショワルター` を含むクラスタ。',
    bullets: ['乾燥断熱・湿潤断熱と気塊の挙動', 'SI と対流の目安（問題の型）'],
    mapping: true,
    sqlPredicate: `q.main_subject = '航空気象' AND (q.sub_subject ILIKE '%安定%' OR q.sub_subject ILIKE '%ショワルター%')`,
  },
  {
    id: '3.3.6_AtmosphericComposition',
    title: '【航空気象】大気組成と水蒸気の物理（CPL学科・スタブ）',
    slug: '3-3-6-atmospheric-composition',
    subCategory: '航空気象',
    orderIndex: 365,
    tags: ['CPL', '学科試験', '航空気象', '水蒸気', '露点'],
    excerpt: '大気の基礎／温度・水蒸気・露点クラスタ向けスタブ。',
    placeholder: 'Moisture',
    hubId: 'CPL-Hub-Meteorology',
    clusterMd: '**main_subject**: `航空気象` / **sub_subject**: `大気の基礎`・`水蒸気`・`露点` を含むクラスタ。',
    bullets: ['湿度表現と飽和の考え方', '気温露点差と視程・雲底（定性）'],
    mapping: true,
    sqlPredicate: `q.main_subject = '航空気象' AND (q.sub_subject ILIKE '%大気の基礎%' OR q.sub_subject ILIKE '%水蒸気%' OR q.sub_subject ILIKE '%露点%')`,
  },
  {
    id: '3.3.7_WesterliesAndWind',
    title: '【航空気象】偏西風と大気循環（CPL学科・スタブ）',
    slug: '3-3-7-westerlies-and-wind',
    subCategory: '航空気象',
    orderIndex: 366,
    tags: ['CPL', '学科試験', '航空気象', '偏西風', 'ジェット'],
    excerpt: '偏西風・ジェット・大規模循環クラスタ向けスタブ。',
    placeholder: 'Westerlies',
    hubId: 'CPL-Hub-Meteorology',
    clusterMd: '**main_subject**: `航空気象` / **sub_subject**: `偏西風`・`ジェット` を含むクラスタ。',
    bullets: ['三胞モデルと風の鉛直・緯度分布', '航空への影響（後続で具体化）'],
    mapping: true,
    sqlPredicate: `q.main_subject = '航空気象' AND (q.sub_subject ILIKE '%偏西風%' OR q.sub_subject ILIKE '%ジェット%')`,
  },
  {
    id: '3.3.8_ICAOStandardAtmosphere',
    title: '【航空気象】ICAO標準大気の詳細（CPL学科・スタブ）',
    slug: '3-3-8-icao-standard-atmosphere',
    subCategory: '航空気象',
    orderIndex: 367,
    tags: ['CPL', '学科試験', '航空気象', 'ICAO', '標準大気'],
    excerpt: 'ICAO 標準大気・国際標準の表記クラスタ向けスタブ。',
    placeholder: 'ICAO+ISA',
    hubId: 'CPL-Hub-Meteorology',
    clusterMd: '**main_subject**: `航空気象` / **sub_subject**: `ICAO`・`国際標準大気` を含むクラスタ。',
    bullets: ['標準大気表の使い方（高度換算）', '試験の数値問題の型'],
    mapping: true,
    sqlPredicate: `q.main_subject = '航空気象' AND (q.sub_subject ILIKE '%ICAO%' OR q.sub_subject ILIKE '%国際標準大気%')`,
  },
  {
    id: '3.3.9_WeatherHazards',
    title: '【航空気象】航空気象の危険現象（CPL学科・スタブ）',
    slug: '3-3-9-weather-hazards',
    subCategory: '航空気象',
    orderIndex: 368,
    tags: ['CPL', '学科試験', '航空気象', '危険天気', '乱流'],
    excerpt: '乱流・雷・視程不良など危険現象クラスタ向けスタブ。',
    placeholder: 'Hazards',
    hubId: 'CPL-Hub-Meteorology',
    clusterMd: '**main_subject**: `航空気象` / **sub_subject**: `乱流`・`雷`・`視程`・`積乱` を含むクラスタ。',
    bullets: ['回避と運用上の判断の型（学科）', '気象通報とのつながり（後続）'],
    mapping: true,
    sqlPredicate: `q.main_subject = '航空気象' AND (q.sub_subject ILIKE '%乱流%' OR q.sub_subject ILIKE '%雷%' OR q.sub_subject ILIKE '%視程不良%' OR q.sub_subject ILIKE '%積乱%')`,
  },
  {
    id: '3.3.10_CloudTypes',
    title: '【航空気象】雲の種類と特徴（CPL学科・スタブ）',
    slug: '3-3-10-cloud-types',
    subCategory: '航空気象',
    orderIndex: 369,
    tags: ['CPL', '学科試験', '航空気象', '雲形'],
    excerpt: '雲の分類・雲形の識別クラスタ向けスタブ（3.3.2 と重複しうる）。',
    placeholder: 'Cloud+Types',
    hubId: 'CPL-Hub-Meteorology',
    clusterMd: '**main_subject**: `航空気象` / **sub_subject**: `雲` を含み分類・種類を問うクラスタ。',
    bullets: ['10 属のおさらいと航空への意味', '降水・乱流とのセット'],
    mapping: true,
    sqlPredicate: `q.main_subject = '航空気象' AND q.sub_subject ILIKE '%雲%'`,
  },
  {
    id: '3.3.11_VisibilityAndFog',
    title: '【航空気象】視程と霧（CPL学科・スタブ）',
    slug: '3-3-11-visibility-and-fog',
    subCategory: '航空気象',
    orderIndex: 370,
    tags: ['CPL', '学科試験', '航空気象', '視程', '霧'],
    excerpt: '視程・霧・ミスト等のクラスタ向けスタブ。',
    placeholder: 'Visibility',
    hubId: 'CPL-Hub-Meteorology',
    clusterMd: '**main_subject**: `航空気象` / **sub_subject**: `視程`・`霧` を含むクラスタ。',
    bullets: ['霧の発生タイプと場の特徴', 'METAR/TAF との読み合わせ（後続）'],
    mapping: true,
    sqlPredicate: `q.main_subject = '航空気象' AND (q.sub_subject ILIKE '%視程%' OR q.sub_subject ILIKE '%霧%')`,
  },
  {
    id: '3.3.12_Turbulence',
    title: '【航空気象】乱気流の種類と対策（CPL学科・スタブ）',
    slug: '3-3-12-turbulence',
    subCategory: '航空気象',
    orderIndex: 371,
    tags: ['CPL', '学科試験', '航空気象', '乱流'],
    excerpt: '乱流（Turbulence）に特化したクラスタ向けスタブ。',
    placeholder: 'Turbulence',
    hubId: 'CPL-Hub-Meteorology',
    clusterMd: '**main_subject**: `航空気象` / **sub_subject**: `乱流` を含むクラスタ。',
    bullets: ['機械・熱・風切り等のタイプ', '報告・回避の学科定型'],
    mapping: true,
    sqlPredicate: `q.main_subject = '航空気象' AND q.sub_subject ILIKE '%乱流%'`,
  },
  {
    id: '3.4.1_DeadReckoning',
    title: '【空中航法】推測航法の基礎（CPL学科・スタブ）',
    slug: '3-4-1-dead-reckoning',
    subCategory: '空中航法',
    orderIndex: 380,
    tags: ['CPL', '学科試験', '空中航法', '推測航法'],
    excerpt: '推測航法・針路と距離の基礎クラスタ向けスタブ。',
    placeholder: 'DR',
    hubId: 'CPL-Hub-Navigation',
    clusterMd: '**main_subject**: `空中航法` / **sub_subject**: `推測`・`航法` を含むクラスタ（広め。後で分割）。',
    bullets: ['風なし・風ありのベクトルイメージ', '時間・距離・速度の三角関係'],
    mapping: true,
    sqlPredicate: `q.main_subject = '空中航法' AND q.sub_subject ILIKE '%推測%'`,
  },
  {
    id: '3.4.2_VORNavigation',
    title: '【空中航法】VOR航法の原理と使用（CPL学科・スタブ）',
    slug: '3-4-2-vor-navigation',
    subCategory: '空中航法',
    orderIndex: 381,
    tags: ['CPL', '学科試験', '空中航法', 'VOR'],
    excerpt: 'VOR・方位航法クラスタ向けスタブ。',
    placeholder: 'VOR',
    hubId: 'CPL-Hub-Navigation',
    clusterMd: '**main_subject**: `空中航法` / **sub_subject**: `VOR` を含むクラスタ。',
    bullets: ['方位線・トゥ/フロムの考え方', 'CDI の読み（学科の型）'],
    mapping: true,
    sqlPredicate: `q.main_subject = '空中航法' AND q.sub_subject ILIKE '%VOR%'`,
  },
  {
    id: '3.4.3_GPSNavigation',
    title: '【空中航法】GPS航法の基礎（CPL学科・スタブ）',
    slug: '3-4-3-gps-navigation',
    subCategory: '空中航法',
    orderIndex: 382,
    tags: ['CPL', '学科試験', '空中航法', 'GNSS', 'GPS'],
    excerpt: 'GNSS/GPS 航法クラスタ向けスタブ。',
    placeholder: 'GPS',
    hubId: 'CPL-Hub-Navigation',
    clusterMd: '**main_subject**: `空中航法` / **sub_subject**: `GPS`・`GNSS` を含むクラスタ。',
    bullets: ['測位原理の定性理解', '従来航法との併用の論点'],
    mapping: true,
    sqlPredicate: `q.main_subject = '空中航法' AND (q.sub_subject ILIKE '%GPS%' OR q.sub_subject ILIKE '%GNSS%')`,
  },
  {
    id: '3.4.4_FlightPlanning',
    title: '【空中航法】飛行計画と航法計算（CPL学科・スタブ）',
    slug: '3-4-4-flight-planning',
    subCategory: '空中航法',
    orderIndex: 383,
    tags: ['CPL', '学科試験', '空中航法', '飛行計画'],
    excerpt: '航法計画書・所要時間・燃料計算クラスタ向けスタブ。',
    placeholder: 'Flight+Plan',
    hubId: 'CPL-Hub-Navigation',
    clusterMd: '**main_subject**: `空中航法` / **sub_subject**: `航法計画` を含むクラスタ。',
    bullets: ['計画の構成要素（航路・高度・風）', '計算問題の型の洗い出し'],
    mapping: true,
    sqlPredicate: `q.main_subject = '空中航法' AND q.sub_subject ILIKE '%航法計画%'`,
  },
  {
    id: '3.4.5_NDBNavigation',
    title: '【空中航法】NDB航法（CPL学科・スタブ）',
    slug: '3-4-5-ndb-navigation',
    subCategory: '空中航法',
    orderIndex: 384,
    tags: ['CPL', '学科試験', '空中航法', 'NDB', 'ADF'],
    excerpt: 'NDB/ADF 航法クラスタ向けスタブ。',
    placeholder: 'NDB',
    hubId: 'CPL-Hub-Navigation',
    clusterMd: '**main_subject**: `空中航法` / **sub_subject**: `NDB` を含むクラスタ。',
    bullets: ['相対方位・絶対方位の整理', '誤差・最小性能の論点（後続）'],
    mapping: true,
    sqlPredicate: `q.main_subject = '空中航法' AND q.sub_subject ILIKE '%NDB%'`,
  },
  {
    id: '3.4.6_DMENavigation',
    title: '【空中航法】DME航法（CPL学科・スタブ）',
    slug: '3-4-6-dme-navigation',
    subCategory: '空中航法',
    orderIndex: 385,
    tags: ['CPL', '学科試験', '空中航法', 'DME'],
    excerpt: 'DME・スラントレンジクラスタ向けスタブ。',
    placeholder: 'DME',
    hubId: 'CPL-Hub-Navigation',
    clusterMd: '**main_subject**: `空中航法` / **sub_subject**: `DME` を含むクラスタ。',
    bullets: ['距離表示と高度の関係（斜距離）', 'VOR/DME 併用のイメージ'],
    mapping: true,
    sqlPredicate: `q.main_subject = '空中航法' AND q.sub_subject ILIKE '%DME%'`,
  },
  {
    id: '3.4.7_DeadReckoningAdvanced',
    title: '【空中航法】推測航法の応用（CPL学科・スタブ）',
    slug: '3-4-7-dead-reckoning-advanced',
    subCategory: '空中航法',
    orderIndex: 386,
    tags: ['CPL', '学科試験', '空中航法', '風修正', '所要時間'],
    excerpt: '風修正・所要時間・偏流推算クラスタ向けスタブ。',
    placeholder: 'DR+Adv',
    hubId: 'CPL-Hub-Navigation',
    clusterMd: '**main_subject**: `空中航法` / **sub_subject**: `所要時間`・`風` 等を含むクラスタ（広め）。',
    bullets: ['風三角形・偏流角の考え方', '計算手順の型（後続で例題）'],
    mapping: true,
    sqlPredicate: `q.main_subject = '空中航法' AND (q.sub_subject ILIKE '%所要時間%' OR q.sub_subject ILIKE '%風修正%' OR q.sub_subject ILIKE '%偏流%')`,
  },
  {
    id: '3.5.1_AirTrafficServices',
    title: '【航空通信】航空交通業務の基礎（CPL学科・スタブ）',
    slug: '3-5-1-air-traffic-services',
    subCategory: '航空通信',
    orderIndex: 390,
    tags: ['CPL', '学科試験', '航空通信', '航空交通業務'],
    excerpt: '航空交通業務クラスタ向けスタブ。',
    placeholder: 'ATS',
    hubId: 'CPL-Hub-Communication',
    clusterMd: '**main_subject**: `航空通信` / **sub_subject**: `航空交通業務` を含むクラスタ。',
    bullets: ['管制・情報・警急の枠組み', '試験で問われる定義問題'],
    mapping: true,
    sqlPredicate: `q.main_subject = '航空通信' AND q.sub_subject ILIKE '%航空交通業務%'`,
  },
  {
    id: '3.5.2_AeronauticalInformation',
    title: '【航空通信】航空情報業務（CPL学科・スタブ）',
    slug: '3-5-2-aeronautical-information',
    subCategory: '航空通信',
    orderIndex: 391,
    tags: ['CPL', '学科試験', '航空通信', '航空情報'],
    excerpt: '航空情報（AIP/NOTAM 等）業務クラスタ向けスタブ。',
    placeholder: 'AIS',
    hubId: 'CPL-Hub-Communication',
    clusterMd: '**main_subject**: `航空通信` / **sub_subject**: `航空情報` を含むクラスタ。',
    bullets: ['情報の種類と優先度', '運航判断との接続（後続）'],
    mapping: true,
    sqlPredicate: `q.main_subject = '航空通信' AND q.sub_subject ILIKE '%航空情報%'`,
  },
  {
    id: '3.5.3_RadioCommunication',
    title: '【航空通信】無線通信の基本手順（CPL学科・スタブ）',
    slug: '3-5-3-radio-communication',
    subCategory: '航空通信',
    orderIndex: 392,
    tags: ['CPL', '学科試験', '航空通信', '無線'],
    excerpt: '無線・電話通信手順クラスタ向けスタブ。',
    placeholder: 'Radio',
    hubId: 'CPL-Hub-Communication',
    clusterMd: '**main_subject**: `航空通信` / **sub_subject**: `無線`・`電話通信` を含むクラスタ。',
    bullets: ['呼出し・復唱・読み方の基本', 'クリアランスの聞き取り（学科）'],
    mapping: true,
    sqlPredicate: `q.main_subject = '航空通信' AND (q.sub_subject ILIKE '%無線%' OR q.sub_subject ILIKE '%電話通信%')`,
  },
  {
    id: '3.5.4_EmergencyProcedures',
    title: '【航空通信】緊急時の通信手順（CPL学科・スタブ）',
    slug: '3-5-4-emergency-procedures',
    subCategory: '航空通信',
    orderIndex: 393,
    tags: ['CPL', '学科試験', '航空通信', '緊急', '遭難'],
    excerpt: '緊急・遭難・救難通信クラスタ向けスタブ。',
    placeholder: 'Emergency',
    hubId: 'CPL-Hub-Communication',
    clusterMd: '**main_subject**: `航空通信` / **sub_subject**: `緊急`・`遭難`・`救難` を含むクラスタ。',
    bullets: ['MAYDAY/PAN の使い分け（運用）', '学科での定型シナリオ'],
    mapping: true,
    sqlPredicate: `q.main_subject = '航空通信' AND (q.sub_subject ILIKE '%緊急%' OR q.sub_subject ILIKE '%遭難%' OR q.sub_subject ILIKE '%救難%')`,
  },
  {
    id: '3.5.5_ATCPhraseology',
    title: '【航空通信】管制用語の詳細（CPL学科・スタブ）',
    slug: '3-5-5-atc-phraseology',
    subCategory: '航空通信',
    orderIndex: 394,
    tags: ['CPL', '学科試験', '航空通信', '管制', '用語'],
    excerpt: '管制用語・フレーズロジー関連クラスタ向けスタブ。',
    placeholder: 'Phraseology',
    hubId: 'CPL-Hub-Communication',
    clusterMd: '**main_subject**: `航空通信` / **sub_subject**: `管制`・`用語`・`音声` を含むクラスタ。',
    bullets: ['標準フレーズと意図の対応', '紛らわしい表現の整理（後続）'],
    mapping: true,
    sqlPredicate: `q.main_subject = '航空通信' AND (q.sub_subject ILIKE '%管制%用語%' OR q.sub_subject ILIKE '%フレーズ%' OR (q.sub_subject ILIKE '%管制%' AND q.sub_subject ILIKE '%音声%'))`,
  },
];

function buildMdx(l) {
  const hubMd = l.hubId
    ? `\n\n**科目ハブ**: [同科目の全体プールへ](/articles/${l.hubId})\n`
    : '';
  const bullets = l.bullets.map((b) => `- ${b}`).join('\n');
  const imgSrc = `https://placehold.co/1200x630/1a1a1a/FFF?text=${encodeURIComponent(l.placeholder)}`;

  return `import { Callout, Image } from '@mdx'
import React from 'react'

export const meta = {
  type: 'lesson',
  title: ${JSON.stringify(l.title)},
  slug: ${JSON.stringify(l.slug)},
  date: '2026-04-10',
  author: 'Michizane (Shadow)',
  tags: ${JSON.stringify(l.tags)},
  series: 'CPL-Learning-Stub',
  order: ${Math.min(l.orderIndex % 1000, 999)},
  readingTime: 5,
  excerpt: ${JSON.stringify(l.excerpt)},
  publishedAt: '2026-04-10'
};

<Image
  src="${imgSrc}"
  alt=${JSON.stringify(l.title)}
  width={1200}
  height={630}
/>

## この記事で書く内容（執筆スコープ）

${l.clusterMd}

${bullets}
${hubMd}
> **データ連携**: [\`20260410_cpl_stub_lessons_contents_and_mapping.sql\`](../../../scripts/database/20260410_cpl_stub_lessons_contents_and_mapping.sql) で \`learning_contents\` と \`learning_test_mapping\`（対象クラスタの verified 設問 UUID）を冪等投入する想定です。

<Callout type="info" title="本文は準備中">
  Supabase で \`unified_cpl_questions\` の当該 \`sub_subject\` を確認し、本文の見出しをクラスタ名に合わせると運用が楽です。
</Callout>

---

## 学習目標（執筆時のチェックリスト）

- [ ] 対象クラスタの用語と試験で問われる因果関係を整理する
- [ ] クイズの \`main_subject\` / \`sub_subject\` と本文の見出しを一致させる

export default ({ children }) => <>{children}</>
`;
}

function escSqlStr(s) {
  return s.replace(/'/g, "''");
}

function buildSql() {
  const valueRows = LESSONS.map((l) => {
    const desc = escSqlStr(`${l.excerpt}（スタブ）`);
    const title = escSqlStr(l.title);
    return `  (
    '${l.id}',
    '${title}',
    'CPL学科',
    '${desc}',
    ${l.orderIndex},
    'text',
    true,
    '${escSqlStr(l.subCategory)}',
    now(),
    now()
  )`;
  }).join(',\n');

  const mappingBlocks = LESSONS.filter((l) => l.mapping).map((l) => {
    const pred = l.sqlPredicate;
    const topic = escSqlStr(l.subCategory);
    return `INSERT INTO learning_test_mapping (
  learning_content_id,
  content_title,
  content_category,
  test_question_ids,
  unified_cpl_question_ids,
  topic_category,
  subject_area,
  mapping_source,
  verification_status
)
SELECT
  lc.id,
  lc.title,
  lc.category,
  (SELECT COALESCE(array_agg(q.id::text ORDER BY q.id), ARRAY[]::text[])
   FROM unified_cpl_questions q
   WHERE q.verification_status = 'verified'
     AND (${pred})),
  (SELECT COALESCE(array_agg(q.id ORDER BY q.id), ARRAY[]::uuid[])
   FROM unified_cpl_questions q
   WHERE q.verification_status = 'verified'
     AND (${pred})),
  '${topic}',
  '${topic}',
  'cpl_stub_20260410',
  'verified'
FROM learning_contents lc
WHERE lc.id = '${l.id}'
  AND NOT EXISTS (SELECT 1 FROM learning_test_mapping m WHERE m.learning_content_id = lc.id)
  AND EXISTS (
    SELECT 1 FROM unified_cpl_questions q
    WHERE q.verification_status = 'verified'
      AND (${pred})
    LIMIT 1
  );
`;
  });

  return `-- CPL スタブ記事: learning_contents 補完 + learning_test_mapping（2026-04-10）
-- docs/06 Phase1+2 の MDX id と整合。3.1.1 はマッピング既存想定のため本ファイルでは mapping を追加しない。
-- 冪等: learning_contents ON CONFLICT (id) DO NOTHING / mapping は NOT EXISTS。
-- 検証: 投入後、各 learning_content_id で cardinality(unified_cpl_question_ids) を確認。

BEGIN;

INSERT INTO learning_contents (
  id, title, category, description, order_index, content_type,
  is_published, sub_category, created_at, updated_at
) VALUES
${valueRows}
ON CONFLICT (id) DO NOTHING;

${mappingBlocks.join('\n')}

COMMIT;
`;
}

function main() {
  if (!fs.existsSync(LESSONS_DIR)) {
    throw new Error(`Missing lessons dir: ${LESSONS_DIR}`);
  }
  let written = 0;
  let skipped = 0;
  for (const l of LESSONS) {
    const fp = path.join(LESSONS_DIR, `${l.id}.mdx`);
    if (fs.existsSync(fp)) {
      skipped += 1;
      continue;
    }
    fs.writeFileSync(fp, buildMdx(l), 'utf8');
    written += 1;
  }
  fs.writeFileSync(SQL_OUT, buildSql(), 'utf8');
  // eslint-disable-next-line no-console
  console.log(`MDX written: ${written}, skipped (exists): ${skipped}, SQL -> ${path.relative(ROOT, SQL_OUT)}`);
}

main();
