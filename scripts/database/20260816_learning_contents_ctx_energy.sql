-- USAF Contact / Transition series ep.2: CTX-1-2_Energy
-- W34 Wed 2026-08-19. is_published false until cron.

INSERT INTO learning_contents (id, title, category, sub_category, description, order_index, parent_id, content_type, is_published, updated_at)
VALUES (
  'CTX-1-2_Energy',
  '【操縦】第2話：足りんなら換えろ ～高度と速度の交換～',
  '操縦',
  '曲技飛行',
  '高度と速度は同じサイフの通貨。1,000 ft ≈ 50 kt（T-38枠）。中間300 KIASは目安。ピッチで交換、余剰推力で増やす。ABで買うな。Area 32。',
  612,
  NULL,
  'text',
  false,
  NOW()
)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  category = EXCLUDED.category,
  sub_category = EXCLUDED.sub_category,
  description = EXCLUDED.description,
  order_index = EXCLUDED.order_index,
  content_type = EXCLUDED.content_type,
  is_published = EXCLUDED.is_published,
  updated_at = EXCLUDED.updated_at;
