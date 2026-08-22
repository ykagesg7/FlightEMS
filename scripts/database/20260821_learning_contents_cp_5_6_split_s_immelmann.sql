-- CP series Season 5 ep.6: CP-5-6_SplitSImmelmann
-- Stock: is_published false until articlePublishSchedule.

INSERT INTO learning_contents (id, title, category, sub_category, description, order_index, parent_id, content_type, is_published, updated_at)
VALUES (
  'CP-5-6_SplitSImmelmann',
  '【操縦】第19話：一周を前半と後半に切れ ～Split-S / Immelmann～',
  '操縦',
  '曲技飛行',
  'Loopを前半と後半に切り分けろ。Split-Sは背面水平から後半の引き起こし。Immelmannは前半のあと頂点でhalf roll。進入は200 / 500 KIAS（T-38の場合）。',
  629,
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
