-- CP series Season 2 ep.2: CP-2-2_AcceleratedStall
-- Stock: is_published false until articlePublishSchedule.

INSERT INTO learning_contents (id, title, category, sub_category, description, order_index, parent_id, content_type, is_published, updated_at)
VALUES (
  'CP-2-2_AcceleratedStall',
  '【操縦】第5話：もっと引くな ～加速失速～',
  '操縦',
  '曲技飛行',
  'もっと引くほど旋回は速くならない。light buffetの水平旋回がoptimum turn。オーバーシュートを直すために失速に入れるな。演習の戻しは緩めてbuffetへ。数字はT-38枠。学習記事であり実機手順ではない。',
  615,
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
