-- Stock rewritten ７つの習慣 その５ for W40 Fri drip (2026-10-02).
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
  '1.1.5_SeekFirstToUnderstand',
  '【７つの習慣】その５、道真公と学ぶ「まず理解に徹し、そして理解される」',
  'メンタリティー',
  '基礎メンタリティー',
  '傾聴と確認から伝達へ。道真公と学ぶ『７つの習慣』第５の習慣「まず理解に徹し、そして理解される」。',
  5,
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
