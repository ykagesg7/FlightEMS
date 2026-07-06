-- W28 2026-07-06: PPL Subject 3 Phase 1 第1本 — PPL-3-1-1 公開
-- Apply: Supabase MCP execute_sql (project_id = fstynltdfdetpyvbrswr)

INSERT INTO learning_contents (id, title, category, sub_category, description, order_index, parent_id, content_type, is_published, updated_at)
VALUES (
  'PPL-3-1-1_EarthCoordinatesAndTime',
  '【空中航法】地球・座標・時間：プロッターを捨てる「緯度1分＝1海里」のハック術',
  'PPL',
  '空中航法',
  'プラスチックの定規（プロッター）を捨てろ！ 地図の端に刻まれた「緯度1分＝1海里（NM）」の魔法と、時差ボケを防ぐ世界共通時（UTC）の真実をハックする。',
  301,
  NULL,
  'text',
  true,
  NOW()
)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  sub_category = EXCLUDED.sub_category,
  description = EXCLUDED.description,
  order_index = EXCLUDED.order_index,
  is_published = EXCLUDED.is_published,
  updated_at = EXCLUDED.updated_at;
