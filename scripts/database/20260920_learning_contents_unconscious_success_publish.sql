-- Republish rewritten ７つの習慣 その１ only.
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
  '1.1.1_UnconsciousSuccess',
  '【７つの習慣】その１、道真公と学ぶ「主体性」',
  'メンタリティー',
  '基礎メンタリティー',
  '関心の輪と影響の輪を、太宰府の左遷で噛み砕く。道真公と学ぶ『７つの習慣』第１の習慣「主体的である」。',
  1,
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
