-- W26 2026-06-30: PPL Subject 2 Phase 1 ブロック B/C（211–222）— learning_contents + learning_test_mapping
-- Apply: Supabase MCP execute_sql (project_id = fstynltdfdetpyvbrswr)

INSERT INTO learning_contents (id, title, category, sub_category, description, order_index, parent_id, content_type, is_published, updated_at)
VALUES
  ('PPL-2-2-1_WindObservationBasics', '【航空気象】風の観測と通報：地上の「矢印」が教える空の流れ', 'PPL', '航空気象', '風向・風速・METAR 風グループの読み方。PPL ブロック B 第1本。', 211, NULL, 'text', true, NOW()),
  ('PPL-2-2-2_AirMassesAndFronts', '【航空気象】気団と前線：温度の「壁」が天気を変える', 'PPL', '航空気象', '気団・寒冷/温暖前線の基礎。天気図の線を読む第一歩。', 212, NULL, 'text', true, NOW()),
  ('PPL-2-2-3_PressureSystemsAndJapanWeather', '【航空気象】高気圧・低気圧と日本の天気：天気図の「渦」を読む', 'PPL', '航空気象', '高低気圧の風の回り、温帯低気圧と台風の概要。', 213, NULL, 'text', true, NOW()),
  ('PPL-2-3-1_FlightWeatherHazardsBasics', '【航空気象】飛行気象障害の基礎：乱気流・雷・着氷・視程', 'PPL', '航空気象', '乱気流・雷雲・着氷・視程障害の PPL レベル分類と回避。', 221, NULL, 'text', true, NOW()),
  ('PPL-2-3-2_MetarTafAndWeatherReports', '【航空気象】METAR・TAF・気象通報の読み方：空港の「今」と「予報」', 'PPL', '航空気象', 'METAR/SPECI/TAF の役割と主要グループ。Subject 2 Phase 1 完走。', 222, NULL, 'text', true, NOW())
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  sub_category = EXCLUDED.sub_category,
  description = EXCLUDED.description,
  order_index = EXCLUDED.order_index,
  is_published = EXCLUDED.is_published,
  updated_at = EXCLUDED.updated_at;

-- PPL-2-2-1: 風クラスタ
INSERT INTO learning_test_mapping (
  learning_content_id, content_title, content_category, test_question_ids, unified_cpl_question_ids,
  topic_category, subject_area, mapping_source, verification_status
)
SELECT lc.id, lc.title, lc.category,
  (SELECT COALESCE(array_agg(q.id::text ORDER BY q.id), ARRAY[]::text[])
   FROM unified_cpl_questions q
   WHERE q.verification_status = 'verified' AND q.applicable_exams @> ARRAY['PPL']::text[]
     AND q.main_subject = '航空気象'
     AND q.sub_subject IN ('風/風系', '風/風の吹く原因', '風/風の高度変化')),
  (SELECT COALESCE(array_agg(q.id ORDER BY q.id), ARRAY[]::uuid[])
   FROM unified_cpl_questions q
   WHERE q.verification_status = 'verified' AND q.applicable_exams @> ARRAY['PPL']::text[]
     AND q.main_subject = '航空気象'
     AND q.sub_subject IN ('風/風系', '風/風の吹く原因', '風/風の高度変化')),
  '航空気象/風', '航空気象', 'w26_20260630_ppl221_wind', 'verified'
FROM learning_contents lc WHERE lc.id = 'PPL-2-2-1_WindObservationBasics'
ON CONFLICT (learning_content_id, topic_category) DO UPDATE SET
  test_question_ids = EXCLUDED.test_question_ids,
  unified_cpl_question_ids = EXCLUDED.unified_cpl_question_ids,
  mapping_source = EXCLUDED.mapping_source,
  updated_at = now();

-- PPL-2-2-2: 気団・前線
INSERT INTO learning_test_mapping (
  learning_content_id, content_title, content_category, test_question_ids, unified_cpl_question_ids,
  topic_category, subject_area, mapping_source, verification_status
)
SELECT lc.id, lc.title, lc.category,
  (SELECT COALESCE(array_agg(q.id::text ORDER BY q.id), ARRAY[]::text[])
   FROM unified_cpl_questions q
   WHERE q.verification_status = 'verified' AND q.applicable_exams @> ARRAY['PPL']::text[]
     AND q.main_subject = '航空気象'
     AND q.sub_subject IN (
       '前線/前線の種類と気象状態', '前線/前線の性質', '前線/日本付近の前線',
       '気団/気団の分類と性質', '気団/日本に影響する気団', '気団/気団の変質')),
  (SELECT COALESCE(array_agg(q.id ORDER BY q.id), ARRAY[]::uuid[])
   FROM unified_cpl_questions q
   WHERE q.verification_status = 'verified' AND q.applicable_exams @> ARRAY['PPL']::text[]
     AND q.main_subject = '航空気象'
     AND q.sub_subject IN (
       '前線/前線の種類と気象状態', '前線/前線の性質', '前線/日本付近の前線',
       '気団/気団の分類と性質', '気団/日本に影響する気団', '気団/気団の変質')),
  '航空気象/気団前線', '航空気象', 'w26_20260630_ppl222_fronts', 'verified'
FROM learning_contents lc WHERE lc.id = 'PPL-2-2-2_AirMassesAndFronts'
ON CONFLICT (learning_content_id, topic_category) DO UPDATE SET
  test_question_ids = EXCLUDED.test_question_ids,
  unified_cpl_question_ids = EXCLUDED.unified_cpl_question_ids,
  mapping_source = EXCLUDED.mapping_source,
  updated_at = now();

-- PPL-2-2-3: 気圧系
INSERT INTO learning_test_mapping (
  learning_content_id, content_title, content_category, test_question_ids, unified_cpl_question_ids,
  topic_category, subject_area, mapping_source, verification_status
)
SELECT lc.id, lc.title, lc.category,
  (SELECT COALESCE(array_agg(q.id::text ORDER BY q.id), ARRAY[]::text[])
   FROM unified_cpl_questions q
   WHERE q.verification_status = 'verified' AND q.applicable_exams @> ARRAY['PPL']::text[]
     AND q.main_subject = '航空気象'
     AND q.sub_subject IN (
       '高気圧と低気圧/高気圧の種類', '高気圧と低気圧/低気圧の種類',
       '高気圧と低気圧/高気圧と低気圧に伴う風系', '高気圧と低気圧/日本付近の気圧配置',
       '熱帯気象/熱帯低気圧')),
  (SELECT COALESCE(array_agg(q.id ORDER BY q.id), ARRAY[]::uuid[])
   FROM unified_cpl_questions q
   WHERE q.verification_status = 'verified' AND q.applicable_exams @> ARRAY['PPL']::text[]
     AND q.main_subject = '航空気象'
     AND q.sub_subject IN (
       '高気圧と低気圧/高気圧の種類', '高気圧と低気圧/低気圧の種類',
       '高気圧と低気圧/高気圧と低気圧に伴う風系', '高気圧と低気圧/日本付近の気圧配置',
       '熱帯気象/熱帯低気圧')),
  '航空気象/気圧系', '航空気象', 'w26_20260630_ppl223_pressure', 'verified'
FROM learning_contents lc WHERE lc.id = 'PPL-2-2-3_PressureSystemsAndJapanWeather'
ON CONFLICT (learning_content_id, topic_category) DO UPDATE SET
  test_question_ids = EXCLUDED.test_question_ids,
  unified_cpl_question_ids = EXCLUDED.unified_cpl_question_ids,
  mapping_source = EXCLUDED.mapping_source,
  updated_at = now();

-- PPL-2-3-1: 気象障害
INSERT INTO learning_test_mapping (
  learning_content_id, content_title, content_category, test_question_ids, unified_cpl_question_ids,
  topic_category, subject_area, mapping_source, verification_status
)
SELECT lc.id, lc.title, lc.category,
  (SELECT COALESCE(array_agg(q.id::text ORDER BY q.id), ARRAY[]::text[])
   FROM unified_cpl_questions q
   WHERE q.verification_status = 'verified' AND q.applicable_exams @> ARRAY['PPL']::text[]
     AND q.main_subject = '航空気象'
     AND q.sub_subject LIKE '飛行に影響する気象障害/%'),
  (SELECT COALESCE(array_agg(q.id ORDER BY q.id), ARRAY[]::uuid[])
   FROM unified_cpl_questions q
   WHERE q.verification_status = 'verified' AND q.applicable_exams @> ARRAY['PPL']::text[]
     AND q.main_subject = '航空気象'
     AND q.sub_subject LIKE '飛行に影響する気象障害/%'),
  '航空気象/気象障害', '航空気象', 'w26_20260630_ppl231_hazards', 'verified'
FROM learning_contents lc WHERE lc.id = 'PPL-2-3-1_FlightWeatherHazardsBasics'
ON CONFLICT (learning_content_id, topic_category) DO UPDATE SET
  test_question_ids = EXCLUDED.test_question_ids,
  unified_cpl_question_ids = EXCLUDED.unified_cpl_question_ids,
  mapping_source = EXCLUDED.mapping_source,
  updated_at = now();

-- PPL-2-3-2: 気象通報
INSERT INTO learning_test_mapping (
  learning_content_id, content_title, content_category, test_question_ids, unified_cpl_question_ids,
  topic_category, subject_area, mapping_source, verification_status
)
SELECT lc.id, lc.title, lc.category,
  (SELECT COALESCE(array_agg(q.id::text ORDER BY q.id), ARRAY[]::text[])
   FROM unified_cpl_questions q
   WHERE q.verification_status = 'verified' AND q.applicable_exams @> ARRAY['PPL']::text[]
     AND q.main_subject = '航空気象'
     AND q.sub_subject = '気象通報/飛行場の気象情報'),
  (SELECT COALESCE(array_agg(q.id ORDER BY q.id), ARRAY[]::uuid[])
   FROM unified_cpl_questions q
   WHERE q.verification_status = 'verified' AND q.applicable_exams @> ARRAY['PPL']::text[]
     AND q.main_subject = '航空気象'
     AND q.sub_subject = '気象通報/飛行場の気象情報'),
  '航空気象/気象通報', '航空気象', 'w26_20260630_ppl232_metar_taf', 'verified'
FROM learning_contents lc WHERE lc.id = 'PPL-2-3-2_MetarTafAndWeatherReports'
ON CONFLICT (learning_content_id, topic_category) DO UPDATE SET
  test_question_ids = EXCLUDED.test_question_ids,
  unified_cpl_question_ids = EXCLUDED.unified_cpl_question_ids,
  mapping_source = EXCLUDED.mapping_source,
  updated_at = now();
