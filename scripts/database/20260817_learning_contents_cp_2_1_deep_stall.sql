-- CP series Season 2 ep.1: CP-2-1_DeepStall
-- Stock: is_published false until articlePublishSchedule.

INSERT INTO learning_contents (id, title, category, sub_category, description, order_index, parent_id, content_type, is_published, updated_at)
VALUES (
  'CP-2-1_DeepStall',
  '【操縦】第4話：引いたままは沈む ～Deep stall～',
  '操縦',
  '曲技飛行',
  'Deep stallはfeelの演習。エルロン中立でaft to stop、回復は引きを緩める。演習は開始パワー維持。意図しない失速はまず迎え角、その先はその機の手順。140 kt / 6,000 fpmはT-38枠。学習記事であり実機手順ではない。',
  614,
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
