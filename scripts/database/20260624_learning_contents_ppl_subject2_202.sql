-- PPL Master Subject 2（航空気象）Phase 1 第2本: PPL-2-1-2
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
  'PPL-2-1-2_TemperatureLapseAndInversion',
  '【航空気象】気温減率と逆転層：見えない空気のフタと「黄砂の罠」',
  'PPL',
  '航空気象',
  '上に行くほど温かい「あべこべの大気」。チリや黄砂を地表に閉じ込める逆転層（Inversion Layer）の恐怖と、空に浮かぶ「見えない空気のフタ」の正体をハックする。',
  202,
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
