-- USAF Contact / Transition series ep.3: CP-1-3_ControlsGPio
-- W34 Fri 2026-08-21. is_published false until cron.

INSERT INTO learning_contents (id, title, category, sub_category, description, order_index, parent_id, content_type, is_published, updated_at)
VALUES (
  'CP-1-3_ControlsGPio',
  '【操縦】第3話：効く面と壊れ方 ～操縦面 / PIO / G～',
  '操縦',
  '曲技飛行',
  '高AOAはラダー、低AOAはエルロン。PIOはfreeze。G-awarenessの420–450 KIAS / 4G・5GはT-38枠。Area 32。',
  613,
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
