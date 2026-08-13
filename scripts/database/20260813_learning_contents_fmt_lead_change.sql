-- USAF Formation Flying series ep.5: FMT-1-5_LeadChange
-- Stock: is_published false until articlePublishSchedule (not W34).

INSERT INTO learning_contents (id, title, category, sub_category, description, order_index, parent_id, content_type, is_published, updated_at)
VALUES (
  'FMT-1-5_LeadChange',
  '【操縦】第5話：リードは渡すもん ～Lead Change～',
  '操縦',
  '編隊飛行',
  'リードは奪わず渡す。close からは out & forward → 3/9 到達後に ack。Area 60 の U は unsafe または未完了。',
  605,
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
