-- CP series ep.1: CP-1-1_AreaAndPurpose
-- Stock: is_published false until articlePublishSchedule.
-- Do not re-run after W34 go-live; title patches go in later UPDATE files.

INSERT INTO learning_contents (id, title, category, sub_category, description, order_index, parent_id, content_type, is_published, updated_at)
VALUES (
  'CP-1-1_AreaAndPurpose',
  '【操縦】第1話：形を描く前に、エリアにいろ ～CPの目的とエリア維持～',
  '操縦',
  '曲技飛行',
  'CPは包線の学校。最初の契約はエリア維持。地上参照がprimary。20 radialsでCenter RadialとPie-in-the-Sky。T-38のCSW/CDIは読み替え。Area 16 / Att 6。',
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
