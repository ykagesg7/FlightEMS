-- PPL Subject 4 Phase 1 第5本 — PPL-4-2-3 公開
-- Apply: Supabase MCP execute_sql (project_id = fstynltdfdetpyvbrswr)

INSERT INTO learning_contents (id, title, category, sub_category, description, order_index, parent_id, content_type, is_published, updated_at)
VALUES (
  'PPL-4-2-3_AerodromeControlBasics',
  '【航空通信】飛行場管制の基礎：タワー・滑走・離着陸',
  'PPL',
  '航空通信',
  'タワー管制の Taxi・Takeoff・Landing クリアランス。復唱の型を飛行場実務シーンに適用。滑走路誤進入を防ぐ目視確認の極意ばい！',
  405,
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
