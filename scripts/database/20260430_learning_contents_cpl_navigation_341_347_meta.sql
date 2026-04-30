-- CPL 空中航法 3.4.1〜3.4.7: learning_contents の title / description を MDX meta と一致させる。
-- PrevNextNav の order_index は既存運用に合わせ 380〜386 を維持。
-- learning_test_mapping.content_title も同タイトルへ揃える（ReviewContentLink 表示用）。
-- 冪等: learning_contents は ON CONFLICT (id) DO UPDATE。

BEGIN;

INSERT INTO learning_contents (
  id, title, category, description, order_index, content_type,
  is_published, sub_category, created_at, updated_at
) VALUES
  (
    '3.4.1_DeadReckoning',
    '【空中航法】推測航法（DR）の基礎：GPSのウソを見破る「空のモノサシ」',
    'CPL学科',
    '「GPSがあるのになぜ古い航法を学ぶのか？」その答えは、AIと同じ。機械のウソを見破り、自分の命を守る究極のモノサシ「推測航法（DR）」の真髄を叩き込む。',
    380,
    'text',
    true,
    '空中航法',
    now(),
    now()
  ),
  (
    '3.4.2_VORNavigation',
    '【空中航法】VOR 航法：放射状線と番兵の「角度」を読み切れ',
    'CPL学科',
    'VORは「360本の矢印の束」。機首の向きと混同すると死神に捕まる。空の迷子を防ぐ「ポイント・インターセプト」の極意と、TO/FROMの騙し合いをハックする。',
    381,
    'text',
    true,
    '空中航法',
    now(),
    now()
  ),
  (
    '3.4.3_GPSNavigation',
    '【空中航法】GNSS／GPS 航法の基礎：スプーフィングの罠と「最強のバックアップ」',
    'CPL学科',
    'スマホの地図を妄信して崖から落ちるな。電波妨害（ジャミング）より恐ろしい「スプーフィング（偽装）」の罠と、GPSのウソを見破るアナログなバックアップ術をハックする。',
    382,
    'text',
    true,
    '空中航法',
    now(),
    now()
  ),
  (
    '3.4.4_FlightPlanning',
    '【空中航法】飛行計画と航法計算：BINGOとJOKER、命を繋ぐ「引き際」の計算',
    'CPL学科',
    '戦闘機乗りの「BINGO（帰投限界）」と「JOKER（戦闘離脱）」から学ぶ燃料計算の極意。ただの足し算ではない、命を繋ぐ「プランB（代替）」と「予備燃料」の真髄をハックする。',
    383,
    'text',
    true,
    '空中航法',
    now(),
    now()
  ),
  (
    '3.4.5_NDBNavigation',
    '【空中航法】NDB航法：横風に流される「ホーミング」の罠と計算の極意',
    'CPL学科',
    'ただ針を追いかけて飛ぶと「犬のカーブ」を描いて迷子になる。超アナログなNDB航法で必須となる「相対方位と磁気方位の計算」と、雷に騙される計器のウソをハックする。',
    384,
    'text',
    true,
    '空中航法',
    now(),
    now()
  ),
  (
    '3.4.6_DMENavigation',
    '【空中航法】DME航法：距離がゼロにならない罠と「混乱円錐」の突破法',
    'CPL学科',
    'DMEの距離は絶対にゼロにならない！高高度になるほど広がる「コーン・オブ・コンフュージョン」の罠と、計器のウソを見破って局の真上を特定するプロの判断基準を伝授する。',
    385,
    'text',
    true,
    '空中航法',
    now(),
    now()
  ),
  (
    '3.4.7_DeadReckoningAdvanced',
    '【空中航法】推測航法の応用：風三角形と、命を救う「ざっくり計算（Rules of Thumb）」',
    'CPL学科',
    '飛んでいる最中に計算盤を回す余裕などない！風に流される恐怖と、プロが実践する魔法の暗算術「時計の文字盤の法則」によるサバイバルハックを伝授する。',
    386,
    'text',
    true,
    '空中航法',
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
    '3.4.1_DeadReckoning',
    '3.4.2_VORNavigation',
    '3.4.3_GPSNavigation',
    '3.4.4_FlightPlanning',
    '3.4.5_NDBNavigation',
    '3.4.6_DMENavigation',
    '3.4.7_DeadReckoningAdvanced'
  );

COMMIT;
