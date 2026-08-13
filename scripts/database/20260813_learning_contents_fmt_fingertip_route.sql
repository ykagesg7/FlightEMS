-- USAF Formation Flying series ep.3: FMT-1-3_FingertipRoute
-- category: 操縦 (article hub). Idempotent upsert.

INSERT INTO learning_contents (id, title, category, sub_category, description, order_index, parent_id, content_type, is_published, updated_at)
VALUES (
  'FMT-1-3_FingertipRoute',
  '【操縦】第3話：空中の居場所 ～FingertipとRoute～',
  '操縦',
  '編隊飛行',
  '離陸後の居場所をハック。Fingertipは helmet abeam slab bolt の見え方の目安、Routeは 2 ship widths〜500 ft の箱。Vol.2 Area 72 の U は継続的な枠超過に加え、安全間隔の喪失か急激な修正だけ。',
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
