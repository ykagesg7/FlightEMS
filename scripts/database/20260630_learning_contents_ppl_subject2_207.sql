-- PPL Master Subject 2（航空気象）Phase 1 第7本: PPL-2-1-7（ブロックA完結）
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
  'PPL-2-1-7_FogTypesAndFormation',
  '【航空気象】視程と霧：高度を狂わせる「白い絨毯」の錯覚と2大本質',
  'PPL',
  '航空気象',
  '霧はただ視界を奪うだけじゃない。パイロットの「高度感覚」を狂わせる白い絨毯の恐怖。すべての霧に共通する「コップが溢れる2大ルート」から、霧の発生メカニズムを完全ハックする。',
  207,
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
