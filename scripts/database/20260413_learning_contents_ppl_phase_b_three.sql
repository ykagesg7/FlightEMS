-- Post-Phase-B: PPL 追加 3 本を learning_contents に冪等登録（MDX meta と一致）
-- 適用: Supabase SQL Editor または MCP execute_sql（project_id = FlightAcademy）

INSERT INTO learning_contents (
  id, title, category, sub_category, description, order_index, parent_id, content_type, is_published, updated_at
) VALUES
  (
    'PPL-1-1-11_ControlSurfaces',
    '【航空工学】三舵と操縦性：エルロン・エレベータ・ラダーを一本の線で',
    'PPL',
    '航空工学',
    '主翼後縁のエルロン、水平尾翼のエレベータ、垂直尾翼のラダー。試験で問われる「どの舵が何軸をまわすか」と、トリムが何のためにあるかを整理する。',
    16,
    NULL,
    'text',
    true,
    NOW()
  ),
  (
    'PPL-1-2-8_FuelSystemVaporLock',
    '【航空工学】燃料系とベーパー・ロック：夏のデッキでエンジンが黙る理由',
    'PPL',
    '航空工学',
    '燃料は「液体で送りたいのに、管路のどこかで蒸発してしまう」—それがベーパー・ロックの正体。試験で問われる発生条件と対策の方向性を整理する。',
    17,
    NULL,
    'text',
    true,
    NOW()
  ),
  (
    'PPL-1-2-9_TScanInstrumentScan',
    '【航空工学】T スキャンと計器監視：パイロットの「視線の型」を作る',
    'PPL',
    '航空工学',
    '姿勢・針路・高度・対気速度を周期的に拾う「T の字」の視線移動。学科では名称と目的、実技では迷いない順序が武器になる。',
    18,
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
