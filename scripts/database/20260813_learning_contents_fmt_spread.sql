-- USAF Formation Flying series ep.6: FMT-1-6_Spread
-- Stock: is_published false until articlePublishSchedule (not W34).

INSERT INTO learning_contents (id, title, category, sub_category, description, order_index, parent_id, content_type, is_published, updated_at)
VALUES (
  'FMT-1-6_Spread',
  '【操縦】第6話：広いのは見るため ～Spread～',
  '操縦',
  '編隊飛行',
  'Spreadはナビの箱（1,000–3,000 ft）。strive LAB。hook等は近すぎてdeconflict不能。専用Areaは無い。',
  606,
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
