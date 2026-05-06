-- Phase B（2026-05-05）: 気象 3.3.10〜3.3.12・工学 3.2.10〜3.2.12・法規 3.1.7〜3.1.8 の
-- learning_contents title / description を src MDX meta と一致させ、
-- learning_test_mapping.content_title を同期（ReviewContentLink 表示）。
-- 前提: 気象は 20260424、工学は 20260412 が正本。法規 3.1.7〜3.1.8 は description を meta.excerpt へ合わせる。
-- 冪等: INSERT ... ON CONFLICT (id) DO UPDATE。

BEGIN;

INSERT INTO learning_contents (
  id, title, category, description, order_index, content_type,
  is_published, sub_category, created_at, updated_at
) VALUES
  (
    '3.3.10_CloudTypes',
    '【航空気象】雲の種類と特徴：成長するバケモノと「隠れた積乱雲」を見抜け',
    'CPL学科',
    '数十分でカワイイ雲がバケモノ（積乱雲）に育つ恐怖。そして大人しい層雲に隠された地雷。10種の雲の顔つきから、空の死神の手配書を読み解く極意を伝授する。',
    369,
    'text',
    true,
    '航空気象',
    now(),
    now()
  ),
  (
    '3.3.11_VisibilityAndFog',
    '【航空気象】視程と霧：高度を狂わせる「白い絨毯」の錯覚と罠',
    'CPL学科',
    '霧はただ視界を奪うだけじゃない。パイロットの「高度感覚」を狂わせる白い絨毯の恐怖。東北の海霧（シーフォグ）から学ぶ、霧の発生条件と空間識失調（錯覚）の罠をハックする。',
    370,
    'text',
    true,
    '航空気象',
    now(),
    now()
  ),
  (
    '3.3.12_Turbulence',
    '【航空気象】乱気流の種類と対策：キャノピーに頭をぶつける「見えない洗濯機」',
    'CPL学科',
    '冬の東北、20-30ktの爆風の中で山肌を縫う極限飛行。キャノピーに頭をぶつけるほどの「見えない洗濯機（乱気流）」の種類と、機体を壊さないサバイバル操縦術をハックする。',
    371,
    'text',
    true,
    '航空気象',
    now(),
    now()
  ),
  (
    '3.2.10_WeightAndBalance',
    '【航空工学】重量と重心：「お尻擦りむき」の恐怖とCG計算の極意',
    'CPL学科',
    '燃料が減れば重心もズレる。「カンッ！」と機首が動く微細なセンサーと、後方重心（AFT CG）で尻もちをつく恐怖。そして試験で必ず出る「CG計算」のテコの原理を叩き込む。',
    349,
    'text',
    true,
    '航空工学',
    now(),
    now()
  ),
  (
    '3.2.11_StallAndSpin',
    '【航空工学】失速とスピン：背面フラットスピンの絶望と、命を繋ぐ「脱出高度」',
    'CPL学科',
    'マイナスGで体が浮き、回復スイッチに手が届かない絶望。安全装置の過信が招いた「背面フラットスピン」の恐怖から、スピン回復の本質と命を守るデシジョンラインを叩き込む。',
    350,
    'text',
    true,
    '航空工学',
    now(),
    now()
  ),
  (
    '3.2.12_EngineSystems',
    '【航空工学】エンジン系統の詳細：警告灯の罠と「親玉（回転数）」を見抜く内科医の目',
    'CPL学科',
    'オイル警告灯が点いた！それはオイル漏れか、それともエンジン自体の停止か？ 単発機で生死を分ける「根本原因の特定（親玉探し）」と、エンジン系統の裏側を完全ハックする。',
    351,
    'text',
    true,
    '航空工学',
    now(),
    now()
  ),
  (
    '3.1.7_FlightRules',
    '【航空法規】運航規則の詳細：雲との距離とSVFR、そして「究極のサバイバル」',
    'CPL学科',
    'ルールを守って死んだら意味がない。SARP協定の現場から学ぶVFR/IFRの使い分けと、SVFR（特別VFR）の真の目的、そして究極のサバイバル判断を伝授する。',
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
    '羽田や海外で起きた痛ましい衝突事故。滑走路誤進入の恐怖から学ぶ、地上ルールの優先順位と「Takeoff」の封印。そして命を救う状況認識（SA）の極意。',
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
  content_type = EXCLUDED.content_type,
  is_published = EXCLUDED.is_published,
  sub_category = EXCLUDED.sub_category,
  category = EXCLUDED.category,
  updated_at = EXCLUDED.updated_at;

UPDATE learning_test_mapping AS m
SET
  content_title = lc.title,
  updated_at = now()
FROM learning_contents AS lc
WHERE m.learning_content_id = lc.id
  AND lc.id IN (
    '3.3.10_CloudTypes',
    '3.3.11_VisibilityAndFog',
    '3.3.12_Turbulence',
    '3.2.10_WeightAndBalance',
    '3.2.11_StallAndSpin',
    '3.2.12_EngineSystems',
    '3.1.7_FlightRules',
    '3.1.8_AirportOperations'
  );

COMMIT;
