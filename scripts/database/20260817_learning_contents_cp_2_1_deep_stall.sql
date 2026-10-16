-- CP series Season 2 ep.1: CP-2-1_DeepStall
-- Stock: is_published false until articlePublishSchedule.

INSERT INTO learning_contents (id, title, category, sub_category, description, order_index, parent_id, content_type, is_published, updated_at)
VALUES (
  'CP-2-1_DeepStall',
  '【操縦】第4話：ポストストール ～Post-stall～',
  '操縦',
  '曲技飛行',
  'ポストストールは、失速の先で機体がどう暴れ、どう戻るかを身体で知る演習。20,000ft以上・クリーン形態で入り、戻すのはハンズオフ。回復操作は150kt（1.3Vs）から。学習記事であり実機手順ではない。',
  614,
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
