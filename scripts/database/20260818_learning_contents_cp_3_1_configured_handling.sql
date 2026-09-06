-- CP series Season 3 ep.1: CP-3-1_ConfiguredHandling
-- Stock: is_published false until articlePublishSchedule.

INSERT INTO learning_contents (id, title, category, sub_category, description, order_index, parent_id, content_type, is_published, updated_at)
VALUES (
  'CP-3-1_ConfiguredHandling',
  '【操縦】第10話：脚を出したら遅らせろ ～Configured handling～',
  '操縦',
  '曲技飛行',
  '着陸形態になったらcleanの感覚で踏むな。configuredのラダーは1–2秒遅れる。slow flightは滑らかに。フラップ60%は加速、フルアップは失速接近。学習記事であり実機手順ではない。',
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
