-- Mentality 1.3.7_OodaKeepTheLoopMoving（publishedAt 2026-12-06）。
-- 本番未適用。Approve 後に適用（この PR では DB を書かない）。
-- Drip: is_published false until article-publish-sync（publishDate JST）。
-- Sibling: 1.3.6_BlessingAndAdmonition（order_index 6）。本行は 7。

BEGIN;

INSERT INTO learning_contents (
  id, title, category, sub_category, description,
  order_index, parent_id, content_type, is_published, updated_at
)
VALUES
(
  '1.3.7_OodaKeepTheLoopMoving',
  '【思考法】判断を止めんな ～OODAを空と仕事で回す～',
  'メンタリティー',
  '思考法',
  '空でも地上の仕事でも、最も恐ろしいのは判断が止まることじゃ。ジョン・ボイドが生んだOODAループの真髄は、観察から行動までを絶え間なく回し続けることにある。要となるOrientの重みと、思考停止から抜け出す型を菅原道真が説く。',
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

COMMIT;
