-- PPL 基礎モードで主科目「航空法規」「空中航法」「航空通信」を選べるようにする（＋航空気象の拡張）
-- 前提: applicable_exams 列・CHECK 済み（20260324_add_unified_cpl_applicable_exams.sql）
-- 方針: 各 main_subject で学科基礎寄りの sub_subject のみ。CPL 専門寄り（詳細航法計画・高度レーダー等）は含めない
-- 再実行: 既に PPL 付きの行は更新しない（冪等）

BEGIN;

-- 航空法規: 総則・登録・従事者・運航の一般規定・耐空（空港細目・無線施設設置基準などは除外）
UPDATE unified_cpl_questions u
SET applicable_exams = ARRAY['PPL', 'CPL']::text[],
  updated_at = COALESCE(u.updated_at, now())
WHERE u.verification_status = 'verified'
  AND u.main_subject = '航空法規'
  AND NOT (u.applicable_exams @> ARRAY['PPL']::text[])
  AND (
    u.sub_subject LIKE '総則%'
    OR u.sub_subject = '航空法及び航空法施行規則'
    OR u.sub_subject LIKE '登録%'
    OR u.sub_subject LIKE '航空従事者%'
    OR u.sub_subject LIKE '航空機の運航/%'
    OR u.sub_subject LIKE '航空機の安全性/%'
  )
  AND u.sub_subject NOT LIKE '航空路、空港等及び航空保安施設%';

-- 空中航法: 一般知識・人間要因・環境（航法計画書の作成・燃料計算等の CPL 重視分は除外）
UPDATE unified_cpl_questions u
SET applicable_exams = ARRAY['PPL', 'CPL']::text[],
  updated_at = COALESCE(u.updated_at, now())
WHERE u.verification_status = 'verified'
  AND u.main_subject = '空中航法'
  AND NOT (u.applicable_exams @> ARRAY['PPL']::text[])
  AND (
    u.sub_subject = '人間の能力及び限界に関する一般知識'
    OR u.sub_subject LIKE '航法に関する一般知識%'
    OR u.sub_subject LIKE '環境と人間の能力%'
    OR u.sub_subject LIKE '基礎的な航空心理学%'
    OR u.sub_subject LIKE '空間識%'
    OR u.sub_subject IN (
      '航法の実施/針路の決定',
      '航法の実施/機位の確認'
    )
  );

-- 航空通信: 概論・管制一般・飛行計画・救難・飛行場の基礎（レーダー・TCA 詳細は除外）
UPDATE unified_cpl_questions u
SET applicable_exams = ARRAY['PPL', 'CPL']::text[],
  updated_at = COALESCE(u.updated_at, now())
WHERE u.verification_status = 'verified'
  AND u.main_subject = '航空通信'
  AND NOT (u.applicable_exams @> ARRAY['PPL']::text[])
  AND (
    u.sub_subject = '航空交通業務'
    OR u.sub_subject LIKE '航空交通業務概論%'
    OR u.sub_subject LIKE '管制業務一般%'
    OR u.sub_subject LIKE '飛行計画%'
    OR u.sub_subject LIKE '捜索救難業務%'
    OR u.sub_subject LIKE '航空情報業務%'
    OR u.sub_subject LIKE '飛行場管制%'
    OR u.sub_subject = '緊急機に対する管制'
  )
  AND u.sub_subject NOT LIKE 'レーダー管制%';

-- 航空気象: 大気・風・通報・天気図・前線・気団・高気圧低気圧・雲霧・障害・熱帯（既存 PPL 行はスキップ）
UPDATE unified_cpl_questions u
SET applicable_exams = ARRAY['PPL', 'CPL']::text[],
  updated_at = COALESCE(u.updated_at, now())
WHERE u.verification_status = 'verified'
  AND u.main_subject = '航空気象'
  AND NOT (u.applicable_exams @> ARRAY['PPL']::text[])
  AND (
    u.sub_subject LIKE '大気の基礎%'
    OR u.sub_subject = '大気の物理'
    OR u.sub_subject LIKE '風/%'
    OR u.sub_subject LIKE '気象通報%'
    OR u.sub_subject LIKE '天気図/実況%'
    OR u.sub_subject LIKE '前線%'
    OR u.sub_subject LIKE '気団%'
    OR u.sub_subject LIKE '高気圧と低気圧%'
    OR u.sub_subject LIKE '雲と霧%'
    OR u.sub_subject LIKE '飛行に影響する気象障害%'
    OR u.sub_subject LIKE '熱帯気象%'
  );

COMMIT;
