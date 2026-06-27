-- PPL Master Subject 2（航空気象）Phase 1 第5本: PPL-2-1-5
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
  'PPL-2-1-5_AtmosphericStabilityBasics',
  '【航空気象】大気の安定度と断熱変化：「南無三突入」を避ける空気の読み方',
  'PPL',
  '航空気象',
  '空気が自力で大爆発（対流）するメカニズム。乾燥・湿潤の冷え方の違いから、夏の「積乱雲の壁」を避けるための予備燃料と安定度判定をハックする。',
  205,
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
