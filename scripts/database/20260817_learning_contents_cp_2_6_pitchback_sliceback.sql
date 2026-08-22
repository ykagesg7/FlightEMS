-- CP series Season 2 ep.6: CP-2-6_PitchbackSliceback
-- Stock: is_published false until articlePublishSchedule.

INSERT INTO learning_contents (id, title, category, sub_category, description, order_index, parent_id, content_type, is_published, updated_at)
VALUES (
  'CP-2-6_PitchbackSliceback',
  '【操縦】第9話：向きを返せ ～PitchbackとSliceback～',
  '操縦',
  '曲技飛行',
  '向きを返す。Pitchbackはバンク<90°、Slicebackは>90°。Immelmann/Split-Sではない。mechanicsに集中。数字はT-38枠。',
  619,
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
