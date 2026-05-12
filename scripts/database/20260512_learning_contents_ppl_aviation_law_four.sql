-- PPL Master Subject 5（航空法規） Phase 前半 4 本を learning_contents に冪等登録（MDX meta と一致）
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
    'PPL-5-1-1_AviationLawDefinitions',
    '【航空法規】航空法の読み型と基本用語：「知ってる」を「できる」に変える空のモノサシ',
    'PPL',
    '航空法規',
    '条文の丸暗記は空では役に立たない。法のレイヤー（階層）を知り、一次情報（e-Gov）を自ら引き、現場の判断基準として使い倒すための「法規の読み型」をハックする。',
    501,
    NULL,
    'text',
    true,
    NOW()
  ),
  (
    'PPL-5-1-2_ChicagoConventionOverview',
    '【航空法規】シカゴ条約の全体像（入門）：Annexと国内法令の「長崎ちゃんぽん」',
    'PPL',
    '航空法規',
    '日本の航空法の上には、世界を束ねる「親玉」がいる。シカゴ条約とAnnex（附属書）の役割を、丸暗記ではなく「空の共通OS」として俯瞰（ハック）する。',
    502,
    NULL,
    'text',
    true,
    NOW()
  ),
  (
    'PPL-5-2-1_AircraftNationalityAndRegistration',
    '【航空法規】航空機の国籍と登録：スクランブルの血眼と「空の戸籍」のハック術',
    'PPL',
    '航空法規',
    '飛行機のマークは飾りじゃない。戦闘機パイロットが血眼で探す「国籍」の重みと、「登録（戸籍）」と「耐空証明（車検）」の混同という学科試験最大の罠を暴く。',
    503,
    NULL,
    'text',
    true,
    NOW()
  ),
  (
    'PPL-5-2-2_AirworthinessAndMaintenanceOverview',
    '【航空法規】耐空性と運航責任の線引き：整備士との「命のダブルチェック」',
    'PPL',
    '航空法規',
    '「整備がOKしたから飛べる」は三流の思考。耐空証明（車検）の書類と、パイロットが自ら行う適航状態の最終チェック。空の安全を守る「相互補完」の極意をハックする。',
    504,
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
