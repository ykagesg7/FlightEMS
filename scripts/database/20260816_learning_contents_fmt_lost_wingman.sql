-- USAF Formation Flying series ep.10: FMT-1-10_LostWingman
-- Stock: is_published false until articlePublishSchedule (not W34).

INSERT INTO learning_contents (id, title, category, sub_category, description, order_index, parent_id, content_type, is_published, updated_at)
VALUES (
  'FMT-1-10_LostWingman',
  '【操縦】第10話：探すな、離れろ ～Lost Wingman / KIO～',
  '操縦',
  '編隊飛行',
  '見失ったら探すな、離れろ。wings-levelは同時informと15°×15 s。KIOはSOF。専用Areaなし。主は16 Safety、離れないのは85。',
  610,
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
