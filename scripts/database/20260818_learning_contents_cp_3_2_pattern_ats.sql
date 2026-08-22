-- CP series Season 3 ep.2: CP-3-2_PatternATS
-- Stock: is_published false until articlePublishSchedule.

INSERT INTO learning_contents (id, title, category, sub_category, description, order_index, parent_id, content_type, is_published, updated_at)
VALUES (
  'CP-3-2_PatternATS',
  '【操縦】第11話：兆候を見たら切れ ～Pattern ATS～',
  '操縦',
  '曲技飛行',
  'Pattern ATSは図形ではない。buffetの明らかな増加で即回復。完了は降下停止・上昇（高度計とVVI反転）・継続できる速度。数字はT-38枠。',
  621,
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
