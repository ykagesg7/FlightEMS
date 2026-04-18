-- CPL 航空工学 3.2.5〜3.2.12: learning_contents の title / description / order_index を MDX meta と一致。
-- PrevNextNav は order_index 340〜351 で 3.2.1〜12 が連番（340〜343 は 20260412_learning_contents_cpl_engineering_321_324_meta.sql）。
-- 既存 DB で 3.2.7〜12 が order 350〜355 の場合、本 SQL で 346〜351 に上書きする。
-- learning_test_mapping.content_title も同タイトルへ揃える（ReviewContentLink 表示用）。
-- 冪等: learning_contents は ON CONFLICT (id) DO UPDATE。

BEGIN;

INSERT INTO learning_contents (
  id, title, category, description, order_index, content_type,
  is_published, sub_category, created_at, updated_at
) VALUES
  (
    '3.2.5_EngineTheory',
    '【航空工学】エンジンと推進：「BINGO（ガス欠）」の恐怖と高度のマネジメント',
    'CPL学科',
    '低高度でギャンギャン回せば、あっという間にガス欠（BINGO）でドヤされる。高度と出力、燃費の関係を、浜松餃子の「もやし」の役割とともにハックする。',
    344,
    'text',
    true,
    '航空工学',
    now(),
    now()
  ),
  (
    '3.2.6_InstrumentSystem',
    '【航空工学】エアデータとピトー静圧：鳥と氷が塞ぐ「空の五感」',
    'CPL学科',
    'ヒーターでは溶けない「鳥の肉片」がピトー管を塞ぐ恐怖。電気系統の喪失が招く計器のフリーズ。空の五感を奪われたパイロットがいかにして生き残るかを伝授する。',
    345,
    'text',
    true,
    '航空工学',
    now(),
    now()
  ),
  (
    '3.2.7_LiftAndDrag',
    '【航空工学】揚力と抗力の詳細：2つの「空気の借金」とバックサイドの罠',
    'CPL学科',
    'スピードを落とせば抗力は減る？ その思い込みが死を招く。2つの抗力とバックサイドの罠、そしてL/D MAXが生み出す「3つのMax（滑空・航続・滞空）」の違いを解き明かす。',
    346,
    'text',
    true,
    '航空工学',
    now(),
    now()
  ),
  (
    '3.2.8_PowerAndPerformance',
    '【航空工学】必要馬力と利用馬力：着陸時の「スピードブレーキ」に隠された命の貯金',
    'CPL学科',
    '自衛隊の戦闘機はなぜ着陸時にスピードブレーキを出しているのか？「必要馬力」と「利用馬力」、そして命を救う「余剰馬力」のメカニズムをハックする。',
    347,
    'text',
    true,
    '航空工学',
    now(),
    now()
  ),
  (
    '3.2.9_PitotStaticSystem',
    '【航空工学】ピトー静圧系統の詳細：テープ剥がし忘れの恐怖と「犯人当てゲーム」',
    'CPL学科',
    '離陸したのに高度計が動かない！洗機後のテープ剥がし忘れや虫の侵入が招く「静圧孔閉塞」の恐怖。狂った計器の中から真実を見抜く「クロスチェック」の極意を伝授する。',
    348,
    'text',
    true,
    '航空工学',
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
  )
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  order_index = EXCLUDED.order_index,
  content_type = EXCLUDED.content_type,
  is_published = EXCLUDED.is_published,
  sub_category = EXCLUDED.sub_category,
  updated_at = EXCLUDED.updated_at;

UPDATE learning_test_mapping AS m
SET
  content_title = lc.title,
  updated_at = now()
FROM learning_contents AS lc
WHERE m.learning_content_id = lc.id
  AND lc.id IN (
    '3.2.5_EngineTheory',
    '3.2.6_InstrumentSystem',
    '3.2.7_LiftAndDrag',
    '3.2.8_PowerAndPerformance',
    '3.2.9_PitotStaticSystem',
    '3.2.10_WeightAndBalance',
    '3.2.11_StallAndSpin',
    '3.2.12_EngineSystems'
  );

COMMIT;
