-- CPL 航空法規 3.1.x: learning_contents の order_index を MDX 読み順（3.1.1→3.1.8）に揃える。
-- PrevNextNav（Supabase order_index）と整合。冪等: ON CONFLICT DO UPDATE。
-- 関連: src/content/lessons/3.1.*_*.mdx の series=CPL-Aviation-Legal, order=1..8

BEGIN;

INSERT INTO learning_contents (
  id, title, category, description, order_index, content_type,
  is_published, sub_category, created_at, updated_at
) VALUES
  (
    '3.1.1_AviationLegal0',
    '【航空法規】戦闘機乗りへの第一歩：暗記を捨てる「ルールの階層」ハック術',
    'CPL学科',
    '航空法規シリーズ第1話（MDX id 整合）。ルールの階層と読み方の型。',
    310,
    'text',
    true,
    '航空法規',
    now(),
    now()
  ),
  (
    '3.1.2_AviationLegal1',
    '【航空法規】特定操縦技能の審査（SPC）と技能証明',
    'CPL学科',
    '航空法規シリーズ第2話。特定操縦技能の審査と技能証明の仕分け。',
    311,
    'text',
    true,
    '航空法規',
    now(),
    now()
  ),
  (
    '3.1.3_AviationLegal2',
    '【航空法規】航空身体検査証明：数ミリのズレが命を奪う「人間の耐空証明」',
    'CPL学科',
    '航空法規シリーズ第3話。航空身体検査証明の枠組み。',
    312,
    'text',
    true,
    '航空法規',
    now(),
    now()
  ),
  (
    '3.1.4_AviationLegal3',
    '【航空法規】耐空証明と空域・高度：空の「相場観」と命の境界線',
    'CPL学科',
    '航空法規シリーズ第4話。耐空証明と高度・空域の考え方。',
    313,
    'text',
    true,
    '航空法規',
    now(),
    now()
  ),
  (
    '3.1.5_AirspaceClassification',
    '【航空法規】空域分類とクラスC空域',
    'CPL学科',
    '航空法規シリーズ第5話。空域クラス A〜G の整理。',
    314,
    'text',
    true,
    '航空法規',
    now(),
    now()
  ),
  (
    '3.1.6_IFRMinimumAltitude',
    '【航空法規】計器飛行方式（IFR）の最低高度',
    'CPL学科',
    '航空法規シリーズ第6話。IFR 最低安全高度の要約。',
    315,
    'text',
    true,
    '航空法規',
    now(),
    now()
  ),
  (
    '3.1.7_FlightRules',
    '【航空法規】運航規則の詳細：雲との距離とSVFR、そして「究極のサバイバル」',
    'CPL学科',
    '航空法規シリーズ第7話。VFR/SVFR・雲との距離・緊急判断の整理。',
    316,
    'text',
    true,
    '航空法規',
    now(),
    now()
  ),
  (
    '3.1.8_AirportOperations',
    '【航空法規】空港運用規則：滑走路の境界線と「命を守るSA（状況認識）」',
    'CPL学科',
    '航空法規シリーズ第8話。地上優先・通信フレーズ・SA の整理。',
    317,
    'text',
    true,
    '航空法規',
    now(),
    now()
  )
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  order_index = EXCLUDED.order_index,
  category = EXCLUDED.category,
  sub_category = EXCLUDED.sub_category,
  content_type = EXCLUDED.content_type,
  is_published = EXCLUDED.is_published,
  updated_at = now();

COMMIT;
