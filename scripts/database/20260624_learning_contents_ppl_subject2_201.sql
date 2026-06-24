-- PPL Master Subject 2（航空気象）Phase 1 第1本: PPL-2-1-1
-- 適用: Supabase MCP execute_sql（project_id = fstynltdfdetpyvbrswr）または SQL Editor

INSERT INTO learning_contents (
  id,
  title,
  category,
  sub_category,
  description,
  order_index,
  parent_id,
  content_type,
  is_published,
  updated_at
) VALUES (
  'PPL-2-1-1_AtmosphereAndIsaBasics',
  '【航空気象】大気組成とISAの基礎：高空の酸欠と「空気密度」の魔力',
  'PPL',
  '航空気象',
  '大気はただの空気ではない。高度が上がると襲ってくる低酸素症（Hypoxia）の恐怖と、冷たい東北の空気が生み出す「極上の機体レスポンス（空気密度）」の本質をハックする。',
  201,
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
