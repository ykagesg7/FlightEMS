-- Republish rewritten ７つの習慣 その２ only.
-- Does not touch the remaining withdrawn blog IDs. No DELETE.

INSERT INTO learning_contents (
  id,
  title,
  category,
  sub_category,
  description,
  order_index,
  parent_id,
  content_type,
  is_published,
  updated_at
)
VALUES (
  '1.1.2_EndWithFuture',
  '【７つの習慣】その２、道真公と学ぶ「終わりを思い描く」',
  'メンタリティー',
  '基礎メンタリティー',
  '終わりの絵を先に持つ。道真公と学ぶ『７つの習慣』第２の習慣「終わりを思い描くことから始める」。',
  2,
  NULL,
  'mdx',
  true,
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
