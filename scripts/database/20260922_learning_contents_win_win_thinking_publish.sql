-- Republish rewritten ７つの習慣 その４ only.
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
  '1.1.4_WinWinThinking',
  '【７つの習慣】その４、道真公と学ぶ「Win-Winを考える」',
  'メンタリティー',
  '基礎メンタリティー',
  '勝ち負けではない第三の道と、無理な合意より合意しない第五の姿勢。道真公と学ぶ『７つの習慣』第４の習慣「Win-Winを考える」。',
  4,
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
