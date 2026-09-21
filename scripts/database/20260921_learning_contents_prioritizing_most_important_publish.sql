-- Republish rewritten ７つの習慣 その３ only.
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
  '1.1.3_PrioritizingMostImportant',
  '【７つの習慣】その３、道真公と学ぶ「最優先事項を優先する」',
  'メンタリティー',
  '基礎メンタリティー',
  '重要と緊急を見極める。道真公と学ぶ『７つの習慣』第３の習慣「最優先事項を優先する」。',
  3,
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
