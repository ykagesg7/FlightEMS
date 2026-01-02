-- ===============================
-- PPL/CPLランク統合実装
-- user_rank_type Enumの更新
-- ===============================

-- 注意: PostgreSQLではenum型から値を直接削除できないため、
-- 新しいenum型を作成し、既存のデータを移行する必要があります

-- 1. 新しいenum型を作成（主要なPPL中間ランクを含む）
CREATE TYPE user_rank_type_new AS ENUM (
  'fan',
  -- PPL中間ランク（Phaseレベル - 主要なもののみ）
  'ppl-aero-basics-phase1',      -- PPL空力基礎初級
  'ppl-aero-basics-phase2',      -- PPL空力基礎中級
  'ppl-aero-basics-master',      -- PPL空力基礎マスター
  'ppl-aero-performance-phase1', -- PPL性能基礎初級
  'ppl-aero-performance-phase2', -- PPL性能基礎中級
  'ppl-aero-performance-master', -- PPL性能基礎マスター
  -- PPL中間ランク（Sectionレベル）
  'ppl-aerodynamics-master',    -- PPL航空力学マスター
  -- PPL中間ランク（Categoryレベル）
  'ppl-engineering-master',      -- PPL航空工学マスター
  -- PPL最終ランク
  'ppl',                          -- 自家用操縦士
  -- 上位ランク
  'wingman',
  'cpl',                          -- 事業用操縦士（将来実装）
  'ace',
  'master',
  'legend'
);

-- 2. 既存のprofiles.rankを新しい型に変換
-- 削除されるランク（spectator, trainee, student, apprentice, pilot）は'fan'に変換
ALTER TABLE profiles
  ALTER COLUMN rank TYPE user_rank_type_new
  USING CASE
    WHEN rank::text = 'fan' THEN 'fan'::user_rank_type_new
    WHEN rank::text IN ('spectator', 'trainee', 'student', 'apprentice', 'pilot') THEN 'fan'::user_rank_type_new
    WHEN rank::text = 'wingman' THEN 'wingman'::user_rank_type_new
    WHEN rank::text = 'ace' THEN 'ace'::user_rank_type_new
    WHEN rank::text = 'master' THEN 'master'::user_rank_type_new
    WHEN rank::text = 'legend' THEN 'legend'::user_rank_type_new
    ELSE 'fan'::user_rank_type_new
  END;

-- 3. 他のテーブルでuser_rank_typeを使用しているカラムも更新
-- missionsテーブル
ALTER TABLE missions
  ALTER COLUMN min_rank_required TYPE user_rank_type_new
  USING CASE
    WHEN min_rank_required::text = 'fan' THEN 'fan'::user_rank_type_new
    WHEN min_rank_required::text IN ('spectator', 'trainee', 'student', 'apprentice', 'pilot') THEN 'fan'::user_rank_type_new
    WHEN min_rank_required::text = 'wingman' THEN 'wingman'::user_rank_type_new
    WHEN min_rank_required::text = 'ace' THEN 'ace'::user_rank_type_new
    WHEN min_rank_required::text = 'master' THEN 'master'::user_rank_type_new
    WHEN min_rank_required::text = 'legend' THEN 'legend'::user_rank_type_new
    ELSE 'fan'::user_rank_type_new
  END;

-- rank_requirementsテーブル（存在する場合）
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'rank_requirements') THEN
    ALTER TABLE rank_requirements
      ALTER COLUMN rank TYPE user_rank_type_new
      USING CASE
        WHEN rank::text = 'fan' THEN 'fan'::user_rank_type_new
        WHEN rank::text IN ('spectator', 'trainee', 'student', 'apprentice', 'pilot') THEN 'fan'::user_rank_type_new
        WHEN rank::text = 'wingman' THEN 'wingman'::user_rank_type_new
        WHEN rank::text = 'ace' THEN 'ace'::user_rank_type_new
        WHEN rank::text = 'master' THEN 'master'::user_rank_type_new
        WHEN rank::text = 'legend' THEN 'legend'::user_rank_type_new
        ELSE 'fan'::user_rank_type_new
      END;
  END IF;
END $$;

-- 4. 古い型を削除し、新しい型に名前を変更
DROP TYPE user_rank_type;
ALTER TYPE user_rank_type_new RENAME TO user_rank_type;

