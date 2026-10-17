-- USAF Formation Flying series ep.3: FMT-1-3_FingertipRoute
-- category: 操縦 (article hub). Idempotent upsert.

INSERT INTO learning_contents (id, title, category, sub_category, description, order_index, parent_id, content_type, is_published, updated_at)
VALUES (
  'FMT-1-3_FingertipRoute',
  '【操縦】第3話：空中の居場所 ～FingertipとRoute～',
  '操縦',
  '編隊飛行',
  '離陸直後の空の広さに戸惑うウイングマンへ。FingertipとRouteの本質、そして「修正レート」を支配して Pilot Induced Oscillation（パイロット誘導振動、PIO）を防ぐ相対位置コントロールの極意を体得せよ。',
  603,
  NULL,
  'text',
  true,
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
