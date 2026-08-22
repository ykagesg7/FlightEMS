-- CP series Season 5 ep.5: CP-5-5_Loop
-- Stock: is_published false until articlePublishSchedule.

INSERT INTO learning_contents (id, title, category, sub_category, description, order_index, parent_id, content_type, is_published, updated_at)
VALUES (
  'CP-5-5_Loop',
  '【操縦】第18話：垂直に円を描け ～Loop～',
  '操縦',
  '曲技飛行',
  'Loopは垂直面で円を描く。滑らかな straight pull。頂点は翼水平、150 KIAS超。完了は進入パラメータ。進入は500 KIAS / MIL（T-38の場合）。',
  628,
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
