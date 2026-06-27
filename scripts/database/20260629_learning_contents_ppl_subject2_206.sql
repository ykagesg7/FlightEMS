-- PPL Master Subject 2（航空気象）Phase 1 第6本: PPL-2-1-6
-- Apply: Supabase MCP execute_sql or npx supabase db query --linked -f

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
  'PPL-2-1-6_CloudTypesAndFormation',
  '【航空気象】雲の種類と特徴：成長するバケモノと「隠れた積乱雲」を見抜け',
  'PPL',
  '航空気象',
  '数十分でカワイイ雲がバケモノ（積乱雲）に育つ恐怖。そして大人しい層雲に隠された地雷。10種の雲の顔つきから、空の死神の手配書を読み解く極意を伝授する。',
  206,
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
