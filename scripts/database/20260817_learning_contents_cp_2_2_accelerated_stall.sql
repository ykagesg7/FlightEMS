-- CP series Season 2 ep.2: CP-2-2_AcceleratedStall
-- Stock: is_published false until articlePublishSchedule.

INSERT INTO learning_contents (id, title, category, sub_category, description, order_index, parent_id, content_type, is_published, updated_at)
VALUES (
  'CP-2-2_AcceleratedStall',
  '【操縦】第5話：もっと引くな ～加速失速～',
  '操縦',
  '曲技飛行',
  '加速失速は低速域と高速域の2本。低速域はベース速度から、高速域は Mach .75〜.80（指示対気速度でおよそ350kt）から。低速域は G を徐々に加えて AOA トーン、高速域は4〜5Gでバフェットを見たら引きを緩めて戻す。オーバーGはするな。学習記事であり実機手順ではない。',
  615,
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
