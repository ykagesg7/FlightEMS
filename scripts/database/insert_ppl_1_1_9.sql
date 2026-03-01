-- Register PPL-1-1-9_FlightPerformance in learning_contents
-- Run via Supabase Dashboard SQL Editor or SupabaseMCP execute_sql

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
  'PPL-1-1-9_FlightPerformance',
  '【航空工学】余剰馬力の美学：上昇と旋回のパフォーマンスを支配せよ',
  'PPL',
  '航空工学',
  '上昇を決めるのはエンジンの「意地」と「余力」たい。Vx/Vyの真実から、旋回時の失速速度計算まで、九州の風景を飛び越えながらマスターするばい。',
  9,
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
