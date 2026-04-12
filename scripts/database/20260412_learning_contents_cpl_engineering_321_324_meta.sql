-- CPL 航空工学 3.2.1〜3.2.4: learning_contents の title / description を MDX meta と一致させる。
-- learning_test_mapping.content_title も同タイトルへ揃える（ReviewContentLink 表示用）。
-- PrevNextNav の order_index 340〜343 は 20260330_learning_test_mapping_cpl_clusters_by_subject.sql と整合。
-- 冪等: learning_contents は ON CONFLICT (id) DO UPDATE。

BEGIN;

INSERT INTO learning_contents (
  id, title, category, description, order_index, content_type,
  is_published, sub_category, created_at, updated_at
) VALUES
  (
    '3.2.1_PropellerTheory',
    '【航空工学】プロペラと推進：空気を掻く本質と「エンジンストール」の恐怖',
    'CPL学科',
    'プロペラもジェットも「空気を掻く」本質は同じ。低速や高高度での急激なスロットル操作が生む「エンジンストール」の恐怖と、プロペラ効率の真髄を伝授する。',
    340,
    'text',
    true,
    '航空工学',
    now(),
    now()
  ),
  (
    '3.2.2_WingTheory',
    '【航空工学】翼理論と揚力：「加速失速」の恐怖と空気を掴む限界',
    'CPL学科',
    '「失速＝スピードが遅いから落ちる」という勘違いが死を招く。絶対にやり直しが効かない着陸での「加速失速」の恐怖から、迎角（AOA）と揚力の本質を学ぶ。',
    341,
    'text',
    true,
    '航空工学',
    now(),
    now()
  ),
  (
    '3.2.3_StabilityControl',
    '【航空工学】安定性と操縦性：FBWの恐怖と「シーソー」の法則',
    'CPL学科',
    '飛行機は「安定」しすぎると曲がらない。極限の機動性を持つ機体がいかに「超不安定」に作られているか、FBW（フライバイワイヤー）の裏側から安定性と操縦性のトレードオフを学ぶ。',
    342,
    'text',
    true,
    '航空工学',
    now(),
    now()
  ),
  (
    '3.2.4_HydraulicElectrical',
    '【航空工学】油圧・航空機電気：機体の「筋肉と神経」を失う恐怖',
    'CPL学科',
    '油圧は「筋肉」、電気は「神経」。この2つが死ねば飛行機はただの鉄の塊になる。音速の世界を生き抜いたパイロットの言葉から、多重系（冗長性）の絶対的な必要性を学ぶ。',
    343,
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
    '3.2.1_PropellerTheory',
    '3.2.2_WingTheory',
    '3.2.3_StabilityControl',
    '3.2.4_HydraulicElectrical'
  );

COMMIT;
