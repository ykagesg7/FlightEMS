-- CP series Season 4 ep.1: CP-4-1_NoseHigh
-- Stock: is_published false until articlePublishSchedule.

INSERT INTO learning_contents (id, title, category, sub_category, description, order_index, parent_id, content_type, is_published, updated_at)
VALUES (
  'CP-4-1_NoseHigh',
  '【操縦】第12話：鼻を上げすぎたら戻せ ～Nose-high recovery～',
  '操縦',
  '曲技飛行',
  'Nose-highはひどさに合わせて戻せ。中程度は緩めてslight G、極端は近い地平線へロール、極低速はunload。地平線で足りなければ鼻を下へ。数字はT-38枠。',
  622,
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
