-- CP series Season 4 ep.2: CP-4-2_NoseLow
-- Stock: is_published false until articlePublishSchedule.

INSERT INTO learning_contents (id, title, category, sub_category, description, order_index, parent_id, content_type, is_published, updated_at)
VALUES (
  'CP-4-2_NoseLow',
  '【操縦】第13話：突っ込んだ鼻は最短で起こせ ～Nose-low recovery～',
  '操縦',
  '曲技飛行',
  'Nose-lowは近い地平線へロールし、最短半径で起こせ。バフェットか目標Gの早い方まで引く。作業空域は4–5 G、速度は250–400 kt。数字はT-38枠。',
  623,
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
