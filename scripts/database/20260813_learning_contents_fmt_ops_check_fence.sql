-- USAF Formation Flying series ep.4: FMT-1-4_OpsCheckFence
-- Stock: is_published false until articlePublishSchedule (not W34).

INSERT INTO learning_contents (id, title, category, sub_category, description, order_index, parent_id, content_type, is_published, updated_at)
VALUES (
  'FMT-1-4_OpsCheckFence',
  '【操縦】第4話：下を向く順番 ～Ops checkとFENCE～',
  '操縦',
  '編隊飛行',
  '居場所のあとで初めて下を向く。Ops checkはfuelを含む定期確認、FENCEは空域IN/OUT。コックピットタスクは優先順位の4番目。',
  604,
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
