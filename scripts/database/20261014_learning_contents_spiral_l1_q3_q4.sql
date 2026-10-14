-- Spiral LMS L1: L1-Q3-1 / L1-Q4-1 lesson rows (drip — is_published false until publish PR).
-- Apply before 20261012_spiral_lms_content_slug_map.sql (FK on learning_content_id).

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
