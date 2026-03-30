-- CPL 科目ハブ + learning_contents オーファン修復 + 参考インベントリ（2026-03-30）
--
-- === Supabase 確認スナップショット（実行前・MCP 取得） ===
-- learning_test_mapping 総行数: 13
-- topic_category 内訳: 航空工学 8, 航空法規 4, 航空気象 1
-- learning_contents（航空系）: 3.1.1_AviationLegal0 + PPL 工学のみ。
--   マッピング上は 3.1.2〜3.2.6, engineering_basics, weather_basics が参照されるが
--   learning_contents に行が無く ReviewContentLink が空振りしていた。
-- 20260329_learning_test_mapping_incremental_ppl_clusters.sql は本番未実行と推測（行数が増えていない）。
--
-- === インベントリ: verified 件数上位 sub_subject（クラスタ正本） ===
-- 航空気象: 大気の基礎/温度(41), 大気の物理(39), 気象通報/飛行場の気象情報(35), 天気図/実況天気図の解析(27), ...
-- 空中航法: 人間の能力及び限界に関する一般知識(97), 航法計画書の作成/所要時間の計算に必要な知識(87), 航法(63), ...
-- 航空通信: 航空交通業務(54), 管制業務一般/電話通信(41), 航空交通業務概論/航空交通業務(24), ...
-- 航空法規: 既存 3.1.1〜3.1.4 の四分位マッピングを維持（本スクリプトでは法規の細分化は行わない）。
--
-- 方針: docs/08「分類ツリー：CPL クラスタを正とする」に沿い、
--  (A) 既存マッピングが参照する learning_contents 行を補完（オーファン修復）
--  (B) 気象・航法・通信の「科目ハブ」記事を追加し、当該 main_subject の verified 全問を束ねる
-- 冪等: learning_contents は ON CONFLICT (id) DO NOTHING。
--       learning_test_mapping は NOT EXISTS (learning_content_id)。
--
-- 注意: ReviewContentLink は /articles/{id} へリンクする。対応する MDX が
-- src/content/lessons（または記事バンドル）に無い id は 404 になり得る。
-- 公開前にスタブ MDX を追加するか、本文完成まで is_published を false にする運用を推奨。

BEGIN;

-- ---------------------------------------------------------------------------
-- A) learning_contents オーファン修復（マッピング既存行と id を一致させる）
--    category は実データに合わせ CPL学科。is_published true で ReviewContentLink がヒットするようにする。
-- ---------------------------------------------------------------------------
INSERT INTO learning_contents (
  id, title, category, description, order_index, content_type,
  is_published, sub_category, created_at, updated_at
) VALUES
  (
    '3.1.2_AviationLegal1',
    '技能証明と審査（CPL 航空法規）',
    'CPL学科',
    'CPL 学科向け法規シリーズ。技能証明・審査に関する頻出テーマ（本文は順次拡充）。',
    330,
    'text',
    true,
    '航空法規',
    now(),
    now()
  ),
  (
    '3.1.3_AviationLegal2',
    '身体検査・航空身体検査証明（CPL 航空法規）',
    'CPL学科',
    '航空従事者の身体検査・証明に関する頻出テーマ。',
    331,
    'text',
    true,
    '航空法規',
    now(),
    now()
  ),
  (
    '3.1.4_AviationLegal3',
    '耐空証明・運航規定（CPL 航空法規）',
    'CPL学科',
    '耐空証明、運航、空域・高度等の法規頻出テーマ。',
    332,
    'text',
    true,
    '航空法規',
    now(),
    now()
  ),
  (
    '3.2.1_PropellerTheory',
    'プロペラ理論（CPL 航空工学）',
    'CPL学科',
    'プロペラ・推進に関する学科対策（本文順次拡充）。',
    340,
    'text',
    true,
    '航空工学',
    now(),
    now()
  ),
  (
    '3.2.2_WingTheory',
    '翼理論（CPL 航空工学）',
    'CPL学科',
    '揚力・翼断面・二次元翼/全機空力に関する頻出テーマ。',
    341,
    'text',
    true,
    '航空工学',
    now(),
    now()
  ),
  (
    '3.2.3_StabilityControl',
    '安定性と操縦性（CPL 航空工学）',
    'CPL学科',
    '静的・動的安定性、操縦性の基礎。',
    342,
    'text',
    true,
    '航空工学',
    now(),
    now()
  ),
  (
    '3.2.4_HydraulicElectrical',
    '油圧・電気系統（CPL 航空工学）',
    'CPL学科',
    '油圧・航空機電気の学科頻出テーマ。',
    343,
    'text',
    true,
    '航空工学',
    now(),
    now()
  ),
  (
    '3.2.5_EngineTheory',
    'エンジン理論（CPL 航空工学）',
    'CPL学科',
    'ピストン/推進系の学科頻出テーマ。',
    344,
    'text',
    true,
    '航空工学',
    now(),
    now()
  ),
  (
    '3.2.6_InstrumentSystem',
    '計器システム（CPL 航空工学）',
    'CPL学科',
    'ピトー静圧・エアデータ・計器系の頻出テーマ。',
    345,
    'text',
    true,
    '航空工学',
    now(),
    now()
  ),
  (
    'engineering_basics',
    '航空力学・工学基礎（CPL 航空工学）',
    'CPL学科',
    '航空力学クラスタの復習入口（マッピングは既存バッチ準拠）。',
    346,
    'text',
    true,
    '航空工学',
    now(),
    now()
  ),
  (
    'weather_basics',
    '大気の基礎・温度（CPL 航空気象）',
    'CPL学科',
    '大気の基礎/温度クラスタの復習入口（マッピングは既存バッチ準拠）。',
    347,
    'text',
    true,
    '航空気象',
    now(),
    now()
  )
ON CONFLICT (id) DO NOTHING;

-- ---------------------------------------------------------------------------
-- B) 科目ハブ（気象・航法・通信）— learning_contents + learning_test_mapping
--    クラスタ細分化記事（3.3.x 等）が増えたら、本行の UUID 集合を分割・移行する。
-- ---------------------------------------------------------------------------
INSERT INTO learning_contents (
  id, title, category, description, order_index, content_type,
  is_published, sub_category, created_at, updated_at
) VALUES
  (
    'CPL-Hub-Meteorology',
    '航空気象（CPL 科目ハブ）',
    'CPL学科',
    '航空気象の verified 設問への復習入口。sub_subject 別記事は docs/06 Phase 1 に沿って順次追加予定。',
    320,
    'text',
    true,
    '航空気象',
    now(),
    now()
  ),
  (
    'CPL-Hub-Navigation',
    '空中航法（CPL 科目ハブ）',
    'CPL学科',
    '空中航法の verified 設問への復習入口。航法計画書・人間要因などクラスタ別記事は順次追加予定。',
    321,
    'text',
    true,
    '空中航法',
    now(),
    now()
  ),
  (
    'CPL-Hub-Communication',
    '航空通信（CPL 科目ハブ）',
    'CPL学科',
    '航空通信の verified 設問への復習入口。管制・救難・飛行計画などクラスタ別記事は順次追加予定。',
    322,
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
     AND q.main_subject = '航空気象'),
  (SELECT COALESCE(array_agg(q.id ORDER BY q.id), ARRAY[]::uuid[])
   FROM unified_cpl_questions q
   WHERE q.verification_status = 'verified'
     AND q.main_subject = '航空気象'),
  '航空気象',
  '航空気象',
  'cpl_subject_hub_20260330',
  'verified'
FROM learning_contents lc
WHERE lc.id = 'CPL-Hub-Meteorology'
  AND NOT EXISTS (SELECT 1 FROM learning_test_mapping m WHERE m.learning_content_id = lc.id)
  AND EXISTS (
    SELECT 1 FROM unified_cpl_questions q
    WHERE q.verification_status = 'verified' AND q.main_subject = '航空気象'
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
     AND q.main_subject = '空中航法'),
  (SELECT COALESCE(array_agg(q.id ORDER BY q.id), ARRAY[]::uuid[])
   FROM unified_cpl_questions q
   WHERE q.verification_status = 'verified'
     AND q.main_subject = '空中航法'),
  '空中航法',
  '空中航法',
  'cpl_subject_hub_20260330',
  'verified'
FROM learning_contents lc
WHERE lc.id = 'CPL-Hub-Navigation'
  AND NOT EXISTS (SELECT 1 FROM learning_test_mapping m WHERE m.learning_content_id = lc.id)
  AND EXISTS (
    SELECT 1 FROM unified_cpl_questions q
    WHERE q.verification_status = 'verified' AND q.main_subject = '空中航法'
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
     AND q.main_subject = '航空通信'),
  (SELECT COALESCE(array_agg(q.id ORDER BY q.id), ARRAY[]::uuid[])
   FROM unified_cpl_questions q
   WHERE q.verification_status = 'verified'
     AND q.main_subject = '航空通信'),
  '航空通信',
  '航空通信',
  'cpl_subject_hub_20260330',
  'verified'
FROM learning_contents lc
WHERE lc.id = 'CPL-Hub-Communication'
  AND NOT EXISTS (SELECT 1 FROM learning_test_mapping m WHERE m.learning_content_id = lc.id)
  AND EXISTS (
    SELECT 1 FROM unified_cpl_questions q
    WHERE q.verification_status = 'verified' AND q.main_subject = '航空通信'
    LIMIT 1
  );

COMMIT;
