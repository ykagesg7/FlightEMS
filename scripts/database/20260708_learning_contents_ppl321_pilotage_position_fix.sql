-- PPL Subject 3 Phase 2 第1本 — PPL-3-2-1 公開（ブロックB開始）
-- Apply: Supabase MCP execute_sql (project_id = fstynltdfdetpyvbrswr)

INSERT INTO learning_contents (id, title, category, sub_category, description, order_index, parent_id, content_type, is_published, updated_at)
VALUES (
  'PPL-3-2-1_PilotageAndPositionFix',
  '【空中航法】地文航法と機位確認：景色と地図を重ねる「センサーフュージョン」の極意',
  'PPL',
  '空中航法',
  '目で見た景色を地図に重ねろ！ VFRの基本「地文航法（パイロッタージュ）」の罠と、複数の計器と脳内計算を組み合わせるプロの「センサーフュージョン（結合）」をハックする。',
  306,
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
