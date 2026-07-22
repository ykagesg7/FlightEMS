-- PPL Subject 4 Phase 1 第3本 — PPL-4-2-1 公開
-- Apply: Supabase MCP execute_sql (project_id = fstynltdfdetpyvbrswr)

INSERT INTO learning_contents (id, title, category, sub_category, description, order_index, parent_id, content_type, is_published, updated_at)
VALUES (
  'PPL-4-2-1_RadioPhraseologyBasics',
  '【航空通信】無線フレーズの基礎：アルファベット・数字・標準用語',
  'PPL',
  '航空通信',
  'ICAO フォネティックアルファベット、数字の読み方、標準用語（Roger, Wilco 等）。航空無線の基礎となる絶対の「型」を、折尾名物かしわめしの様式美に例えて徹底解説ばい！',
  403,
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
