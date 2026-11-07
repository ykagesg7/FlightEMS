-- Instrument-Flying IF-1-3_IMC_Scan（publishedAt 2026-11-07）。
-- 本番未適用。Approve 後に適用（この PR では DB を書かない）。
-- syncPublish:false のため cron は is_published を触らない → is_published=true で投入。
-- Sibling: 20261127_learning_contents_if_1_2_partial_panel.sql（order_index 702）

BEGIN;

INSERT INTO learning_contents (
  id, title, category, sub_category, description,
  order_index, parent_id, content_type, is_published, updated_at
)
VALUES
(
  'IF-1-3_IMC_Scan',
  '【操縦】計器飛行第3話：雲中・IMC での scan 維持',
  '操縦',
  '計器飛行',
  '水曜に学んだ気象通報の数値を抜け、いざ本番の雲中（IMC）へ。外景の基準がすべて消えたとき、頼れるのは計器板の走査（scan）のリズムだけたい。タービュランスの揺れや油断で視線が止まると、錯覚が忍び寄りうる。第1話で授けた走査の型を途切れさせず回し続ける実技の勘所を叩き込むばい。',
  703,
  NULL,
  'text',
  true,
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
