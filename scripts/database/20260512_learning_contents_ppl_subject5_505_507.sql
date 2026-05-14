-- PPL Master Subject 5（航空法規） 技能証・身体検査・航空英語 3 本を learning_contents に冪等登録（MDX meta と一致）
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
) VALUES
  (
    'PPL-5-3-1_PilotCertificateBasics',
    '【航空法規】技能証明の基礎：過去の栄光（免許）と「最近の経験」のハック術',
    'PPL',
    '航空法規',
    '空の免許は車と違う。「タダなら友達を乗せてもいい」という勘違いが免停を招く。技能証明の範囲と、「最近の飛行経験」を自己管理するプロの鉄則をハックする。',
    505,
    NULL,
    'text',
    true,
    NOW()
  ),
  (
    'PPL-5-3-2_MedicalCertificateBasics',
    '【航空法規】航空身体検査の基礎：耳抜きの地獄と「空の健康診断」のハック術',
    'PPL',
    '航空法規',
    'ちょっとの風邪が、空の上では鼓膜を破る拷問に変わる。「免許」と「健康」の2つが揃って初めてコックピットに座れる、航空身体検査制度の基礎をハックする。',
    506,
    NULL,
    'text',
    true,
    NOW()
  ),
  (
    'PPL-5-3-3_AviationEnglishRequirements',
    '【航空法規】航空英語要件の読みどころ：ペラペラ神話と「サバイバル英語」',
    'PPL',
    '航空法規',
    '空の上でネイティブのペラペラ英語は逆に死を招く。ICAOが求める「レベル4（Operational Level）」の真実と、航空英語能力証明の制度的要件をハックする。',
    507,
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
