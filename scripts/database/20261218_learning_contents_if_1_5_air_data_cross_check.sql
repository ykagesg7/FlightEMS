-- Instrument-Flying IF-1-5_AirData_CrossCheck（publishedAt 2026-12-18）。
-- 本番未適用。Approve 後に適用（この PR では DB を書かない）。
-- syncPublish:false のため cron は is_published を触らない → is_published=true で投入。
-- Sibling: IF-1-4 用 SQL は別 PR（order_index 704 想定）。本行は 705。

BEGIN;

INSERT INTO learning_contents (
  id, title, category, sub_category, description,
  order_index, parent_id, content_type, is_published, updated_at
)
VALUES
(
  'IF-1-5_AirData_CrossCheck',
  '【操縦】計器飛行第5話：高度・速度・昇降のクロスチェック',
  '操縦',
  '計器飛行',
  '水曜に学んだピトー静圧系の仕組みを携え、金曜の実技は3つの計器を読み合わせる「クロスチェック」の本番へ。高度計・速度計・昇降計は、姿勢と推力が生み出した「結果」に過ぎん。針の動きを慌てて追いかけるな、姿勢指示器（AI）に戻って根本を正せ。3本の針が矛盾なくひとつの物語を語っているかを見抜き、狂いを最小限で封じ込めるプロの技を叩き込むばい。',
  705,
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
