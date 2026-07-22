-- PPL Subject 4 Phase 1 第4本 — PPL-4-2-2 公開
-- Apply: Supabase MCP execute_sql (project_id = fstynltdfdetpyvbrswr)

INSERT INTO learning_contents (id, title, category, sub_category, description, order_index, parent_id, content_type, is_published, updated_at)
VALUES (
  'PPL-4-2-2_ClearanceReadbackBasics',
  '【航空通信】クリアランスと復唱：必ず読み返す項目',
  'PPL',
  '航空通信',
  'クリアランスの種類と復唱（Readback）が必須の項目。滑走路誤進入・高度取り違えの試験トラップ対策ばい！',
  404,
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
