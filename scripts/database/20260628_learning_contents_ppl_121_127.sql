-- PPL Master Subject 1: register PPL-1-2-1 .. PPL-1-2-7 (MDX meta aligned)
-- Apply: Supabase MCP execute_sql (project_id = fstynltdfdetpyvbrswr) or SQL Editor
-- Also reorders PPL-1-2-8/9 to order_index 19/20 so 1-2-6/7 fit before 1-1-11 in nav sequence.

INSERT INTO learning_contents (
  id, title, category, sub_category, description, order_index, parent_id, content_type, is_published, updated_at
) VALUES
  (
    'PPL-1-2-1_GyroBasics',
    '【航空工学】回転する神秘「ジャイロ」 ～博多独楽と宇宙の法則～',
    'PPL',
    '航空工学',
    '雲の中で天地がわかるのは「ジャイロ」のおかげ。高速回転するコマが持つ2つの性質「剛性」と「歳差」。この宇宙の法則が、パイロットの命綱になる。',
    11,
    NULL,
    'text',
    true,
    NOW()
  ),
  (
    'PPL-1-2-2_PitotStatic',
    '【航空工学】空気を吸って生きる「3つの計器」 ～ピトー管ともつ鍋のストロー～',
    'PPL',
    '航空工学',
    '飛行機には「鼻の穴（ピトー管）」と「耳の穴（静圧孔）」がある。これが詰まると速度計も高度計も死ぬ。シンプルだけど一番怖いシステムの話。',
    12,
    NULL,
    'text',
    true,
    NOW()
  ),
  (
    'PPL-1-2-3_MagneticCompass',
    '【航空工学】酔っ払いの羅針盤「磁気コンパス」 ～中洲の千鳥足とANDSの法則～',
    'PPL',
    '航空工学',
    '電気もバキュームも死んだ時、最後に頼れるのは「磁気コンパス」だけ。しかしコイツは加速や旋回で嘘をつく。その「酔っ払い運転」の癖を見抜け。',
    13,
    NULL,
    'text',
    true,
    NOW()
  ),
  (
    'PPL-1-2-4_ReciprocatingEngine',
    '【航空工学】エンジンの心臓「4サイクル」 ～博多一口餃子と爆発の連鎖～',
    'PPL',
    '航空工学',
    '「吸って、吐いて」じゃない。「吸って、潰して、燃やして、吐く」。この4拍子のリズム（Suck, Squeeze, Bang, Blow）こそが、空を飛ぶパワーの源たい。',
    14,
    NULL,
    'text',
    true,
    NOW()
  ),
  (
    'PPL-1-2-5_CarburetorMixture',
    '【航空工学】エンジンのシェフ「キャブレター」 ～ハイボールの黄金比とアイシング～',
    'PPL',
    '航空工学',
    'エンジンはグルメだ。空気と燃料の比率（ミクスチャー）がズレると止まる。高高度での「リーン」操作と、夏場でも凍る「キャブレター・アイシング」の恐怖。',
    15,
    NULL,
    'text',
    true,
    NOW()
  ),
  (
    'PPL-1-2-6_IgnitionMagneto',
    '【航空工学】孤高の点火屋「マグネトー」 ～バッテリー不要の火花と二刀流～',
    'PPL',
    '航空工学',
    'バッテリーが死んでもエンジンは止まらない。なぜか？ それは「マグネトー」という自家発電所があるからだ。空の安全を支える「二刀流（デュアル）」の哲学とは。',
    17,
    NULL,
    'text',
    true,
    NOW()
  ),
  (
    'PPL-1-2-7_LubricationCooling',
    '【航空工学】エンジンの血液「オイルと冷却」 ～ド豚骨スープの粘度とショック～',
    'PPL',
    '航空工学',
    'オイルの仕事は「滑りを良くする」だけじゃない。実は「冷却」という重大任務を背負っている。油圧計と油温計の読み方、そして冬場に怖い「ショッククーリング」とは。',
    18,
    NULL,
    'text',
    true,
    NOW()
  )
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  sub_category = EXCLUDED.sub_category,
  description = EXCLUDED.description,
  order_index = EXCLUDED.order_index,
  content_type = EXCLUDED.content_type,
  is_published = EXCLUDED.is_published,
  updated_at = EXCLUDED.updated_at;

UPDATE learning_contents SET order_index = 19, updated_at = NOW()
WHERE id = 'PPL-1-2-8_FuelSystemVaporLock' AND order_index <> 19;

UPDATE learning_contents SET order_index = 20, updated_at = NOW()
WHERE id = 'PPL-1-2-9_TScanInstrumentScan' AND order_index <> 20;
