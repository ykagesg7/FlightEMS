-- Stock rewritten ７つの習慣 その６ for W41 Fri drip (2026-10-09).
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
  '1.1.6_Synergize',
  '【７つの習慣】その６、道真公と学ぶ「シナジーを創り出す」',
  'メンタリティー',
  '基礎メンタリティー',
  '菅原道真が語る第６の習慣。違いを力に変え、1＋1を超える編隊の作り方。',
  6,
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
