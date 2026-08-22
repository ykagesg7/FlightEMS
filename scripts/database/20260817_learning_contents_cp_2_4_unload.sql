-- CP series Season 2 ep.4: CP-2-4_Unload
-- Stock: is_published false until articlePublishSchedule.

INSERT INTO learning_contents (id, title, category, sub_category, description, order_index, parent_id, content_type, is_published, updated_at)
VALUES (
  'CP-2-4_Unload',
  '【操縦】第7話：抜いて増やせ ～Unloadと加速～',
  '操縦',
  '曲技飛行',
  '加速したければGを抜け。unloadがサイフを増やす。250→350は1 Gより0 Gが速い。2–3 Gのまま400は遅い。stabは½ G、引くと失速兆候。数字はT-38枠。',
  617,
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
