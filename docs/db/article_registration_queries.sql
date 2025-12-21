-- ============================================================
-- Phase 1: 高頻出問題記事のデータベース登録用SQL
-- 作成日: 2025年1月16日
-- 目的: learning_contentsテーブルとlearning_test_mappingテーブルへの登録
-- ============================================================

-- ============================================================
-- 1. learning_contentsテーブルへの登録
-- ============================================================

-- 航空気象シリーズ（新規7記事）
INSERT INTO learning_contents (
  id, title, category, sub_category, description, order_index,
  parent_id, content_type, is_published, created_at, updated_at
) VALUES
-- 3.3.3_FrontsAndWeatherSystems - 前線と気象システム
(
  '3.3.3_FrontsAndWeatherSystems',
  '【航空気象 Mission W-3】前線と気象システム - 天気図を読む力',
  'CPL学科',
  '航空気象',
  '温暖前線・寒冷前線・気団の特徴と、前線通過時の天候変化を実際の試験問題から学ぶ。重要度8.0の高頻出トピック。',
  333,
  NULL,
  'article',
  true,
  now(),
  now()
),
-- 3.3.4_LowPressureSystems - 低気圧システムと発達過程
(
  '3.3.4_LowPressureSystems',
  '【航空気象 Mission W-4】低気圧システムと発達過程 - 温帯低気圧のメカニズム',
  'CPL学科',
  '航空気象',
  '温帯低気圧の発達メカニズム、衰弱過程、日本付近での特徴を解説。重要度8.0の高頻出トピック。',
  334,
  NULL,
  'article',
  true,
  now(),
  now()
),
-- 3.3.5_AtmosphericStability - 大気の安定性とショワルター指数
(
  '3.3.5_AtmosphericStability',
  '【航空気象 Mission W-5】大気の安定性とショワルター指数 - 乱気流を予測する',
  'CPL学科',
  '航空気象',
  '大気の安定性判定、ショワルター指数の計算と解釈、乱気流との関係。重要度8.0の高頻出トピック。',
  335,
  NULL,
  'article',
  true,
  now(),
  now()
),
-- 3.3.6_AtmosphericComposition - 大気組成と水蒸気の物理
(
  '3.3.6_AtmosphericComposition',
  '【航空気象 Mission W-6】大気組成と水蒸気の物理 - 空気の正体を知る',
  'CPL学科',
  '航空気象',
  '大気の組成、水蒸気の状態変化と潜熱、露点温度の意味と測定。重要度8.0の高頻出トピック。',
  336,
  NULL,
  'article',
  true,
  now(),
  now()
),
-- 3.3.7_WesterliesAndWind - 偏西風と大気循環
(
  '3.3.7_WesterliesAndWind',
  '【航空気象 Mission W-7】偏西風と大気循環 - 高度による風の変化',
  'CPL学科',
  '航空気象',
  '偏西風の成因、高度による変化、航空機への影響。重要度8.0の高頻出トピック。',
  337,
  NULL,
  'article',
  true,
  now(),
  now()
),
-- 3.3.8_ICAOStandardAtmosphere - ICAO標準大気の詳細
(
  '3.3.8_ICAOStandardAtmosphere',
  '【航空気象 Mission W-8】ICAO標準大気の詳細 - 高度と気温の関係',
  'CPL学科',
  '航空気象',
  'ICAO標準大気の定義、気温・気圧・密度の高度による変化、計算方法。重要度8.0の高頻出トピック。',
  338,
  NULL,
  'article',
  true,
  now(),
  now()
),
-- 3.3.9_WeatherHazards - 航空気象の危険現象
(
  '3.3.9_WeatherHazards',
  '【航空気象 Mission W-9】航空気象の危険現象 - 安全飛行のための知識',
  'CPL学科',
  '航空気象',
  '乱気流、着氷、雷雨、霧など航空機への危険な気象現象の特徴と対策。',
  339,
  NULL,
  'article',
  true,
  now(),
  now()
)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  updated_at = now();

-- 航空工学シリーズ（新規3記事）
INSERT INTO learning_contents (
  id, title, category, sub_category, description, order_index,
  parent_id, content_type, is_published, created_at, updated_at
) VALUES
-- 3.2.7_LiftAndDrag - 揚力と抗力の詳細
(
  '3.2.7_LiftAndDrag',
  '【航空工学 Mission E-7】揚力と抗力の詳細 - 飛行の基本原理',
  'CPL学科',
  '航空工学',
  '揚力発生のメカニズム、抗力の種類と特性、揚抗比の重要性。重要度8.0の高頻出トピック。',
  327,
  NULL,
  'article',
  true,
  now(),
  now()
),
-- 3.2.8_PowerAndPerformance - 必要馬力と利用馬力
(
  '3.2.8_PowerAndPerformance',
  '【航空工学 Mission E-8】必要馬力と利用馬力 - 性能曲線の読み方',
  'CPL学科',
  '航空工学',
  '必要馬力と利用馬力の関係、性能曲線、最適速度の決定。重要度8.0の高頻出トピック。',
  328,
  NULL,
  'article',
  true,
  now(),
  now()
),
-- 3.2.9_PitotStaticSystem - ピトー静圧系統の詳細
(
  '3.2.9_PitotStaticSystem',
  '【航空工学 Mission E-9】ピトー静圧系統の詳細 - 計器の動作原理',
  'CPL学科',
  '航空工学',
  'ピトー管と静圧孔の原理、対気速度計・高度計・昇降計の動作原理。重要度8.0の高頻出トピック。',
  329,
  NULL,
  'article',
  true,
  now(),
  now()
)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  updated_at = now();

-- 航空法規シリーズ（新規2記事）
INSERT INTO learning_contents (
  id, title, category, sub_category, description, order_index,
  parent_id, content_type, is_published, created_at, updated_at
) VALUES
-- 3.1.5_AirspaceClassification - 空域分類とクラスC空域
(
  '3.1.5_AirspaceClassification',
  '【航空法規 Mission L-5】空域分類とクラスC空域 - 空域の理解',
  'CPL学科',
  '航空法規',
  '空域分類（クラスA/B/C/D/E/G）の特徴、クラスC空域の飛行規則。重要度8.0の高頻出トピック。',
  315,
  NULL,
  'article',
  true,
  now(),
  now()
),
-- 3.1.6_IFRMinimumAltitude - 計器飛行方式の最低高度
(
  '3.1.6_IFRMinimumAltitude',
  '【航空法規 Mission L-6】計器飛行方式の最低高度 - IFR飛行の規則',
  'CPL学科',
  '航空法規',
  '計器飛行方式（IFR）の最低高度規定、地形クリアランス、安全高度。重要度8.0の高頻出トピック。',
  316,
  NULL,
  'article',
  true,
  now(),
  now()
)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  updated_at = now();

-- 航空通信シリーズ（新規3記事）
INSERT INTO learning_contents (
  id, title, category, sub_category, description, order_index,
  parent_id, content_type, is_published, created_at, updated_at
) VALUES
-- 3.5.1_AirTrafficServices - 航空交通業務の基礎
(
  '3.5.1_AirTrafficServices',
  '【航空通信 Mission C-1】航空交通業務の基礎 - 管制圏と情報圏',
  'CPL学科',
  '航空通信',
  '管制圏・情報圏・目視位置通報点の違い、飛行規則と手続き。重要度8.0の高頻出トピック。',
  351,
  NULL,
  'article',
  true,
  now(),
  now()
),
-- 3.5.2_AeronauticalInformation - 航空情報業務
(
  '3.5.2_AeronauticalInformation',
  '【航空通信 Mission C-2】航空情報業務 - AISとNOTAM',
  'CPL学科',
  '航空通信',
  '航空情報業務（AIS）の種類、NOTAM、AIP、航空情報の取得方法。重要度8.0の高頻出トピック。',
  352,
  NULL,
  'article',
  true,
  now(),
  now()
),
-- 3.5.3_RadioCommunication - 無線通信の基本手順
(
  '3.5.3_RadioCommunication',
  '【航空通信 Mission C-3】無線通信の基本手順 - 標準的な管制用語',
  'CPL学科',
  '航空通信',
  '標準的な無線通信手順、管制用語、緊急時の通信方法。',
  353,
  NULL,
  'article',
  true,
  now(),
  now()
)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  updated_at = now();

-- 空中航法シリーズ（新規4記事）
INSERT INTO learning_contents (
  id, title, category, sub_category, description, order_index,
  parent_id, content_type, is_published, created_at, updated_at
) VALUES
-- 3.4.1_DeadReckoning - 推測航法の基礎
(
  '3.4.1_DeadReckoning',
  '【空中航法 Mission N-1】推測航法の基礎 - 風力三角形の理解',
  'CPL学科',
  '空中航法',
  '推測航法の原理、風力三角形の構成要素、偏流角とHeading/Trackの関係。',
  341,
  NULL,
  'article',
  true,
  now(),
  now()
),
-- 3.4.2_VORNavigation - VOR航法の原理と使用
(
  '3.4.2_VORNavigation',
  '【空中航法 Mission N-2】VOR航法の原理と使用 - TO/FROM表示の読み方',
  'CPL学科',
  '空中航法',
  'VORの信号構造、TO/FROM表示の意味、CDIの読み方、位置特定方法。',
  342,
  NULL,
  'article',
  true,
  now(),
  now()
),
-- 3.4.3_GPSNavigation - GPS航法の基礎
(
  '3.4.3_GPSNavigation',
  '【空中航法 Mission N-3】GPS航法の基礎 - 衛星測位の原理',
  'CPL学科',
  '空中航法',
  'GPSの基本原理、測位に必要な衛星数、精度向上の手法、航空機への応用。',
  343,
  NULL,
  'article',
  true,
  now(),
  now()
),
-- 3.4.4_FlightPlanning - 飛行計画と航法計算
(
  '3.4.4_FlightPlanning',
  '【空中航法 Mission N-4】飛行計画と航法計算 - 対地速度と飛行時間',
  'CPL学科',
  '空中航法',
  '飛行計画の作成、対地速度と飛行時間の計算、風の影響を考慮した進路修正。',
  344,
  NULL,
  'article',
  true,
  now(),
  now()
)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  updated_at = now();

-- ============================================================
-- 2. learning_test_mappingテーブルへの登録
-- ============================================================

-- 3.3.3_FrontsAndWeatherSystems - 前線と気象システム
INSERT INTO learning_test_mapping (
  learning_content_id,
  content_title,
  content_category,
  topic_category,
  subject_area,
  unified_cpl_question_ids,
  relationship_type,
  weight_score,
  difficulty_level,
  estimated_study_time,
  mapping_source,
  confidence_score,
  verification_status,
  created_at,
  updated_at
) VALUES (
  '3.3.3_FrontsAndWeatherSystems',
  '【航空気象 Mission W-3】前線と気象システム - 天気図を読む力',
  'CPL学科',
  '前線と気象システム',
  '航空気象',
  ARRAY[
    'b55d3abd-9d4c-4c8c-a39e-bc6f7ae4db7e',  -- 温暖前線の特徴（重要度8.0）
    '5482dce0-be85-43b4-9ffb-79adac6e1d16',  -- 寒冷前線の特徴（重要度8.0）
    '96ba47fc-ddfc-4730-9836-2093e8549e28',  -- 前線（重要度6.2）
    '652b3a72-0b04-416a-b2cd-4b21c1455b97'   -- 温暖前線（重要度6.0）
  ]::uuid[],
  'direct',
  1.0,
  3,
  45,
  'manual',
  0.95,
  'verified',
  now(),
  now()
)
ON CONFLICT (learning_content_id) DO UPDATE SET
  unified_cpl_question_ids = EXCLUDED.unified_cpl_question_ids,
  updated_at = now();

-- 3.3.4_LowPressureSystems - 低気圧システムと発達過程
INSERT INTO learning_test_mapping (
  learning_content_id,
  content_title,
  content_category,
  topic_category,
  subject_area,
  unified_cpl_question_ids,
  relationship_type,
  weight_score,
  difficulty_level,
  estimated_study_time,
  mapping_source,
  confidence_score,
  verification_status,
  created_at,
  updated_at
) VALUES (
  '3.3.4_LowPressureSystems',
  '【航空気象 Mission W-4】低気圧システムと発達過程 - 温帯低気圧のメカニズム',
  'CPL学科',
  '低気圧システム',
  '航空気象',
  ARRAY[
    '422c125b-a39b-4779-9471-1e78b3174753',  -- 温帯低気圧の発達と衰弱（重要度8.0）
    '85f8fc3b-4be3-405d-815d-6e5331cb51d2'   -- 低気圧（重要度6.6）
  ]::uuid[],
  'direct',
  1.0,
  3,
  40,
  'manual',
  0.95,
  'verified',
  now(),
  now()
)
ON CONFLICT (learning_content_id) DO UPDATE SET
  unified_cpl_question_ids = EXCLUDED.unified_cpl_question_ids,
  updated_at = now();

-- 3.3.5_AtmosphericStability - 大気の安定性とショワルター指数
INSERT INTO learning_test_mapping (
  learning_content_id,
  content_title,
  content_category,
  topic_category,
  subject_area,
  unified_cpl_question_ids,
  relationship_type,
  weight_score,
  difficulty_level,
  estimated_study_time,
  mapping_source,
  confidence_score,
  verification_status,
  created_at,
  updated_at
) VALUES (
  '3.3.5_AtmosphericStability',
  '【航空気象 Mission W-5】大気の安定性とショワルター指数 - 乱気流を予測する',
  'CPL学科',
  '大気の安定性',
  '航空気象',
  ARRAY[
    '89dfcb55-e433-4104-8eab-4be3ccf89df6',  -- ショワルター指数（重要度8.0）
    '6d574f72-e1fc-4dcd-973a-8fba6bea100f'   -- ショワルター指数（重要度6.8）
  ]::uuid[],
  'direct',
  1.0,
  3,
  40,
  'manual',
  0.95,
  'verified',
  now(),
  now()
)
ON CONFLICT (learning_content_id) DO UPDATE SET
  unified_cpl_question_ids = EXCLUDED.unified_cpl_question_ids,
  updated_at = now();

-- 3.3.6_AtmosphericComposition - 大気組成と水蒸気の物理
INSERT INTO learning_test_mapping (
  learning_content_id,
  content_title,
  content_category,
  topic_category,
  subject_area,
  unified_cpl_question_ids,
  relationship_type,
  weight_score,
  difficulty_level,
  estimated_study_time,
  mapping_source,
  confidence_score,
  verification_status,
  created_at,
  updated_at
) VALUES (
  '3.3.6_AtmosphericComposition',
  '【航空気象 Mission W-6】大気組成と水蒸気の物理 - 空気の正体を知る',
  'CPL学科',
  '大気組成',
  '航空気象',
  ARRAY[
    'a2d4b66a-a361-4cd6-8b47-894ba347e494',  -- 水蒸気の熱（重要度8.0）
    '17a2e8e3-034f-41ec-b9fc-a163956a4b95',  -- 露点温度（重要度8.0）
    '8a45911a-1829-46e6-b7f4-34798d0b3083',  -- 大気組成（重要度6.0）
    '7a45edd0-10a6-4864-8bb2-1ecc212afc19',  -- 水蒸気（重要度6.5）
    '10c3a513-d1d6-4256-af99-e11bd1e2fd7d'  -- 露点温度（重要度5.8）
  ]::uuid[],
  'direct',
  1.0,
  3,
  50,
  'manual',
  0.95,
  'verified',
  now(),
  now()
)
ON CONFLICT (learning_content_id) DO UPDATE SET
  unified_cpl_question_ids = EXCLUDED.unified_cpl_question_ids,
  updated_at = now();

-- 3.3.7_WesterliesAndWind - 偏西風と大気循環
INSERT INTO learning_test_mapping (
  learning_content_id,
  content_title,
  content_category,
  topic_category,
  subject_area,
  unified_cpl_question_ids,
  relationship_type,
  weight_score,
  difficulty_level,
  estimated_study_time,
  mapping_source,
  confidence_score,
  verification_status,
  created_at,
  updated_at
) VALUES (
  '3.3.7_WesterliesAndWind',
  '【航空気象 Mission W-7】偏西風と大気循環 - 高度による風の変化',
  'CPL学科',
  '偏西風',
  '航空気象',
  ARRAY[
    'd8b4d567-fe82-4c67-867d-19bc990edc32',  -- 偏西風（重要度8.0）
    '516df32c-ca38-492e-991d-e6b2a6516f54'   -- 偏西風（重要度5.4）
  ]::uuid[],
  'direct',
  1.0,
  3,
  35,
  'manual',
  0.95,
  'verified',
  now(),
  now()
)
ON CONFLICT (learning_content_id) DO UPDATE SET
  unified_cpl_question_ids = EXCLUDED.unified_cpl_question_ids,
  updated_at = now();

-- 3.3.8_ICAOStandardAtmosphere - ICAO標準大気の詳細
INSERT INTO learning_test_mapping (
  learning_content_id,
  content_title,
  content_category,
  topic_category,
  subject_area,
  unified_cpl_question_ids,
  relationship_type,
  weight_score,
  difficulty_level,
  estimated_study_time,
  mapping_source,
  confidence_score,
  verification_status,
  created_at,
  updated_at
) VALUES (
  '3.3.8_ICAOStandardAtmosphere',
  '【航空気象 Mission W-8】ICAO標準大気の詳細 - 高度と気温の関係',
  'CPL学科',
  'ICAO標準大気',
  '航空気象',
  ARRAY[
    '96c2fb26-ca3e-4837-891e-4f42c30005d8',  -- ICAO標準大気の気温計算（重要度8.0）
    '9a667bee-0f4c-4f47-99c0-bf006a1e7092'   -- 標準大気（重要度5.2）
  ]::uuid[],
  'direct',
  1.0,
  3,
  40,
  'manual',
  0.95,
  'verified',
  now(),
  now()
)
ON CONFLICT (learning_content_id) DO UPDATE SET
  unified_cpl_question_ids = EXCLUDED.unified_cpl_question_ids,
  updated_at = now();

-- 3.3.9_WeatherHazards - 航空気象の危険現象
INSERT INTO learning_test_mapping (
  learning_content_id,
  content_title,
  content_category,
  topic_category,
  subject_area,
  unified_cpl_question_ids,
  relationship_type,
  weight_score,
  difficulty_level,
  estimated_study_time,
  mapping_source,
  confidence_score,
  verification_status,
  created_at,
  updated_at
) VALUES (
  '3.3.9_WeatherHazards',
  '【航空気象 Mission W-9】航空気象の危険現象 - 安全飛行のための知識',
  'CPL学科',
  '気象危険現象',
  '航空気象',
  ARRAY[
    'c2fdd66f-a2d5-4972-8963-2ce0d31852ff',  -- 晴天乱気流（重要度5.0）
    '0394afa0-4559-4afb-bf66-316af8981634',  -- 前線通過時の気象現象（重要度5.0）
    'c7eefb6e-b8a9-45a5-9296-943b3d65f0bc',  -- 寒冷前線の気象現象（重要度5.0）
    'a97337ba-5baa-4e75-9840-c1007d8094c9',  -- 霧の形成（重要度5.0）
    '26291fd9-1e2b-4e42-aedd-d326b1db77fc',  -- 前線性の霧（重要度5.0）
    '76546e38-699c-4f06-9ee5-c0dac02de9c2',  -- 着氷（重要度5.0）
    '42140bec-5847-44dd-91ec-21f581d10d2f',  -- 雷雨（重要度5.0）
    '103473dd-a38f-402e-bde9-c7d18fc12288'   -- CAT（重要度5.0）
  ]::uuid[],
  'direct',
  1.0,
  3,
  60,
  'manual',
  0.90,
  'verified',
  now(),
  now()
)
ON CONFLICT (learning_content_id) DO UPDATE SET
  unified_cpl_question_ids = EXCLUDED.unified_cpl_question_ids,
  updated_at = now();

-- 3.2.7_LiftAndDrag - 揚力と抗力の詳細
INSERT INTO learning_test_mapping (
  learning_content_id,
  content_title,
  content_category,
  topic_category,
  subject_area,
  unified_cpl_question_ids,
  relationship_type,
  weight_score,
  difficulty_level,
  estimated_study_time,
  mapping_source,
  confidence_score,
  verification_status,
  created_at,
  updated_at
) VALUES (
  '3.2.7_LiftAndDrag',
  '【航空工学 Mission E-7】揚力と抗力の詳細 - 飛行の基本原理',
  'CPL学科',
  '揚力と抗力',
  '航空工学',
  ARRAY[
    '4f8edd9d-57d2-4d1d-a4b5-0586d953d965',  -- 揚力発生（重要度8.0）
    '538ab640-10e5-4db4-afeb-46cb9a684130',  -- 抗力（重要度8.0）
    '5c31551f-a568-4011-9ebf-c8292b26641e',  -- 揚力（重要度6.8）
    '8f8704ea-e942-4317-a9cf-51322a9acdae'   -- 抗力（重要度6.5）
  ]::uuid[],
  'direct',
  1.0,
  3,
  50,
  'manual',
  0.95,
  'verified',
  now(),
  now()
)
ON CONFLICT (learning_content_id) DO UPDATE SET
  unified_cpl_question_ids = EXCLUDED.unified_cpl_question_ids,
  updated_at = now();

-- 3.2.8_PowerAndPerformance - 必要馬力と利用馬力
INSERT INTO learning_test_mapping (
  learning_content_id,
  content_title,
  content_category,
  topic_category,
  subject_area,
  unified_cpl_question_ids,
  relationship_type,
  weight_score,
  difficulty_level,
  estimated_study_time,
  mapping_source,
  confidence_score,
  verification_status,
  created_at,
  updated_at
) VALUES (
  '3.2.8_PowerAndPerformance',
  '【航空工学 Mission E-8】必要馬力と利用馬力 - 性能曲線の読み方',
  'CPL学科',
  '必要馬力と利用馬力',
  '航空工学',
  ARRAY[
    'f1393290-bba8-4f5b-8d8e-d9bb1a3898a4',  -- 必要馬力と利用馬力（重要度8.0）
    'edc29a4d-3288-41dc-845b-76cf8b67d5db'   -- 必要馬力と利用馬力（重要度6.5）
  ]::uuid[],
  'direct',
  1.0,
  3,
  40,
  'manual',
  0.95,
  'verified',
  now(),
  now()
)
ON CONFLICT (learning_content_id) DO UPDATE SET
  unified_cpl_question_ids = EXCLUDED.unified_cpl_question_ids,
  updated_at = now();

-- 3.2.9_PitotStaticSystem - ピトー静圧系統の詳細
INSERT INTO learning_test_mapping (
  learning_content_id,
  content_title,
  content_category,
  topic_category,
  subject_area,
  unified_cpl_question_ids,
  relationship_type,
  weight_score,
  difficulty_level,
  estimated_study_time,
  mapping_source,
  confidence_score,
  verification_status,
  created_at,
  updated_at
) VALUES (
  '3.2.9_PitotStaticSystem',
  '【航空工学 Mission E-9】ピトー静圧系統の詳細 - 計器の動作原理',
  'CPL学科',
  'ピトー静圧系統',
  '航空工学',
  ARRAY[
    '3b0e54f2-1c26-4fa6-970a-9316fb59b8e7',  -- ピトー静圧系統（重要度8.0）
    '28bf9002-5df8-4271-bf11-6bd54e78cbc0'   -- ピトー静圧系統（重要度6.5）
  ]::uuid[],
  'direct',
  1.0,
  3,
  40,
  'manual',
  0.95,
  'verified',
  now(),
  now()
)
ON CONFLICT (learning_content_id) DO UPDATE SET
  unified_cpl_question_ids = EXCLUDED.unified_cpl_question_ids,
  updated_at = now();

-- 3.1.5_AirspaceClassification - 空域分類とクラスC空域
INSERT INTO learning_test_mapping (
  learning_content_id,
  content_title,
  content_category,
  topic_category,
  subject_area,
  unified_cpl_question_ids,
  relationship_type,
  weight_score,
  difficulty_level,
  estimated_study_time,
  mapping_source,
  confidence_score,
  verification_status,
  created_at,
  updated_at
) VALUES (
  '3.1.5_AirspaceClassification',
  '【航空法規 Mission L-5】空域分類とクラスC空域 - 空域の理解',
  'CPL学科',
  '空域分類',
  '航空法規',
  ARRAY[
    '89ef1bc8-1ce1-4c74-8562-321d9c05f98f',  -- クラスC空域（重要度8.0）
    'a8a765d4-8997-42a1-a357-1fcbf0dfe0cc'  -- クラスC空域（重要度7.5）
  ]::uuid[],
  'direct',
  1.0,
  3,
  40,
  'manual',
  0.95,
  'verified',
  now(),
  now()
)
ON CONFLICT (learning_content_id) DO UPDATE SET
  unified_cpl_question_ids = EXCLUDED.unified_cpl_question_ids,
  updated_at = now();

-- 3.1.6_IFRMinimumAltitude - 計器飛行方式の最低高度
INSERT INTO learning_test_mapping (
  learning_content_id,
  content_title,
  content_category,
  topic_category,
  subject_area,
  unified_cpl_question_ids,
  relationship_type,
  weight_score,
  difficulty_level,
  estimated_study_time,
  mapping_source,
  confidence_score,
  verification_status,
  created_at,
  updated_at
) VALUES (
  '3.1.6_IFRMinimumAltitude',
  '【航空法規 Mission L-6】計器飛行方式の最低高度 - IFR飛行の規則',
  'CPL学科',
  '計器飛行方式',
  '航空法規',
  ARRAY[
    '7ec0c0e8-653d-461e-80bd-ffd91797e1fa',  -- 計器飛行方式の最低高度（重要度8.0）
    '400215e6-7d54-46fe-a581-5d848b087465'  -- 計器飛行方式の最低高度（重要度7.2）
  ]::uuid[],
  'direct',
  1.0,
  3,
  40,
  'manual',
  0.95,
  'verified',
  now(),
  now()
)
ON CONFLICT (learning_content_id) DO UPDATE SET
  unified_cpl_question_ids = EXCLUDED.unified_cpl_question_ids,
  updated_at = now();

-- 3.5.1_AirTrafficServices - 航空交通業務の基礎
INSERT INTO learning_test_mapping (
  learning_content_id,
  content_title,
  content_category,
  topic_category,
  subject_area,
  unified_cpl_question_ids,
  relationship_type,
  weight_score,
  difficulty_level,
  estimated_study_time,
  mapping_source,
  confidence_score,
  verification_status,
  created_at,
  updated_at
) VALUES (
  '3.5.1_AirTrafficServices',
  '【航空通信 Mission C-1】航空交通業務の基礎 - 管制圏と情報圏',
  'CPL学科',
  '航空交通業務',
  '航空通信',
  ARRAY[
    'a8936a54-1536-44ec-b846-4d75e9e4946b'  -- 管制圏の飛行（重要度8.0）
  ]::uuid[],
  'direct',
  1.0,
  3,
  40,
  'manual',
  0.95,
  'verified',
  now(),
  now()
)
ON CONFLICT (learning_content_id) DO UPDATE SET
  unified_cpl_question_ids = EXCLUDED.unified_cpl_question_ids,
  updated_at = now();

-- 3.5.2_AeronauticalInformation - 航空情報業務
INSERT INTO learning_test_mapping (
  learning_content_id,
  content_title,
  content_category,
  topic_category,
  subject_area,
  unified_cpl_question_ids,
  relationship_type,
  weight_score,
  difficulty_level,
  estimated_study_time,
  mapping_source,
  confidence_score,
  verification_status,
  created_at,
  updated_at
) VALUES (
  '3.5.2_AeronauticalInformation',
  '【航空通信 Mission C-2】航空情報業務 - AISとNOTAM',
  'CPL学科',
  '航空情報業務',
  '航空通信',
  ARRAY[
    '11ab1c75-91e2-48dc-9261-32136c5b851c',  -- 航空情報業務（重要度8.0）
    'a2fa6667-d8d3-4d0d-b439-907f9a4ca671'  -- 航空情報業務（重要度5.8）
  ]::uuid[],
  'direct',
  1.0,
  3,
  40,
  'manual',
  0.95,
  'verified',
  now(),
  now()
)
ON CONFLICT (learning_content_id) DO UPDATE SET
  unified_cpl_question_ids = EXCLUDED.unified_cpl_question_ids,
  updated_at = now();

-- 3.5.3_RadioCommunication - 無線通信の基本手順
INSERT INTO learning_test_mapping (
  learning_content_id,
  content_title,
  content_category,
  topic_category,
  subject_area,
  unified_cpl_question_ids,
  relationship_type,
  weight_score,
  difficulty_level,
  estimated_study_time,
  mapping_source,
  confidence_score,
  verification_status,
  created_at,
  updated_at
) VALUES (
  '3.5.3_RadioCommunication',
  '【航空通信 Mission C-3】無線通信の基本手順 - 標準的な管制用語',
  'CPL学科',
  '無線通信',
  '航空通信',
  ARRAY[
    'bb130fd8-592b-4dd4-b600-e204ca1d7f4f',  -- NEGATIVE（重要度5.0）
    '3d5c3ad9-d572-454c-a9b5-a006f2e2d7fb',  -- CORRECTION（重要度5.0）
    '5b478230-79cf-452b-873f-738a036acab6',  -- VERIFY（重要度5.0）
    'ecbcb884-bae7-449e-a47d-2cbfee52f2a1'   -- HOLD SHORT（重要度5.0）
    -- その他多数の管制用語関連問題は後で追加
  ]::uuid[],
  'direct',
  1.0,
  3,
  50,
  'manual',
  0.85,
  'pending',
  now(),
  now()
)
ON CONFLICT (learning_content_id) DO UPDATE SET
  unified_cpl_question_ids = EXCLUDED.unified_cpl_question_ids,
  updated_at = now();

-- 3.4.1_DeadReckoning - 推測航法の基礎
INSERT INTO learning_test_mapping (
  learning_content_id,
  content_title,
  content_category,
  topic_category,
  subject_area,
  unified_cpl_question_ids,
  relationship_type,
  weight_score,
  difficulty_level,
  estimated_study_time,
  mapping_source,
  confidence_score,
  verification_status,
  created_at,
  updated_at
) VALUES (
  '3.4.1_DeadReckoning',
  '【空中航法 Mission N-1】推測航法の基礎 - 風力三角形の理解',
  'CPL学科',
  '推測航法',
  '空中航法',
  ARRAY[]::uuid[],  -- 風力三角形関連問題は後で追加
  'direct',
  1.0,
  3,
  45,
  'manual',
  0.80,
  'pending',
  now(),
  now()
)
ON CONFLICT (learning_content_id) DO UPDATE SET
  unified_cpl_question_ids = EXCLUDED.unified_cpl_question_ids,
  updated_at = now();

-- 3.4.2_VORNavigation - VOR航法の原理と使用
INSERT INTO learning_test_mapping (
  learning_content_id,
  content_title,
  content_category,
  topic_category,
  subject_area,
  unified_cpl_question_ids,
  relationship_type,
  weight_score,
  difficulty_level,
  estimated_study_time,
  mapping_source,
  confidence_score,
  verification_status,
  created_at,
  updated_at
) VALUES (
  '3.4.2_VORNavigation',
  '【空中航法 Mission N-2】VOR航法の原理と使用 - TO/FROM表示の読み方',
  'CPL学科',
  'VOR航法',
  '空中航法',
  ARRAY[
    '70fbcdbb-58a6-4319-a64d-a53373a367c5',  -- VORの目的（重要度5.0）
    'ce9333ed-2a18-4907-a4be-473a374dd7ca',  -- FROM表示（重要度5.0）
    '28b4640e-8caf-4384-a76e-a5c7566446e1',  -- VOR計器（重要度5.0）
    '6febd81d-a2d8-4dcc-b246-391cf672ea4a',  -- VORの基本原理（重要度5.0）
    'a8edd4e2-2b85-47b5-94c3-7c420e748b37',  -- TO/FROM指示（重要度5.0）
    'ba27ca44-5a99-46cf-8cc3-65a3cd80ae4a'   -- CDIの読み方（重要度5.0）
  ]::uuid[],
  'direct',
  1.0,
  3,
  50,
  'manual',
  0.90,
  'verified',
  now(),
  now()
)
ON CONFLICT (learning_content_id) DO UPDATE SET
  unified_cpl_question_ids = EXCLUDED.unified_cpl_question_ids,
  updated_at = now();

-- 3.4.3_GPSNavigation - GPS航法の基礎
INSERT INTO learning_test_mapping (
  learning_content_id,
  content_title,
  content_category,
  topic_category,
  subject_area,
  unified_cpl_question_ids,
  relationship_type,
  weight_score,
  difficulty_level,
  estimated_study_time,
  mapping_source,
  confidence_score,
  verification_status,
  created_at,
  updated_at
) VALUES (
  '3.4.3_GPSNavigation',
  '【空中航法 Mission N-3】GPS航法の基礎 - 衛星測位の原理',
  'CPL学科',
  'GPS航法',
  '空中航法',
  ARRAY[
    '10735bc3-f793-49f0-8a75-fb667725b2e1',  -- GPSの利点（重要度5.0）
    '58ebd1ee-8d0e-4fa4-8ceb-ffa49b4dc9d5',  -- GPSの利点（重要度5.0）
    'bab04eff-b94d-4d23-8225-512addb89737',  -- GPSの利点（重要度5.0）
    'd8ec7c77-a76b-430d-b0df-46ed49fc0509',  -- GPS測位原理（重要度5.0）
    '3b05e56f-3474-4a7e-bf10-716974b17017'   -- GPS衛星数（重要度5.0）
  ]::uuid[],
  'direct',
  1.0,
  3,
  45,
  'manual',
  0.90,
  'verified',
  now(),
  now()
)
ON CONFLICT (learning_content_id) DO UPDATE SET
  unified_cpl_question_ids = EXCLUDED.unified_cpl_question_ids,
  updated_at = now();

-- 3.4.4_FlightPlanning - 飛行計画と航法計算
INSERT INTO learning_test_mapping (
  learning_content_id,
  content_title,
  content_category,
  topic_category,
  subject_area,
  unified_cpl_question_ids,
  relationship_type,
  weight_score,
  difficulty_level,
  estimated_study_time,
  mapping_source,
  confidence_score,
  verification_status,
  created_at,
  updated_at
) VALUES (
  '3.4.4_FlightPlanning',
  '【空中航法 Mission N-4】飛行計画と航法計算 - 対地速度と飛行時間',
  'CPL学科',
  '飛行計画',
  '空中航法',
  ARRAY[]::uuid[],  -- 航法計算関連問題は後で追加
  'direct',
  1.0,
  3,
  50,
  'manual',
  0.80,
  'pending',
  now(),
  now()
)
ON CONFLICT (learning_content_id) DO UPDATE SET
  unified_cpl_question_ids = EXCLUDED.unified_cpl_question_ids,
  updated_at = now();

-- ============================================================
-- 3. 確認クエリ
-- ============================================================

-- 登録された記事の確認
SELECT
  id,
  title,
  category,
  sub_category,
  order_index,
  is_published,
  created_at
FROM learning_contents
WHERE id LIKE '3.%'
ORDER BY order_index;

-- マッピングの確認
SELECT
  learning_content_id,
  content_title,
  topic_category,
  array_length(unified_cpl_question_ids, 1) as question_count,
  verification_status,
  confidence_score
FROM learning_test_mapping
WHERE learning_content_id LIKE '3.%'
ORDER BY learning_content_id;

