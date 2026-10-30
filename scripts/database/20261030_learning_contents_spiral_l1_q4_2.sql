-- Spiral LMS L1: L1-Q4-2_AviatorMindset（即公開）。
-- 本番未適用。Approve 後に SQL Editor / MCP で適用すること（この PR では DB を書かない）。
-- syncPublish:false のため cron は is_published を触らない → 行は is_published=true で投入する。
-- Sibling: 20261014_learning_contents_spiral_l1_q3_q4.sql

BEGIN;

INSERT INTO learning_contents (
  id, title, category, sub_category, description,
  order_index, parent_id, content_type, is_published, updated_at
)
VALUES
(
  'L1-Q4-2_AviatorMindset',
  'アビエーターの心構え',
  'PPL',
  '螺旋LMS',
  '仕組みを理解した先に問われるのは、空を飛ぶ者の中身たい。操縦の技だけに溺れず、準備、決断、振り返りを己の責務として引き受けるアビエーターの心根を説くばい。',
  1042,
  NULL,
  'text',
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

INSERT INTO public.spiral_content_slug_map (content_slug, learning_content_id)
VALUES
  ('l1-q4-2-aviator-mindset', 'L1-Q4-2_AviatorMindset')
ON CONFLICT (content_slug) DO UPDATE SET
  learning_content_id = EXCLUDED.learning_content_id;

INSERT INTO public.node_contents (node_id, content_slug, content_type, is_required, sort_order)
VALUES
  ('L1-Q4-2', 'l1-q4-2-aviator-mindset', 'lesson', true, 1)
ON CONFLICT (node_id, content_slug) DO UPDATE SET
  content_type = EXCLUDED.content_type,
  is_required = EXCLUDED.is_required,
  sort_order = EXCLUDED.sort_order;

COMMIT;
