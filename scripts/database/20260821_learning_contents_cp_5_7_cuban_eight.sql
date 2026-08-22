-- CP series Season 5 ep.7: CP-5-7_CubanEight
-- Stock: is_published false until articlePublishSchedule.

INSERT INTO learning_contents (id, title, category, sub_category, description, order_index, parent_id, content_type, is_published, updated_at)
VALUES (
  'CP-5-7_CubanEight',
  '【操縦】第20話：45°下げで裏返せ ～Cuban Eight～',
  '操縦',
  '曲技飛行',
  'Cuban Eightは45度下げの背面でhalf roll。2回目は逆ロール。ロール後は機首を上げず、約50 ktリードで4.5-5 Gの引き起こし。進入は500 KIAS / MIL（T-38の場合）。',
  630,
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
