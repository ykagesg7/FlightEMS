-- Register PPL-1-1-2, PPL-1-1-7, PPL-1-1-10 in learning_contents
-- Run via Supabase Dashboard SQL Editor or SupabaseMCP execute_sql
-- 2026-03: aero-1-2 強化, aero-2-2 リライト, aero-2-3 新規

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
) VALUES
  (
    'PPL-1-1-2_AirspeedBasics',
    '【航空工学】速度計は「嘘」をつく？ IAS（指示）とTAS（真）の決定的な違い',
    'PPL',
    '航空工学',
    '久留米・大砲ラーメンで学ぶ速度の真実。こってり「昔ラーメン」と定番「ラーメン」のスープの濃さが分かれば、IASとTASの謎は解ける！',
    2,
    NULL,
    'text',
    true,
    NOW()
  ),
  (
    'PPL-1-1-7_VnDiagram',
    '【航空工学】翼が折れる境界線：V-n線図と大分・団子汁のコシ',
    'PPL',
    '航空工学',
    '飛行機は無敵じゃない。G（荷重）をかけすぎれば翼は根元から折れる。その物理的限界を示す「V-n線図」の読み解き方と、守護速度「Va」の正体を暴くばい。',
    7,
    NULL,
    'text',
    true,
    NOW()
  ),
  (
    'PPL-1-1-10_TakeoffLandingPerformance',
    '【航空工学】滑走路は足りるか？ 阿蘇の熱気と「加速停止」の決断',
    'PPL',
    '航空工学',
    '滑走路を離れるまでが離陸じゃない。離陸中止の判断基準「加速停止距離」と、なぜ「50ft」が運命の数字なのか。阿蘇の赤身肉のごとく凝縮した知識を叩き込むばい。',
    10,
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
