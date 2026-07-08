-- PPL Subject 3 Phase 1 第5本 — PPL-3-1-5 公開（ブロックA完結）
-- Apply: Supabase MCP execute_sql (project_id = fstynltdfdetpyvbrswr)

INSERT INTO learning_contents (id, title, category, sub_category, description, order_index, parent_id, content_type, is_published, updated_at)
VALUES (
  'PPL-3-1-5_FlightPlanningBasics',
  '【空中航法】飛行計画の基礎：数字で「着けるか」を確認する、高解像度のフライトマネジメント',
  'PPL',
  '空中航法',
  'フライトプランは「書類仕事」じゃない。想定外をゼロにするための「高解像度な設計図」たい。時間・燃料・代替空港を一本のストーリーにまとめ、空で淡々と生き残る極意。',
  305,
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
