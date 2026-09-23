-- Stock rewritten ７つの習慣 その７ for W42 Fri drip (2026-10-16).
-- Does not touch the remaining withdrawn blog IDs. No DELETE.
-- is_published false until article-publish-sync cron on publishDate.

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
  '1.1.7_SharpenTheSaw',
  '【７つの習慣】その７、道真公と学ぶ「刃を研ぐ」',
  'メンタリティー',
  '基礎メンタリティー',
  '菅原道真が語る第７の習慣。切れぬ刃で伐るな——身体・知性・情緒・精神を少しずつ研ぐ。',
  7,
  NULL,
  'mdx',
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
