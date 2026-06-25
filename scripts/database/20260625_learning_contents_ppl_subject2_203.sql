-- PPL Master Subject 2（航空気象）Phase 1 第3本: PPL-2-1-3
-- 適用: Supabase MCP execute_sql（project_id = fstynltdfdetpyvbrswr）または SQL Editor

INSERT INTO learning_contents (
  id,
  title,
  category,
  sub_category,
  description,
  order_index,
  parent_id,
  content_type,
  is_published,
  updated_at
) VALUES (
  'PPL-2-1-3_PressureAltimeterSettings',
  '【航空気象】大気圧と高度計誤差：「切り替え忘れ」の恐怖と命の1,000フィート',
  'PPL',
  '航空気象',
  '1,000フィート離れているはずが、目の前に大接近！高度計の目盛りを合わせ損ねる「切り替え忘れ（QNH/QNE）」の恐怖と、気圧・気温が高度計につかせるウソを見破る。',
  203,
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
  content_type = EXCLUDED.content_type,
  is_published = EXCLUDED.is_published,
  updated_at = EXCLUDED.updated_at;
