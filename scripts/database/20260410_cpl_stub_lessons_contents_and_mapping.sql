-- CPL スタブ記事: learning_contents 補完 + learning_test_mapping（2026-04-10）
-- docs/06 Phase1+2 の MDX id と整合。3.1.1 はマッピング既存想定のため本ファイルでは mapping を追加しない。
-- 冪等: learning_contents ON CONFLICT (id) DO NOTHING / mapping は NOT EXISTS。
-- 検証: 投入後、各 learning_content_id で cardinality(unified_cpl_question_ids) を確認。

BEGIN;

INSERT INTO learning_contents (
  id, title, category, description, order_index, content_type,
  is_published, sub_category, created_at, updated_at
) VALUES
  (
    '3.1.1_AviationLegal0',
    '【航空法規】戦闘機乗りへの第一歩（CPL学科・スタブ同期）',
    'CPL学科',
    'Supabase の learning_contents / learning_test_mapping と id を一致させるプレースホルダ。本文は後から拡充。（スタブ）',
    325,
    'text',
    true,
    '航空法規',
    now(),
    now()
  ),
  (
    '3.1.5_AirspaceClassification',
    '【航空法規】空域分類とクラスC空域（CPL学科・スタブ）',
    'CPL学科',
    '空域区分・進入条件など「空域」系 sub_subject に対応するスタブ。マッピングで verified UUID を束ねる。（スタブ）',
    326,
    'text',
    true,
    '航空法規',
    now(),
    now()
  ),
  (
    '3.1.6_IFRMinimumAltitude',
    '【航空法規】計器飛行方式の最低高度（CPL学科・スタブ）',
    'CPL学科',
    '計器飛行方式・最低安全高度まわりの法規クラスタ向けスタブ。（スタブ）',
    327,
    'text',
    true,
    '航空法規',
    now(),
    now()
  ),
  (
    '3.1.7_FlightRules',
    '【航空法規】運航規則の詳細（CPL学科・スタブ）',
    'CPL学科',
    '運航・飛行方法に関する法規頻出論点のスタブ。（スタブ）',
    328,
    'text',
    true,
    '航空法規',
    now(),
    now()
  ),
  (
    '3.1.8_AirportOperations',
    '【航空法規】空港運用規則（CPL学科・スタブ）',
    'CPL学科',
    '空港・飛行場運用に関する法規クラスタ向けスタブ。（スタブ）',
    329,
    'text',
    true,
    '航空法規',
    now(),
    now()
  ),
  (
    '3.2.7_LiftAndDrag',
    '【航空工学】揚力と抗力の詳細（CPL学科・スタブ）',
    'CPL学科',
    '航空力学クラスタ（揚力・抗力の深掘り）向け。既存 3.2.2 と役割分担しつつマッピングを分割予定。（スタブ）',
    350,
    'text',
    true,
    '航空工学',
    now(),
    now()
  ),
  (
    '3.2.8_PowerAndPerformance',
    '【航空工学】必要馬力と利用馬力（CPL学科・スタブ）',
    'CPL学科',
    '性能と耐空性／飛行性能クラスタ向けスタブ。（スタブ）',
    351,
    'text',
    true,
    '航空工学',
    now(),
    now()
  ),
  (
    '3.2.9_PitotStaticSystem',
    '【航空工学】ピトー静圧系統の詳細（CPL学科・スタブ）',
    'CPL学科',
    '3.2.6 と同系統の深掘り記事用スタブ。マッピングは同一 LIKE 条件でプールを共有。（スタブ）',
    352,
    'text',
    true,
    '航空工学',
    now(),
    now()
  ),
  (
    '3.2.10_WeightAndBalance',
    '【航空工学】重量と重心（CPL学科・スタブ）',
    'CPL学科',
    '重量・重心・載荷に関する工学クラスタ向けスタブ。（スタブ）',
    353,
    'text',
    true,
    '航空工学',
    now(),
    now()
  ),
  (
    '3.2.11_StallAndSpin',
    '【航空工学】失速とスピン（CPL学科・スタブ）',
    'CPL学科',
    '失速・スピン・高揚力装置周辺の空力クラスタ向けスタブ。（スタブ）',
    354,
    'text',
    true,
    '航空工学',
    now(),
    now()
  ),
  (
    '3.2.12_EngineSystems',
    '【航空工学】エンジン系統の詳細（CPL学科・スタブ）',
    'CPL学科',
    '点火・潤滑・冷却・燃料などエンジン周辺系統のスタブ（3.2.5 との分担は後続で整理）。（スタブ）',
    355,
    'text',
    true,
    '航空工学',
    now(),
    now()
  ),
  (
    '3.3.1_StandardAtmosphere',
    '【航空気象】標準大気と大気構造（CPL学科・スタブ）',
    'CPL学科',
    '大気の物理・標準大気まわりの気象クラスタ向けスタブ。（スタブ）',
    360,
    'text',
    true,
    '航空気象',
    now(),
    now()
  ),
  (
    '3.3.2_CloudsAndPrecipitation',
    '【航空気象】雲と降水のメカニズム（CPL学科・スタブ）',
    'CPL学科',
    '雲・降水・水循環まわりの気象クラスタ向けスタブ。（スタブ）',
    361,
    'text',
    true,
    '航空気象',
    now(),
    now()
  ),
  (
    '3.3.3_FrontsAndWeatherSystems',
    '【航空気象】前線と気象システム（CPL学科・スタブ）',
    'CPL学科',
    '前線・低気圧トラフ・天気図解析クラスタ向けスタブ。（スタブ）',
    362,
    'text',
    true,
    '航空気象',
    now(),
    now()
  ),
  (
    '3.3.4_LowPressureSystems',
    '【航空気象】低気圧システムと発達過程（CPL学科・スタブ）',
    'CPL学科',
    '低気圧・斜面波などシナoptic スケールのスタブ。（スタブ）',
    363,
    'text',
    true,
    '航空気象',
    now(),
    now()
  ),
  (
    '3.3.5_AtmosphericStability',
    '【航空気象】大気の安定性とショワルター指数（CPL学科・スタブ）',
    'CPL学科',
    '大気安定度・対流・ショワルター指数クラスタ向けスタブ。（スタブ）',
    364,
    'text',
    true,
    '航空気象',
    now(),
    now()
  ),
  (
    '3.3.6_AtmosphericComposition',
    '【航空気象】大気組成と水蒸気の物理（CPL学科・スタブ）',
    'CPL学科',
    '大気の基礎／温度・水蒸気・露点クラスタ向けスタブ。（スタブ）',
    365,
    'text',
    true,
    '航空気象',
    now(),
    now()
  ),
  (
    '3.3.7_WesterliesAndWind',
    '【航空気象】偏西風と大気循環（CPL学科・スタブ）',
    'CPL学科',
    '偏西風・ジェット・大規模循環クラスタ向けスタブ。（スタブ）',
    366,
    'text',
    true,
    '航空気象',
    now(),
    now()
  ),
  (
    '3.3.8_ICAOStandardAtmosphere',
    '【航空気象】ICAO標準大気の詳細（CPL学科・スタブ）',
    'CPL学科',
    'ICAO 標準大気・国際標準の表記クラスタ向けスタブ。（スタブ）',
    367,
    'text',
    true,
    '航空気象',
    now(),
    now()
  ),
  (
    '3.3.9_WeatherHazards',
    '【航空気象】航空気象の危険現象（CPL学科・スタブ）',
    'CPL学科',
    '乱流・雷・視程不良など危険現象クラスタ向けスタブ。（スタブ）',
    368,
    'text',
    true,
    '航空気象',
    now(),
    now()
  ),
  (
    '3.3.10_CloudTypes',
    '【航空気象】雲の種類と特徴（CPL学科・スタブ）',
    'CPL学科',
    '雲の分類・雲形の識別クラスタ向けスタブ（3.3.2 と重複しうる）。（スタブ）',
    369,
    'text',
    true,
    '航空気象',
    now(),
    now()
  ),
  (
    '3.3.11_VisibilityAndFog',
    '【航空気象】視程と霧（CPL学科・スタブ）',
    'CPL学科',
    '視程・霧・ミスト等のクラスタ向けスタブ。（スタブ）',
    370,
    'text',
    true,
    '航空気象',
    now(),
    now()
  ),
  (
    '3.3.12_Turbulence',
    '【航空気象】乱気流の種類と対策（CPL学科・スタブ）',
    'CPL学科',
    '乱流（Turbulence）に特化したクラスタ向けスタブ。（スタブ）',
    371,
    'text',
    true,
    '航空気象',
    now(),
    now()
  ),
  (
    '3.4.1_DeadReckoning',
    '【空中航法】推測航法の基礎（CPL学科・スタブ）',
    'CPL学科',
    '推測航法・針路と距離の基礎クラスタ向けスタブ。（スタブ）',
    380,
    'text',
    true,
    '空中航法',
    now(),
    now()
  ),
  (
    '3.4.2_VORNavigation',
    '【空中航法】VOR航法の原理と使用（CPL学科・スタブ）',
    'CPL学科',
    'VOR・方位航法クラスタ向けスタブ。（スタブ）',
    381,
    'text',
    true,
    '空中航法',
    now(),
    now()
  ),
  (
    '3.4.3_GPSNavigation',
    '【空中航法】GPS航法の基礎（CPL学科・スタブ）',
    'CPL学科',
    'GNSS/GPS 航法クラスタ向けスタブ。（スタブ）',
    382,
    'text',
    true,
    '空中航法',
    now(),
    now()
  ),
  (
    '3.4.4_FlightPlanning',
    '【空中航法】飛行計画と航法計算（CPL学科・スタブ）',
    'CPL学科',
    '航法計画書・所要時間・燃料計算クラスタ向けスタブ。（スタブ）',
    383,
    'text',
    true,
    '空中航法',
    now(),
    now()
  ),
  (
    '3.4.5_NDBNavigation',
    '【空中航法】NDB航法（CPL学科・スタブ）',
    'CPL学科',
    'NDB/ADF 航法クラスタ向けスタブ。（スタブ）',
    384,
    'text',
    true,
    '空中航法',
    now(),
    now()
  ),
  (
    '3.4.6_DMENavigation',
    '【空中航法】DME航法（CPL学科・スタブ）',
    'CPL学科',
    'DME・スラントレンジクラスタ向けスタブ。（スタブ）',
    385,
    'text',
    true,
    '空中航法',
    now(),
    now()
  ),
  (
    '3.4.7_DeadReckoningAdvanced',
    '【空中航法】推測航法の応用（CPL学科・スタブ）',
    'CPL学科',
    '風修正・所要時間・偏流推算クラスタ向けスタブ。（スタブ）',
    386,
    'text',
    true,
    '空中航法',
    now(),
    now()
  ),
  (
    '3.5.1_AirTrafficServices',
    '【航空通信】航空交通業務の基礎（CPL学科・スタブ）',
    'CPL学科',
    '航空交通業務クラスタ向けスタブ。（スタブ）',
    390,
    'text',
    true,
    '航空通信',
    now(),
    now()
  ),
  (
    '3.5.2_AeronauticalInformation',
    '【航空通信】航空情報業務（CPL学科・スタブ）',
    'CPL学科',
    '航空情報（AIP/NOTAM 等）業務クラスタ向けスタブ。（スタブ）',
    391,
    'text',
    true,
    '航空通信',
    now(),
    now()
  ),
  (
    '3.5.3_RadioCommunication',
    '【航空通信】無線通信の基本手順（CPL学科・スタブ）',
    'CPL学科',
    '無線・電話通信手順クラスタ向けスタブ。（スタブ）',
    392,
    'text',
    true,
    '航空通信',
    now(),
    now()
  ),
  (
    '3.5.4_EmergencyProcedures',
    '【航空通信】緊急時の通信手順（CPL学科・スタブ）',
    'CPL学科',
    '緊急・遭難・救難通信クラスタ向けスタブ。（スタブ）',
    393,
    'text',
    true,
    '航空通信',
    now(),
    now()
  ),
  (
    '3.5.5_ATCPhraseology',
    '【航空通信】管制用語の詳細（CPL学科・スタブ）',
    'CPL学科',
    '管制用語・フレーズロジー関連クラスタ向けスタブ。（スタブ）',
    394,
    'text',
    true,
    '航空通信',
    now(),
    now()
  )
ON CONFLICT (id) DO NOTHING;

INSERT INTO learning_test_mapping (
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
     AND (q.main_subject = '航空法規' AND (q.sub_subject ILIKE '%空域%' OR q.sub_subject ILIKE '%クラス%'))),
  (SELECT COALESCE(array_agg(q.id ORDER BY q.id), ARRAY[]::uuid[])
   FROM unified_cpl_questions q
   WHERE q.verification_status = 'verified'
     AND (q.main_subject = '航空法規' AND (q.sub_subject ILIKE '%空域%' OR q.sub_subject ILIKE '%クラス%'))),
  '航空法規',
  '航空法規',
  'cpl_stub_20260410',
  'verified'
FROM learning_contents lc
WHERE lc.id = '3.1.5_AirspaceClassification'
  AND NOT EXISTS (SELECT 1 FROM learning_test_mapping m WHERE m.learning_content_id = lc.id)
  AND EXISTS (
    SELECT 1 FROM unified_cpl_questions q
    WHERE q.verification_status = 'verified'
      AND (q.main_subject = '航空法規' AND (q.sub_subject ILIKE '%空域%' OR q.sub_subject ILIKE '%クラス%'))
    LIMIT 1
  );

INSERT INTO learning_test_mapping (
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
     AND (q.main_subject = '航空法規' AND (q.sub_subject ILIKE '%最低安全%' OR q.sub_subject ILIKE '%計器飛行方式%' OR q.sub_subject ILIKE '%最低高度%'))),
  (SELECT COALESCE(array_agg(q.id ORDER BY q.id), ARRAY[]::uuid[])
   FROM unified_cpl_questions q
   WHERE q.verification_status = 'verified'
     AND (q.main_subject = '航空法規' AND (q.sub_subject ILIKE '%最低安全%' OR q.sub_subject ILIKE '%計器飛行方式%' OR q.sub_subject ILIKE '%最低高度%'))),
  '航空法規',
  '航空法規',
  'cpl_stub_20260410',
  'verified'
FROM learning_contents lc
WHERE lc.id = '3.1.6_IFRMinimumAltitude'
  AND NOT EXISTS (SELECT 1 FROM learning_test_mapping m WHERE m.learning_content_id = lc.id)
  AND EXISTS (
    SELECT 1 FROM unified_cpl_questions q
    WHERE q.verification_status = 'verified'
      AND (q.main_subject = '航空法規' AND (q.sub_subject ILIKE '%最低安全%' OR q.sub_subject ILIKE '%計器飛行方式%' OR q.sub_subject ILIKE '%最低高度%'))
    LIMIT 1
  );

INSERT INTO learning_test_mapping (
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
     AND (q.main_subject = '航空法規' AND q.sub_subject ILIKE '%運航%')),
  (SELECT COALESCE(array_agg(q.id ORDER BY q.id), ARRAY[]::uuid[])
   FROM unified_cpl_questions q
   WHERE q.verification_status = 'verified'
     AND (q.main_subject = '航空法規' AND q.sub_subject ILIKE '%運航%')),
  '航空法規',
  '航空法規',
  'cpl_stub_20260410',
  'verified'
FROM learning_contents lc
WHERE lc.id = '3.1.7_FlightRules'
  AND NOT EXISTS (SELECT 1 FROM learning_test_mapping m WHERE m.learning_content_id = lc.id)
  AND EXISTS (
    SELECT 1 FROM unified_cpl_questions q
    WHERE q.verification_status = 'verified'
      AND (q.main_subject = '航空法規' AND q.sub_subject ILIKE '%運航%')
    LIMIT 1
  );

INSERT INTO learning_test_mapping (
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
     AND (q.main_subject = '航空法規' AND q.sub_subject ILIKE '%空港%')),
  (SELECT COALESCE(array_agg(q.id ORDER BY q.id), ARRAY[]::uuid[])
   FROM unified_cpl_questions q
   WHERE q.verification_status = 'verified'
     AND (q.main_subject = '航空法規' AND q.sub_subject ILIKE '%空港%')),
  '航空法規',
  '航空法規',
  'cpl_stub_20260410',
  'verified'
FROM learning_contents lc
WHERE lc.id = '3.1.8_AirportOperations'
  AND NOT EXISTS (SELECT 1 FROM learning_test_mapping m WHERE m.learning_content_id = lc.id)
  AND EXISTS (
    SELECT 1 FROM unified_cpl_questions q
    WHERE q.verification_status = 'verified'
      AND (q.main_subject = '航空法規' AND q.sub_subject ILIKE '%空港%')
    LIMIT 1
  );

INSERT INTO learning_test_mapping (
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
     AND (q.main_subject = '航空工学' AND q.sub_subject = '航空力学')),
  (SELECT COALESCE(array_agg(q.id ORDER BY q.id), ARRAY[]::uuid[])
   FROM unified_cpl_questions q
   WHERE q.verification_status = 'verified'
     AND (q.main_subject = '航空工学' AND q.sub_subject = '航空力学')),
  '航空工学',
  '航空工学',
  'cpl_stub_20260410',
  'verified'
FROM learning_contents lc
WHERE lc.id = '3.2.7_LiftAndDrag'
  AND NOT EXISTS (SELECT 1 FROM learning_test_mapping m WHERE m.learning_content_id = lc.id)
  AND EXISTS (
    SELECT 1 FROM unified_cpl_questions q
    WHERE q.verification_status = 'verified'
      AND (q.main_subject = '航空工学' AND q.sub_subject = '航空力学')
    LIMIT 1
  );

INSERT INTO learning_test_mapping (
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
     AND (q.main_subject = '航空工学' AND (q.sub_subject ILIKE '%飛行性能%' OR q.sub_subject ILIKE '%性能と耐空性%'))),
  (SELECT COALESCE(array_agg(q.id ORDER BY q.id), ARRAY[]::uuid[])
   FROM unified_cpl_questions q
   WHERE q.verification_status = 'verified'
     AND (q.main_subject = '航空工学' AND (q.sub_subject ILIKE '%飛行性能%' OR q.sub_subject ILIKE '%性能と耐空性%'))),
  '航空工学',
  '航空工学',
  'cpl_stub_20260410',
  'verified'
FROM learning_contents lc
WHERE lc.id = '3.2.8_PowerAndPerformance'
  AND NOT EXISTS (SELECT 1 FROM learning_test_mapping m WHERE m.learning_content_id = lc.id)
  AND EXISTS (
    SELECT 1 FROM unified_cpl_questions q
    WHERE q.verification_status = 'verified'
      AND (q.main_subject = '航空工学' AND (q.sub_subject ILIKE '%飛行性能%' OR q.sub_subject ILIKE '%性能と耐空性%'))
    LIMIT 1
  );

INSERT INTO learning_test_mapping (
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
     AND (q.main_subject = '航空工学' AND (q.sub_subject ILIKE '%エア・データー%' OR q.sub_subject ILIKE '%高度計%' OR q.sub_subject ILIKE '%ピトー%'))),
  (SELECT COALESCE(array_agg(q.id ORDER BY q.id), ARRAY[]::uuid[])
   FROM unified_cpl_questions q
   WHERE q.verification_status = 'verified'
     AND (q.main_subject = '航空工学' AND (q.sub_subject ILIKE '%エア・データー%' OR q.sub_subject ILIKE '%高度計%' OR q.sub_subject ILIKE '%ピトー%'))),
  '航空工学',
  '航空工学',
  'cpl_stub_20260410',
  'verified'
FROM learning_contents lc
WHERE lc.id = '3.2.9_PitotStaticSystem'
  AND NOT EXISTS (SELECT 1 FROM learning_test_mapping m WHERE m.learning_content_id = lc.id)
  AND EXISTS (
    SELECT 1 FROM unified_cpl_questions q
    WHERE q.verification_status = 'verified'
      AND (q.main_subject = '航空工学' AND (q.sub_subject ILIKE '%エア・データー%' OR q.sub_subject ILIKE '%高度計%' OR q.sub_subject ILIKE '%ピトー%'))
    LIMIT 1
  );

INSERT INTO learning_test_mapping (
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
     AND (q.main_subject = '航空工学' AND (q.sub_subject ILIKE '%重量%' OR q.sub_subject ILIKE '%重心%'))),
  (SELECT COALESCE(array_agg(q.id ORDER BY q.id), ARRAY[]::uuid[])
   FROM unified_cpl_questions q
   WHERE q.verification_status = 'verified'
     AND (q.main_subject = '航空工学' AND (q.sub_subject ILIKE '%重量%' OR q.sub_subject ILIKE '%重心%'))),
  '航空工学',
  '航空工学',
  'cpl_stub_20260410',
  'verified'
FROM learning_contents lc
WHERE lc.id = '3.2.10_WeightAndBalance'
  AND NOT EXISTS (SELECT 1 FROM learning_test_mapping m WHERE m.learning_content_id = lc.id)
  AND EXISTS (
    SELECT 1 FROM unified_cpl_questions q
    WHERE q.verification_status = 'verified'
      AND (q.main_subject = '航空工学' AND (q.sub_subject ILIKE '%重量%' OR q.sub_subject ILIKE '%重心%'))
    LIMIT 1
  );

INSERT INTO learning_test_mapping (
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
     AND (q.main_subject = '航空工学' AND (q.sub_subject ILIKE '%失速%' OR q.sub_subject ILIKE '%スピン%'))),
  (SELECT COALESCE(array_agg(q.id ORDER BY q.id), ARRAY[]::uuid[])
   FROM unified_cpl_questions q
   WHERE q.verification_status = 'verified'
     AND (q.main_subject = '航空工学' AND (q.sub_subject ILIKE '%失速%' OR q.sub_subject ILIKE '%スピン%'))),
  '航空工学',
  '航空工学',
  'cpl_stub_20260410',
  'verified'
FROM learning_contents lc
WHERE lc.id = '3.2.11_StallAndSpin'
  AND NOT EXISTS (SELECT 1 FROM learning_test_mapping m WHERE m.learning_content_id = lc.id)
  AND EXISTS (
    SELECT 1 FROM unified_cpl_questions q
    WHERE q.verification_status = 'verified'
      AND (q.main_subject = '航空工学' AND (q.sub_subject ILIKE '%失速%' OR q.sub_subject ILIKE '%スピン%'))
    LIMIT 1
  );

INSERT INTO learning_test_mapping (
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
     AND (q.main_subject = '航空工学' AND (q.sub_subject ILIKE '%点火%' OR q.sub_subject ILIKE '%冷却%' OR q.sub_subject ILIKE '%潤滑%' OR q.sub_subject ILIKE '%燃料系%'))),
  (SELECT COALESCE(array_agg(q.id ORDER BY q.id), ARRAY[]::uuid[])
   FROM unified_cpl_questions q
   WHERE q.verification_status = 'verified'
     AND (q.main_subject = '航空工学' AND (q.sub_subject ILIKE '%点火%' OR q.sub_subject ILIKE '%冷却%' OR q.sub_subject ILIKE '%潤滑%' OR q.sub_subject ILIKE '%燃料系%'))),
  '航空工学',
  '航空工学',
  'cpl_stub_20260410',
  'verified'
FROM learning_contents lc
WHERE lc.id = '3.2.12_EngineSystems'
  AND NOT EXISTS (SELECT 1 FROM learning_test_mapping m WHERE m.learning_content_id = lc.id)
  AND EXISTS (
    SELECT 1 FROM unified_cpl_questions q
    WHERE q.verification_status = 'verified'
      AND (q.main_subject = '航空工学' AND (q.sub_subject ILIKE '%点火%' OR q.sub_subject ILIKE '%冷却%' OR q.sub_subject ILIKE '%潤滑%' OR q.sub_subject ILIKE '%燃料系%'))
    LIMIT 1
  );

INSERT INTO learning_test_mapping (
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
     AND (q.main_subject = '航空気象' AND (q.sub_subject ILIKE '%大気の物理%' OR q.sub_subject ILIKE '%標準大気%'))),
  (SELECT COALESCE(array_agg(q.id ORDER BY q.id), ARRAY[]::uuid[])
   FROM unified_cpl_questions q
   WHERE q.verification_status = 'verified'
     AND (q.main_subject = '航空気象' AND (q.sub_subject ILIKE '%大気の物理%' OR q.sub_subject ILIKE '%標準大気%'))),
  '航空気象',
  '航空気象',
  'cpl_stub_20260410',
  'verified'
FROM learning_contents lc
WHERE lc.id = '3.3.1_StandardAtmosphere'
  AND NOT EXISTS (SELECT 1 FROM learning_test_mapping m WHERE m.learning_content_id = lc.id)
  AND EXISTS (
    SELECT 1 FROM unified_cpl_questions q
    WHERE q.verification_status = 'verified'
      AND (q.main_subject = '航空気象' AND (q.sub_subject ILIKE '%大気の物理%' OR q.sub_subject ILIKE '%標準大気%'))
    LIMIT 1
  );

INSERT INTO learning_test_mapping (
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
     AND (q.main_subject = '航空気象' AND (q.sub_subject ILIKE '%雲%' OR q.sub_subject ILIKE '%降水%'))),
  (SELECT COALESCE(array_agg(q.id ORDER BY q.id), ARRAY[]::uuid[])
   FROM unified_cpl_questions q
   WHERE q.verification_status = 'verified'
     AND (q.main_subject = '航空気象' AND (q.sub_subject ILIKE '%雲%' OR q.sub_subject ILIKE '%降水%'))),
  '航空気象',
  '航空気象',
  'cpl_stub_20260410',
  'verified'
FROM learning_contents lc
WHERE lc.id = '3.3.2_CloudsAndPrecipitation'
  AND NOT EXISTS (SELECT 1 FROM learning_test_mapping m WHERE m.learning_content_id = lc.id)
  AND EXISTS (
    SELECT 1 FROM unified_cpl_questions q
    WHERE q.verification_status = 'verified'
      AND (q.main_subject = '航空気象' AND (q.sub_subject ILIKE '%雲%' OR q.sub_subject ILIKE '%降水%'))
    LIMIT 1
  );

INSERT INTO learning_test_mapping (
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
     AND (q.main_subject = '航空気象' AND (q.sub_subject ILIKE '%前線%' OR q.sub_subject ILIKE '%天気図%'))),
  (SELECT COALESCE(array_agg(q.id ORDER BY q.id), ARRAY[]::uuid[])
   FROM unified_cpl_questions q
   WHERE q.verification_status = 'verified'
     AND (q.main_subject = '航空気象' AND (q.sub_subject ILIKE '%前線%' OR q.sub_subject ILIKE '%天気図%'))),
  '航空気象',
  '航空気象',
  'cpl_stub_20260410',
  'verified'
FROM learning_contents lc
WHERE lc.id = '3.3.3_FrontsAndWeatherSystems'
  AND NOT EXISTS (SELECT 1 FROM learning_test_mapping m WHERE m.learning_content_id = lc.id)
  AND EXISTS (
    SELECT 1 FROM unified_cpl_questions q
    WHERE q.verification_status = 'verified'
      AND (q.main_subject = '航空気象' AND (q.sub_subject ILIKE '%前線%' OR q.sub_subject ILIKE '%天気図%'))
    LIMIT 1
  );

INSERT INTO learning_test_mapping (
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
     AND (q.main_subject = '航空気象' AND q.sub_subject ILIKE '%低気圧%')),
  (SELECT COALESCE(array_agg(q.id ORDER BY q.id), ARRAY[]::uuid[])
   FROM unified_cpl_questions q
   WHERE q.verification_status = 'verified'
     AND (q.main_subject = '航空気象' AND q.sub_subject ILIKE '%低気圧%')),
  '航空気象',
  '航空気象',
  'cpl_stub_20260410',
  'verified'
FROM learning_contents lc
WHERE lc.id = '3.3.4_LowPressureSystems'
  AND NOT EXISTS (SELECT 1 FROM learning_test_mapping m WHERE m.learning_content_id = lc.id)
  AND EXISTS (
    SELECT 1 FROM unified_cpl_questions q
    WHERE q.verification_status = 'verified'
      AND (q.main_subject = '航空気象' AND q.sub_subject ILIKE '%低気圧%')
    LIMIT 1
  );

INSERT INTO learning_test_mapping (
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
     AND (q.main_subject = '航空気象' AND (q.sub_subject ILIKE '%安定%' OR q.sub_subject ILIKE '%ショワルター%'))),
  (SELECT COALESCE(array_agg(q.id ORDER BY q.id), ARRAY[]::uuid[])
   FROM unified_cpl_questions q
   WHERE q.verification_status = 'verified'
     AND (q.main_subject = '航空気象' AND (q.sub_subject ILIKE '%安定%' OR q.sub_subject ILIKE '%ショワルター%'))),
  '航空気象',
  '航空気象',
  'cpl_stub_20260410',
  'verified'
FROM learning_contents lc
WHERE lc.id = '3.3.5_AtmosphericStability'
  AND NOT EXISTS (SELECT 1 FROM learning_test_mapping m WHERE m.learning_content_id = lc.id)
  AND EXISTS (
    SELECT 1 FROM unified_cpl_questions q
    WHERE q.verification_status = 'verified'
      AND (q.main_subject = '航空気象' AND (q.sub_subject ILIKE '%安定%' OR q.sub_subject ILIKE '%ショワルター%'))
    LIMIT 1
  );

INSERT INTO learning_test_mapping (
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
     AND (q.main_subject = '航空気象' AND (q.sub_subject ILIKE '%大気の基礎%' OR q.sub_subject ILIKE '%水蒸気%' OR q.sub_subject ILIKE '%露点%'))),
  (SELECT COALESCE(array_agg(q.id ORDER BY q.id), ARRAY[]::uuid[])
   FROM unified_cpl_questions q
   WHERE q.verification_status = 'verified'
     AND (q.main_subject = '航空気象' AND (q.sub_subject ILIKE '%大気の基礎%' OR q.sub_subject ILIKE '%水蒸気%' OR q.sub_subject ILIKE '%露点%'))),
  '航空気象',
  '航空気象',
  'cpl_stub_20260410',
  'verified'
FROM learning_contents lc
WHERE lc.id = '3.3.6_AtmosphericComposition'
  AND NOT EXISTS (SELECT 1 FROM learning_test_mapping m WHERE m.learning_content_id = lc.id)
  AND EXISTS (
    SELECT 1 FROM unified_cpl_questions q
    WHERE q.verification_status = 'verified'
      AND (q.main_subject = '航空気象' AND (q.sub_subject ILIKE '%大気の基礎%' OR q.sub_subject ILIKE '%水蒸気%' OR q.sub_subject ILIKE '%露点%'))
    LIMIT 1
  );

INSERT INTO learning_test_mapping (
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
     AND (q.main_subject = '航空気象' AND (q.sub_subject ILIKE '%偏西風%' OR q.sub_subject ILIKE '%ジェット%'))),
  (SELECT COALESCE(array_agg(q.id ORDER BY q.id), ARRAY[]::uuid[])
   FROM unified_cpl_questions q
   WHERE q.verification_status = 'verified'
     AND (q.main_subject = '航空気象' AND (q.sub_subject ILIKE '%偏西風%' OR q.sub_subject ILIKE '%ジェット%'))),
  '航空気象',
  '航空気象',
  'cpl_stub_20260410',
  'verified'
FROM learning_contents lc
WHERE lc.id = '3.3.7_WesterliesAndWind'
  AND NOT EXISTS (SELECT 1 FROM learning_test_mapping m WHERE m.learning_content_id = lc.id)
  AND EXISTS (
    SELECT 1 FROM unified_cpl_questions q
    WHERE q.verification_status = 'verified'
      AND (q.main_subject = '航空気象' AND (q.sub_subject ILIKE '%偏西風%' OR q.sub_subject ILIKE '%ジェット%'))
    LIMIT 1
  );

INSERT INTO learning_test_mapping (
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
     AND (q.main_subject = '航空気象' AND (q.sub_subject ILIKE '%ICAO%' OR q.sub_subject ILIKE '%国際標準大気%'))),
  (SELECT COALESCE(array_agg(q.id ORDER BY q.id), ARRAY[]::uuid[])
   FROM unified_cpl_questions q
   WHERE q.verification_status = 'verified'
     AND (q.main_subject = '航空気象' AND (q.sub_subject ILIKE '%ICAO%' OR q.sub_subject ILIKE '%国際標準大気%'))),
  '航空気象',
  '航空気象',
  'cpl_stub_20260410',
  'verified'
FROM learning_contents lc
WHERE lc.id = '3.3.8_ICAOStandardAtmosphere'
  AND NOT EXISTS (SELECT 1 FROM learning_test_mapping m WHERE m.learning_content_id = lc.id)
  AND EXISTS (
    SELECT 1 FROM unified_cpl_questions q
    WHERE q.verification_status = 'verified'
      AND (q.main_subject = '航空気象' AND (q.sub_subject ILIKE '%ICAO%' OR q.sub_subject ILIKE '%国際標準大気%'))
    LIMIT 1
  );

INSERT INTO learning_test_mapping (
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
     AND (q.main_subject = '航空気象' AND (q.sub_subject ILIKE '%乱流%' OR q.sub_subject ILIKE '%雷%' OR q.sub_subject ILIKE '%視程不良%' OR q.sub_subject ILIKE '%積乱%'))),
  (SELECT COALESCE(array_agg(q.id ORDER BY q.id), ARRAY[]::uuid[])
   FROM unified_cpl_questions q
   WHERE q.verification_status = 'verified'
     AND (q.main_subject = '航空気象' AND (q.sub_subject ILIKE '%乱流%' OR q.sub_subject ILIKE '%雷%' OR q.sub_subject ILIKE '%視程不良%' OR q.sub_subject ILIKE '%積乱%'))),
  '航空気象',
  '航空気象',
  'cpl_stub_20260410',
  'verified'
FROM learning_contents lc
WHERE lc.id = '3.3.9_WeatherHazards'
  AND NOT EXISTS (SELECT 1 FROM learning_test_mapping m WHERE m.learning_content_id = lc.id)
  AND EXISTS (
    SELECT 1 FROM unified_cpl_questions q
    WHERE q.verification_status = 'verified'
      AND (q.main_subject = '航空気象' AND (q.sub_subject ILIKE '%乱流%' OR q.sub_subject ILIKE '%雷%' OR q.sub_subject ILIKE '%視程不良%' OR q.sub_subject ILIKE '%積乱%'))
    LIMIT 1
  );

INSERT INTO learning_test_mapping (
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
     AND (q.main_subject = '航空気象' AND q.sub_subject ILIKE '%雲%')),
  (SELECT COALESCE(array_agg(q.id ORDER BY q.id), ARRAY[]::uuid[])
   FROM unified_cpl_questions q
   WHERE q.verification_status = 'verified'
     AND (q.main_subject = '航空気象' AND q.sub_subject ILIKE '%雲%')),
  '航空気象',
  '航空気象',
  'cpl_stub_20260410',
  'verified'
FROM learning_contents lc
WHERE lc.id = '3.3.10_CloudTypes'
  AND NOT EXISTS (SELECT 1 FROM learning_test_mapping m WHERE m.learning_content_id = lc.id)
  AND EXISTS (
    SELECT 1 FROM unified_cpl_questions q
    WHERE q.verification_status = 'verified'
      AND (q.main_subject = '航空気象' AND q.sub_subject ILIKE '%雲%')
    LIMIT 1
  );

INSERT INTO learning_test_mapping (
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
     AND (q.main_subject = '航空気象' AND (q.sub_subject ILIKE '%視程%' OR q.sub_subject ILIKE '%霧%'))),
  (SELECT COALESCE(array_agg(q.id ORDER BY q.id), ARRAY[]::uuid[])
   FROM unified_cpl_questions q
   WHERE q.verification_status = 'verified'
     AND (q.main_subject = '航空気象' AND (q.sub_subject ILIKE '%視程%' OR q.sub_subject ILIKE '%霧%'))),
  '航空気象',
  '航空気象',
  'cpl_stub_20260410',
  'verified'
FROM learning_contents lc
WHERE lc.id = '3.3.11_VisibilityAndFog'
  AND NOT EXISTS (SELECT 1 FROM learning_test_mapping m WHERE m.learning_content_id = lc.id)
  AND EXISTS (
    SELECT 1 FROM unified_cpl_questions q
    WHERE q.verification_status = 'verified'
      AND (q.main_subject = '航空気象' AND (q.sub_subject ILIKE '%視程%' OR q.sub_subject ILIKE '%霧%'))
    LIMIT 1
  );

INSERT INTO learning_test_mapping (
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
     AND (q.main_subject = '航空気象' AND q.sub_subject ILIKE '%乱流%')),
  (SELECT COALESCE(array_agg(q.id ORDER BY q.id), ARRAY[]::uuid[])
   FROM unified_cpl_questions q
   WHERE q.verification_status = 'verified'
     AND (q.main_subject = '航空気象' AND q.sub_subject ILIKE '%乱流%')),
  '航空気象',
  '航空気象',
  'cpl_stub_20260410',
  'verified'
FROM learning_contents lc
WHERE lc.id = '3.3.12_Turbulence'
  AND NOT EXISTS (SELECT 1 FROM learning_test_mapping m WHERE m.learning_content_id = lc.id)
  AND EXISTS (
    SELECT 1 FROM unified_cpl_questions q
    WHERE q.verification_status = 'verified'
      AND (q.main_subject = '航空気象' AND q.sub_subject ILIKE '%乱流%')
    LIMIT 1
  );

INSERT INTO learning_test_mapping (
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
     AND (q.main_subject = '空中航法' AND q.sub_subject ILIKE '%推測%')),
  (SELECT COALESCE(array_agg(q.id ORDER BY q.id), ARRAY[]::uuid[])
   FROM unified_cpl_questions q
   WHERE q.verification_status = 'verified'
     AND (q.main_subject = '空中航法' AND q.sub_subject ILIKE '%推測%')),
  '空中航法',
  '空中航法',
  'cpl_stub_20260410',
  'verified'
FROM learning_contents lc
WHERE lc.id = '3.4.1_DeadReckoning'
  AND NOT EXISTS (SELECT 1 FROM learning_test_mapping m WHERE m.learning_content_id = lc.id)
  AND EXISTS (
    SELECT 1 FROM unified_cpl_questions q
    WHERE q.verification_status = 'verified'
      AND (q.main_subject = '空中航法' AND q.sub_subject ILIKE '%推測%')
    LIMIT 1
  );

INSERT INTO learning_test_mapping (
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
     AND (q.main_subject = '空中航法' AND q.sub_subject ILIKE '%VOR%')),
  (SELECT COALESCE(array_agg(q.id ORDER BY q.id), ARRAY[]::uuid[])
   FROM unified_cpl_questions q
   WHERE q.verification_status = 'verified'
     AND (q.main_subject = '空中航法' AND q.sub_subject ILIKE '%VOR%')),
  '空中航法',
  '空中航法',
  'cpl_stub_20260410',
  'verified'
FROM learning_contents lc
WHERE lc.id = '3.4.2_VORNavigation'
  AND NOT EXISTS (SELECT 1 FROM learning_test_mapping m WHERE m.learning_content_id = lc.id)
  AND EXISTS (
    SELECT 1 FROM unified_cpl_questions q
    WHERE q.verification_status = 'verified'
      AND (q.main_subject = '空中航法' AND q.sub_subject ILIKE '%VOR%')
    LIMIT 1
  );

INSERT INTO learning_test_mapping (
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
     AND (q.main_subject = '空中航法' AND (q.sub_subject ILIKE '%GPS%' OR q.sub_subject ILIKE '%GNSS%'))),
  (SELECT COALESCE(array_agg(q.id ORDER BY q.id), ARRAY[]::uuid[])
   FROM unified_cpl_questions q
   WHERE q.verification_status = 'verified'
     AND (q.main_subject = '空中航法' AND (q.sub_subject ILIKE '%GPS%' OR q.sub_subject ILIKE '%GNSS%'))),
  '空中航法',
  '空中航法',
  'cpl_stub_20260410',
  'verified'
FROM learning_contents lc
WHERE lc.id = '3.4.3_GPSNavigation'
  AND NOT EXISTS (SELECT 1 FROM learning_test_mapping m WHERE m.learning_content_id = lc.id)
  AND EXISTS (
    SELECT 1 FROM unified_cpl_questions q
    WHERE q.verification_status = 'verified'
      AND (q.main_subject = '空中航法' AND (q.sub_subject ILIKE '%GPS%' OR q.sub_subject ILIKE '%GNSS%'))
    LIMIT 1
  );

INSERT INTO learning_test_mapping (
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
     AND (q.main_subject = '空中航法' AND q.sub_subject ILIKE '%航法計画%')),
  (SELECT COALESCE(array_agg(q.id ORDER BY q.id), ARRAY[]::uuid[])
   FROM unified_cpl_questions q
   WHERE q.verification_status = 'verified'
     AND (q.main_subject = '空中航法' AND q.sub_subject ILIKE '%航法計画%')),
  '空中航法',
  '空中航法',
  'cpl_stub_20260410',
  'verified'
FROM learning_contents lc
WHERE lc.id = '3.4.4_FlightPlanning'
  AND NOT EXISTS (SELECT 1 FROM learning_test_mapping m WHERE m.learning_content_id = lc.id)
  AND EXISTS (
    SELECT 1 FROM unified_cpl_questions q
    WHERE q.verification_status = 'verified'
      AND (q.main_subject = '空中航法' AND q.sub_subject ILIKE '%航法計画%')
    LIMIT 1
  );

INSERT INTO learning_test_mapping (
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
     AND (q.main_subject = '空中航法' AND q.sub_subject ILIKE '%NDB%')),
  (SELECT COALESCE(array_agg(q.id ORDER BY q.id), ARRAY[]::uuid[])
   FROM unified_cpl_questions q
   WHERE q.verification_status = 'verified'
     AND (q.main_subject = '空中航法' AND q.sub_subject ILIKE '%NDB%')),
  '空中航法',
  '空中航法',
  'cpl_stub_20260410',
  'verified'
FROM learning_contents lc
WHERE lc.id = '3.4.5_NDBNavigation'
  AND NOT EXISTS (SELECT 1 FROM learning_test_mapping m WHERE m.learning_content_id = lc.id)
  AND EXISTS (
    SELECT 1 FROM unified_cpl_questions q
    WHERE q.verification_status = 'verified'
      AND (q.main_subject = '空中航法' AND q.sub_subject ILIKE '%NDB%')
    LIMIT 1
  );

INSERT INTO learning_test_mapping (
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
     AND (q.main_subject = '空中航法' AND q.sub_subject ILIKE '%DME%')),
  (SELECT COALESCE(array_agg(q.id ORDER BY q.id), ARRAY[]::uuid[])
   FROM unified_cpl_questions q
   WHERE q.verification_status = 'verified'
     AND (q.main_subject = '空中航法' AND q.sub_subject ILIKE '%DME%')),
  '空中航法',
  '空中航法',
  'cpl_stub_20260410',
  'verified'
FROM learning_contents lc
WHERE lc.id = '3.4.6_DMENavigation'
  AND NOT EXISTS (SELECT 1 FROM learning_test_mapping m WHERE m.learning_content_id = lc.id)
  AND EXISTS (
    SELECT 1 FROM unified_cpl_questions q
    WHERE q.verification_status = 'verified'
      AND (q.main_subject = '空中航法' AND q.sub_subject ILIKE '%DME%')
    LIMIT 1
  );

INSERT INTO learning_test_mapping (
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
     AND (q.main_subject = '空中航法' AND (q.sub_subject ILIKE '%所要時間%' OR q.sub_subject ILIKE '%風修正%' OR q.sub_subject ILIKE '%偏流%'))),
  (SELECT COALESCE(array_agg(q.id ORDER BY q.id), ARRAY[]::uuid[])
   FROM unified_cpl_questions q
   WHERE q.verification_status = 'verified'
     AND (q.main_subject = '空中航法' AND (q.sub_subject ILIKE '%所要時間%' OR q.sub_subject ILIKE '%風修正%' OR q.sub_subject ILIKE '%偏流%'))),
  '空中航法',
  '空中航法',
  'cpl_stub_20260410',
  'verified'
FROM learning_contents lc
WHERE lc.id = '3.4.7_DeadReckoningAdvanced'
  AND NOT EXISTS (SELECT 1 FROM learning_test_mapping m WHERE m.learning_content_id = lc.id)
  AND EXISTS (
    SELECT 1 FROM unified_cpl_questions q
    WHERE q.verification_status = 'verified'
      AND (q.main_subject = '空中航法' AND (q.sub_subject ILIKE '%所要時間%' OR q.sub_subject ILIKE '%風修正%' OR q.sub_subject ILIKE '%偏流%'))
    LIMIT 1
  );

INSERT INTO learning_test_mapping (
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
     AND (q.main_subject = '航空通信' AND q.sub_subject ILIKE '%航空交通業務%')),
  (SELECT COALESCE(array_agg(q.id ORDER BY q.id), ARRAY[]::uuid[])
   FROM unified_cpl_questions q
   WHERE q.verification_status = 'verified'
     AND (q.main_subject = '航空通信' AND q.sub_subject ILIKE '%航空交通業務%')),
  '航空通信',
  '航空通信',
  'cpl_stub_20260410',
  'verified'
FROM learning_contents lc
WHERE lc.id = '3.5.1_AirTrafficServices'
  AND NOT EXISTS (SELECT 1 FROM learning_test_mapping m WHERE m.learning_content_id = lc.id)
  AND EXISTS (
    SELECT 1 FROM unified_cpl_questions q
    WHERE q.verification_status = 'verified'
      AND (q.main_subject = '航空通信' AND q.sub_subject ILIKE '%航空交通業務%')
    LIMIT 1
  );

INSERT INTO learning_test_mapping (
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
     AND (q.main_subject = '航空通信' AND q.sub_subject ILIKE '%航空情報%')),
  (SELECT COALESCE(array_agg(q.id ORDER BY q.id), ARRAY[]::uuid[])
   FROM unified_cpl_questions q
   WHERE q.verification_status = 'verified'
     AND (q.main_subject = '航空通信' AND q.sub_subject ILIKE '%航空情報%')),
  '航空通信',
  '航空通信',
  'cpl_stub_20260410',
  'verified'
FROM learning_contents lc
WHERE lc.id = '3.5.2_AeronauticalInformation'
  AND NOT EXISTS (SELECT 1 FROM learning_test_mapping m WHERE m.learning_content_id = lc.id)
  AND EXISTS (
    SELECT 1 FROM unified_cpl_questions q
    WHERE q.verification_status = 'verified'
      AND (q.main_subject = '航空通信' AND q.sub_subject ILIKE '%航空情報%')
    LIMIT 1
  );

INSERT INTO learning_test_mapping (
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
     AND (q.main_subject = '航空通信' AND (q.sub_subject ILIKE '%無線%' OR q.sub_subject ILIKE '%電話通信%'))),
  (SELECT COALESCE(array_agg(q.id ORDER BY q.id), ARRAY[]::uuid[])
   FROM unified_cpl_questions q
   WHERE q.verification_status = 'verified'
     AND (q.main_subject = '航空通信' AND (q.sub_subject ILIKE '%無線%' OR q.sub_subject ILIKE '%電話通信%'))),
  '航空通信',
  '航空通信',
  'cpl_stub_20260410',
  'verified'
FROM learning_contents lc
WHERE lc.id = '3.5.3_RadioCommunication'
  AND NOT EXISTS (SELECT 1 FROM learning_test_mapping m WHERE m.learning_content_id = lc.id)
  AND EXISTS (
    SELECT 1 FROM unified_cpl_questions q
    WHERE q.verification_status = 'verified'
      AND (q.main_subject = '航空通信' AND (q.sub_subject ILIKE '%無線%' OR q.sub_subject ILIKE '%電話通信%'))
    LIMIT 1
  );

INSERT INTO learning_test_mapping (
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
     AND (q.main_subject = '航空通信' AND (q.sub_subject ILIKE '%緊急%' OR q.sub_subject ILIKE '%遭難%' OR q.sub_subject ILIKE '%救難%'))),
  (SELECT COALESCE(array_agg(q.id ORDER BY q.id), ARRAY[]::uuid[])
   FROM unified_cpl_questions q
   WHERE q.verification_status = 'verified'
     AND (q.main_subject = '航空通信' AND (q.sub_subject ILIKE '%緊急%' OR q.sub_subject ILIKE '%遭難%' OR q.sub_subject ILIKE '%救難%'))),
  '航空通信',
  '航空通信',
  'cpl_stub_20260410',
  'verified'
FROM learning_contents lc
WHERE lc.id = '3.5.4_EmergencyProcedures'
  AND NOT EXISTS (SELECT 1 FROM learning_test_mapping m WHERE m.learning_content_id = lc.id)
  AND EXISTS (
    SELECT 1 FROM unified_cpl_questions q
    WHERE q.verification_status = 'verified'
      AND (q.main_subject = '航空通信' AND (q.sub_subject ILIKE '%緊急%' OR q.sub_subject ILIKE '%遭難%' OR q.sub_subject ILIKE '%救難%'))
    LIMIT 1
  );

INSERT INTO learning_test_mapping (
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
     AND (q.main_subject = '航空通信' AND (q.sub_subject ILIKE '%管制%用語%' OR q.sub_subject ILIKE '%フレーズ%' OR (q.sub_subject ILIKE '%管制%' AND q.sub_subject ILIKE '%音声%')))),
  (SELECT COALESCE(array_agg(q.id ORDER BY q.id), ARRAY[]::uuid[])
   FROM unified_cpl_questions q
   WHERE q.verification_status = 'verified'
     AND (q.main_subject = '航空通信' AND (q.sub_subject ILIKE '%管制%用語%' OR q.sub_subject ILIKE '%フレーズ%' OR (q.sub_subject ILIKE '%管制%' AND q.sub_subject ILIKE '%音声%')))),
  '航空通信',
  '航空通信',
  'cpl_stub_20260410',
  'verified'
FROM learning_contents lc
WHERE lc.id = '3.5.5_ATCPhraseology'
  AND NOT EXISTS (SELECT 1 FROM learning_test_mapping m WHERE m.learning_content_id = lc.id)
  AND EXISTS (
    SELECT 1 FROM unified_cpl_questions q
    WHERE q.verification_status = 'verified'
      AND (q.main_subject = '航空通信' AND (q.sub_subject ILIKE '%管制%用語%' OR q.sub_subject ILIKE '%フレーズ%' OR (q.sub_subject ILIKE '%管制%' AND q.sub_subject ILIKE '%音声%')))
    LIMIT 1
  );


COMMIT;
