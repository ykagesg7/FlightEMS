-- Spiral LMS L1: L1-Q3-1 / L1-Q4-1 seed（ドリップ）。
-- 本番未適用。Approve 後に SQL Editor / MCP で適用（この PR では DB を書かない）。
-- publish-sync 対象（schedule に syncPublish 未指定）→ is_published=false で投入。
-- 公開日到達後に cron が true にする。nodes は別ファイルの UPDATE。
-- Sibling: 20261014_learning_contents_spiral_l1_q3_q4.sql / 20261030_learning_contents_spiral_l1_q4_2.sql

BEGIN;

INSERT INTO learning_contents (
  id, title, category, sub_category, description,
  order_index, parent_id, content_type, is_published, updated_at
)
VALUES
(
  'L1-Q3-1_PathToPilot',
  'パイロットへの道',
  'PPL',
  '螺旋LMS',
  'パイロットになるための代表的なルートと、技能証明（ライセンス）の仕組みについて道真公が解説するばい。',
  1031,
  NULL,
  'text',
  false,
  NOW()
),
(
  'L1-Q4-1_MichizaneBriefing',
  '道真公のブリーフィング',
  'PPL',
  '螺旋LMS',
  'FlightAcademyの学習の仕組み（4象限と螺旋）と、空を飛ぶための心構えを伝授するばい。',
  1041,
  NULL,
  'text',
  false,
  NOW()
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.spiral_content_slug_map (content_slug, learning_content_id)
VALUES
  ('l1-q3-1-path-to-pilot', 'L1-Q3-1_PathToPilot'),
  ('l1-q4-1-michizane-briefing', 'L1-Q4-1_MichizaneBriefing')
ON CONFLICT (content_slug) DO NOTHING;

INSERT INTO public.node_contents (node_id, content_slug, content_type, is_required, sort_order)
VALUES
  ('L1-Q3-1', 'l1-q3-1-path-to-pilot', 'lesson', true, 1),
  ('L1-Q4-1', 'l1-q4-1-michizane-briefing', 'lesson', true, 1)
ON CONFLICT (node_id, content_slug) DO NOTHING;

COMMIT;
