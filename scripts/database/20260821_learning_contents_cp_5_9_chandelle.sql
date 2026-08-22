-- CP series Season 5 ep.9: CP-5-9_Chandelle
-- Stock: is_published false until articlePublishSchedule.
-- Final CP episode (order_index 632).

INSERT INTO learning_contents (id, title, category, sub_category, description, order_index, parent_id, content_type, is_published, updated_at)
VALUES (
  'CP-5-9_Chandelle',
  '【操縦】第22話：最大高度の180°を描け ～Chandelle～',
  '操縦',
  '曲技飛行',
  'Chandelleは約180度の急旋回上昇。与えられたパワーと進入速度から最大高度。完了は翼水平だが水平飛行ではない。進入は400 KIAS / 95% rpm（T-38の場合）。',
  632,
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
