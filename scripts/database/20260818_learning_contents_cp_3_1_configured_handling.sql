-- CP series Season 3 ep.1: CP-3-1_ConfiguredHandling
-- Stock: is_published false until articlePublishSchedule.

INSERT INTO learning_contents (id, title, category, sub_category, description, order_index, parent_id, content_type, is_published, updated_at)
VALUES (
  'CP-3-1_ConfiguredHandling',
  '【操縦】第10話：足を出したら遅れろ ～Configured handling～',
  '操縦',
  '曲技飛行',
  '形態が出たらcleanの感覚で踏むな。configuredのラダーは1–2秒遅れる。slow flightは滑らかに。60%は加速、フルアップは失速接近。数字はT-38枠。',
  620,
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
