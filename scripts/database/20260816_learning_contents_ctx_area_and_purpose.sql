-- USAF Contact / Transition series ep.1: CTX-1-1_AreaAndPurpose
-- Stock: is_published false until articlePublishSchedule.

INSERT INTO learning_contents (id, title, category, sub_category, description, order_index, parent_id, content_type, is_published, updated_at)
VALUES (
  'CTX-1-1_AreaAndPurpose',
  '【操縦】第1話：形を描く前に、エリアにいろ ～Contact の目的とエリア方位～',
  '操縦',
  '曲技飛行',
  'Contactは包線の学校。最初の契約はエリア方位。地上参照がprimary。20 radialsでCenter RadialとPie-in-the-Sky。Area 16 / Att 6。',
  611,
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
