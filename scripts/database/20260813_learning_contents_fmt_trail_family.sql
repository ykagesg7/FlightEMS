-- USAF Formation Flying series ep.7: FMT-1-7_TrailFamily
-- Stock: is_published false until articlePublishSchedule (not W34).

INSERT INTO learning_contents (id, title, category, sub_category, description, order_index, parent_id, content_type, is_published, updated_at)
VALUES (
  'FMT-1-7_TrailFamily',
  '【操縦】第7話：後ろなら全部同じはブルシット ～Trail族～',
  '操縦',
  '編隊飛行',
  '後ろでも箱が違う。Close Trailはjetwash直下・OTM禁止。ETは3/9前方またはslant 500 ft未満でKIO。Fluid formation≠FM。',
  607,
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
