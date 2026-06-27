-- PPL Master Subject 2（航空気象）Phase 1 第4本: PPL-2-1-4
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
  'PPL-2-1-4_MoistureHumidityDewpoint',
  '【航空気象】水蒸気の物理と露点：コックピットの白煙と「潜熱」の魔術',
  'PPL',
  '航空気象',
  'エアコンから白い煙！？それは火災か、それとも結露か。水が変身する時に出入りする「潜熱（エネルギー）」の本質と、湿度・露点・スプレッド（気温－露点）の罠を暴く。',
  204,
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
