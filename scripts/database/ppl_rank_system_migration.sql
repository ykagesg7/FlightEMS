-- ===============================
-- PPL Rank System Migration
-- Phase 1: PPL Syllabus階層構造に基づくランクシステム
-- ===============================

-- 1. PPLランク定義テーブル
CREATE TABLE IF NOT EXISTS ppl_rank_definitions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rank_code TEXT NOT NULL UNIQUE, -- 例: 'ppl-1-1-1-phase1', 'ppl-1-1-1-phase2', 'ppl-1-1-1-master'
  rank_name TEXT NOT NULL, -- 例: 'PPL空力基礎初級', 'PPL空力基礎中級', 'PPL空力基礎マスター'
  rank_level INTEGER NOT NULL, -- 1: Phase, 2: Section, 3: Category, 4: Subject, 5: PPL全体
  parent_rank_code TEXT REFERENCES ppl_rank_definitions(rank_code) ON DELETE CASCADE,
  subject_code TEXT, -- '1', '2', '3', '4', '5'
  category_code TEXT, -- '1-1', '1-2', '1-3' など
  section_code TEXT, -- '1-1-1', '1-1-2' など
  phase INTEGER CHECK (phase IN (1, 2, 3)), -- Phase 1, 2, 3
  required_content_ids TEXT[], -- このランク取得に必要な記事IDの配列
  description TEXT,
  icon TEXT, -- ランクアイコン（絵文字など）
  color TEXT, -- ランクの色コード
  display_order INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. ユーザーのPPLランクテーブル
CREATE TABLE IF NOT EXISTS user_ppl_ranks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  rank_code TEXT REFERENCES ppl_rank_definitions(rank_code) ON DELETE CASCADE NOT NULL,
  earned_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, rank_code)
);

-- 3. インデックスの作成
CREATE INDEX IF NOT EXISTS idx_ppl_rank_definitions_parent ON ppl_rank_definitions(parent_rank_code);
CREATE INDEX IF NOT EXISTS idx_ppl_rank_definitions_subject ON ppl_rank_definitions(subject_code);
CREATE INDEX IF NOT EXISTS idx_ppl_rank_definitions_category ON ppl_rank_definitions(category_code);
CREATE INDEX IF NOT EXISTS idx_ppl_rank_definitions_section ON ppl_rank_definitions(section_code);
CREATE INDEX IF NOT EXISTS idx_user_ppl_ranks_user_id ON user_ppl_ranks(user_id);
CREATE INDEX IF NOT EXISTS idx_user_ppl_ranks_rank_code ON user_ppl_ranks(rank_code);

-- 4. ランク定義データの挿入（Subject 1: 航空工学の例）
-- 階層構造に基づいて順次定義

-- ===============================
-- Subject 1: 航空工学
-- ===============================

-- 1-1. 航空力学 (Aerodynamics)
-- 1-1-1. 空力の基礎理論
INSERT INTO ppl_rank_definitions (rank_code, rank_name, rank_level, parent_rank_code, subject_code, category_code, section_code, phase, required_content_ids, description, icon, color, display_order) VALUES
-- Phase 1: 初級
('ppl-1-1-1-phase1', 'PPL空力基礎初級', 1, NULL, '1', '1-1', '1-1-1', 1,
 ARRAY['PPL-1-1-1_TemperatureBasics', 'PPL-1-1-2_AirspeedBasics', 'PPL-1-1-3_BernoulliPrinciple', 'PPL-1-1-4_DragBasics', 'PPL-1-1-5_AxesStability', 'PPL-1-1-6_StallSpin'],
 '空力の基礎理論 Phase 1を完了', '📚', '#87CEEB', 1),
-- Phase 2: 中級（将来実装）
('ppl-1-1-1-phase2', 'PPL空力基礎中級', 1, 'ppl-1-1-1-phase1', '1', '1-1', '1-1-1', 2,
 ARRAY[]::TEXT[],
 '空力の基礎理論 Phase 2を完了', '📖', '#9370DB', 2),
-- Phase 3: マスター（将来実装）
('ppl-1-1-1-master', 'PPL空力基礎マスター', 1, 'ppl-1-1-1-phase2', '1', '1-1', '1-1-1', 3,
 ARRAY[]::TEXT[],
 '空力の基礎理論 Phase 3を完了', '👑', '#FFD700', 3)
ON CONFLICT (rank_code) DO UPDATE SET
  rank_name = EXCLUDED.rank_name,
  required_content_ids = EXCLUDED.required_content_ids,
  description = EXCLUDED.description,
  updated_at = NOW();

-- 1-1-2. 性能と耐空性
INSERT INTO ppl_rank_definitions (rank_code, rank_name, rank_level, parent_rank_code, subject_code, category_code, section_code, phase, required_content_ids, description, icon, color, display_order) VALUES
('ppl-1-1-2-phase1', 'PPL性能基礎初級', 1, NULL, '1', '1-1', '1-1-2', 1,
 ARRAY[]::TEXT[],
 '性能と耐空性 Phase 1を完了', '📊', '#87CEEB', 4),
('ppl-1-1-2-phase2', 'PPL性能基礎中級', 1, 'ppl-1-1-2-phase1', '1', '1-1', '1-1-2', 2,
 ARRAY['PPL-1-1-7_VnDiagram'],
 '性能と耐空性 Phase 2を完了', '📈', '#9370DB', 5),
('ppl-1-1-2-master', 'PPL性能基礎マスター', 1, 'ppl-1-1-2-phase2', '1', '1-1', '1-1-2', 3,
 ARRAY[]::TEXT[],
 '性能と耐空性 Phase 3を完了', '🏆', '#FFD700', 6)
ON CONFLICT (rank_code) DO UPDATE SET
  rank_name = EXCLUDED.rank_name,
  required_content_ids = EXCLUDED.required_content_ids,
  description = EXCLUDED.description,
  updated_at = NOW();

-- 1-1. 航空力学マスター（全セクション完了）
INSERT INTO ppl_rank_definitions (rank_code, rank_name, rank_level, parent_rank_code, subject_code, category_code, section_code, phase, required_content_ids, description, icon, color, display_order) VALUES
('ppl-1-1-master', 'PPL航空力学マスター', 2, NULL, '1', '1-1', NULL, NULL,
 ARRAY[]::TEXT[], -- 子ランクの完了で判定
 '航空力学の全セクションを完了', '✈️', '#FF6347', 10)
ON CONFLICT (rank_code) DO UPDATE SET
  rank_name = EXCLUDED.rank_name,
  description = EXCLUDED.description,
  updated_at = NOW();

-- 1-2. 航空機の構造及び機能（将来実装）
-- 1-3. 重量と重心位置（将来実装）

-- Subject 1: 航空工学マスター（全カテゴリー完了）
INSERT INTO ppl_rank_definitions (rank_code, rank_name, rank_level, parent_rank_code, subject_code, category_code, section_code, phase, required_content_ids, description, icon, color, display_order) VALUES
('ppl-1-master', 'PPL航空工学マスター', 3, NULL, '1', NULL, NULL, NULL,
 ARRAY[]::TEXT[], -- 子ランクの完了で判定
 '航空工学の全カテゴリーを完了', '🛩️', '#FF1493', 100)
ON CONFLICT (rank_code) DO UPDATE SET
  rank_name = EXCLUDED.rank_name,
  description = EXCLUDED.description,
  updated_at = NOW();

-- ===============================
-- Subject 2-5: 将来実装用のプレースホルダー
-- ===============================

-- Subject 2: 航空気象マスター
INSERT INTO ppl_rank_definitions (rank_code, rank_name, rank_level, parent_rank_code, subject_code, category_code, section_code, phase, required_content_ids, description, icon, color, display_order) VALUES
('ppl-2-master', 'PPL航空気象マスター', 3, NULL, '2', NULL, NULL, NULL,
 ARRAY[]::TEXT[],
 '航空気象の全カテゴリーを完了', '🌩️', '#FF1493', 200)
ON CONFLICT (rank_code) DO UPDATE SET
  rank_name = EXCLUDED.rank_name,
  description = EXCLUDED.description,
  updated_at = NOW();

-- Subject 3: 空中航法マスター
INSERT INTO ppl_rank_definitions (rank_code, rank_name, rank_level, parent_rank_code, subject_code, category_code, section_code, phase, required_content_ids, description, icon, color, display_order) VALUES
('ppl-3-master', 'PPL空中航法マスター', 3, NULL, '3', NULL, NULL, NULL,
 ARRAY[]::TEXT[],
 '空中航法の全カテゴリーを完了', '🧭', '#FF1493', 300)
ON CONFLICT (rank_code) DO UPDATE SET
  rank_name = EXCLUDED.rank_name,
  description = EXCLUDED.description,
  updated_at = NOW();

-- Subject 4: 航空通信マスター
INSERT INTO ppl_rank_definitions (rank_code, rank_name, rank_level, parent_rank_code, subject_code, category_code, section_code, phase, required_content_ids, description, icon, color, display_order) VALUES
('ppl-4-master', 'PPL航空通信マスター', 3, NULL, '4', NULL, NULL, NULL,
 ARRAY[]::TEXT[],
 '航空通信の全カテゴリーを完了', '📡', '#FF1493', 400)
ON CONFLICT (rank_code) DO UPDATE SET
  rank_name = EXCLUDED.rank_name,
  description = EXCLUDED.description,
  updated_at = NOW();

-- Subject 5: 航空法規マスター
INSERT INTO ppl_rank_definitions (rank_code, rank_name, rank_level, parent_rank_code, subject_code, category_code, section_code, phase, required_content_ids, description, icon, color, display_order) VALUES
('ppl-5-master', 'PPL航空法規マスター', 3, NULL, '5', NULL, NULL, NULL,
 ARRAY[]::TEXT[],
 '航空法規の全カテゴリーを完了', '📜', '#FF1493', 500)
ON CONFLICT (rank_code) DO UPDATE SET
  rank_name = EXCLUDED.rank_name,
  description = EXCLUDED.description,
  updated_at = NOW();

-- PPL全体: 自家用操縦士（全科目完了）
INSERT INTO ppl_rank_definitions (rank_code, rank_name, rank_level, parent_rank_code, subject_code, category_code, section_code, phase, required_content_ids, description, icon, color, display_order) VALUES
('ppl-master', '自家用操縦士', 4, NULL, NULL, NULL, NULL, NULL,
 ARRAY[]::TEXT[], -- 全科目マスターランクの完了で判定
 'PPL全科目を完了', '🎖️', '#FF1493', 1000)
ON CONFLICT (rank_code) DO UPDATE SET
  rank_name = EXCLUDED.rank_name,
  description = EXCLUDED.description,
  updated_at = NOW();

-- 5. ランクチェック関数：記事完了時にランクをチェック・付与
CREATE OR REPLACE FUNCTION check_and_award_ppl_ranks(p_user_id UUID, p_content_id TEXT)
RETURNS TABLE(rank_code TEXT, rank_name TEXT) AS $$
DECLARE
  v_rank_def RECORD;
  v_completed_count INTEGER;
  v_required_count INTEGER;
  v_all_completed BOOLEAN;
  v_parent_rank RECORD;
  v_section_ranks_completed INTEGER;
  v_category_ranks_completed INTEGER;
  v_subject_ranks_completed INTEGER;
BEGIN
  -- Phase 1-3ランクのチェック（required_content_idsに基づく）
  FOR v_rank_def IN
    SELECT * FROM ppl_rank_definitions
    WHERE p_content_id = ANY(required_content_ids)
    AND rank_level = 1
    ORDER BY phase, display_order
  LOOP
    -- 必要な記事が全て完了しているかチェック
    SELECT COUNT(*) INTO v_completed_count
    FROM learning_progress
    WHERE user_id = p_user_id
      AND content_id = ANY(v_rank_def.required_content_ids)
      AND completed = true;

    SELECT array_length(v_rank_def.required_content_ids, 1) INTO v_required_count;

    -- 全て完了している場合、ランクを付与
    IF v_completed_count >= v_required_count AND v_required_count > 0 THEN
      -- 既に取得済みでないかチェック
      IF NOT EXISTS (
        SELECT 1 FROM user_ppl_ranks
        WHERE user_id = p_user_id AND rank_code = v_rank_def.rank_code
      ) THEN
        INSERT INTO user_ppl_ranks (user_id, rank_code)
        VALUES (p_user_id, v_rank_def.rank_code)
        ON CONFLICT (user_id, rank_code) DO NOTHING;

        RETURN QUERY SELECT v_rank_def.rank_code, v_rank_def.rank_name;
      END IF;
    END IF;
  END LOOP;

  -- セクションマスターレベルのチェック（子ランクの完了で判定）
  FOR v_rank_def IN
    SELECT * FROM ppl_rank_definitions
    WHERE rank_level = 2
    AND section_code IS NOT NULL
  LOOP
    -- このセクションの全Phaseランクが完了しているかチェック
    SELECT COUNT(*) INTO v_section_ranks_completed
    FROM user_ppl_ranks upr
    JOIN ppl_rank_definitions prd ON upr.rank_code = prd.rank_code
    WHERE upr.user_id = p_user_id
      AND prd.section_code = v_rank_def.section_code
      AND prd.rank_level = 1
      AND prd.phase IS NOT NULL;

    -- Phase 1, 2, 3の3つ全て完了している場合
    IF v_section_ranks_completed >= 3 THEN
      IF NOT EXISTS (
        SELECT 1 FROM user_ppl_ranks
        WHERE user_id = p_user_id AND rank_code = v_rank_def.rank_code
      ) THEN
        INSERT INTO user_ppl_ranks (user_id, rank_code)
        VALUES (p_user_id, v_rank_def.rank_code)
        ON CONFLICT (user_id, rank_code) DO NOTHING;

        RETURN QUERY SELECT v_rank_def.rank_code, v_rank_def.rank_name;
      END IF;
    END IF;
  END LOOP;

  -- カテゴリーマスターレベルのチェック（全セクション完了で判定）
  FOR v_rank_def IN
    SELECT * FROM ppl_rank_definitions
    WHERE rank_level = 2
    AND category_code IS NOT NULL
    AND section_code IS NULL
  LOOP
    -- このカテゴリーの全セクションマスターランクが完了しているかチェック
    SELECT COUNT(DISTINCT prd.section_code) INTO v_category_ranks_completed
    FROM user_ppl_ranks upr
    JOIN ppl_rank_definitions prd ON upr.rank_code = prd.rank_code
    WHERE upr.user_id = p_user_id
      AND prd.category_code = v_rank_def.category_code
      AND prd.rank_level = 2
      AND prd.section_code IS NOT NULL;

    -- 全セクション完了している場合（将来実装時に動的に判定）
    -- 現時点では、1-1-1と1-1-2の2セクションのみ
    IF v_rank_def.category_code = '1-1' AND v_category_ranks_completed >= 2 THEN
      IF NOT EXISTS (
        SELECT 1 FROM user_ppl_ranks
        WHERE user_id = p_user_id AND rank_code = v_rank_def.rank_code
      ) THEN
        INSERT INTO user_ppl_ranks (user_id, rank_code)
        VALUES (p_user_id, v_rank_def.rank_code)
        ON CONFLICT (user_id, rank_code) DO NOTHING;

        RETURN QUERY SELECT v_rank_def.rank_code, v_rank_def.rank_name;
      END IF;
    END IF;
  END LOOP;

  -- 科目マスターレベルのチェック（全カテゴリー完了で判定）
  FOR v_rank_def IN
    SELECT * FROM ppl_rank_definitions
    WHERE rank_level = 3
    AND subject_code IS NOT NULL
  LOOP
    -- この科目の全カテゴリーマスターランクが完了しているかチェック
    SELECT COUNT(DISTINCT prd.category_code) INTO v_category_ranks_completed
    FROM user_ppl_ranks upr
    JOIN ppl_rank_definitions prd ON upr.rank_code = prd.rank_code
    WHERE upr.user_id = p_user_id
      AND prd.subject_code = v_rank_def.subject_code
      AND prd.rank_level = 2
      AND prd.category_code IS NOT NULL
      AND prd.section_code IS NULL;

    -- 全カテゴリー完了している場合（将来実装時に動的に判定）
    -- 現時点では、1-1, 1-2, 1-3の3カテゴリー
    IF v_rank_def.subject_code = '1' AND v_category_ranks_completed >= 3 THEN
      IF NOT EXISTS (
        SELECT 1 FROM user_ppl_ranks
        WHERE user_id = p_user_id AND rank_code = v_rank_def.rank_code
      ) THEN
        INSERT INTO user_ppl_ranks (user_id, rank_code)
        VALUES (p_user_id, v_rank_def.rank_code)
        ON CONFLICT (user_id, rank_code) DO NOTHING;

        RETURN QUERY SELECT v_rank_def.rank_code, v_rank_def.rank_name;
      END IF;
    END IF;
  END LOOP;

  -- PPL全体マスター（全科目完了で判定）
  FOR v_rank_def IN
    SELECT * FROM ppl_rank_definitions
    WHERE rank_code = 'ppl-master'
  LOOP
    -- 全科目マスターランクが完了しているかチェック
    SELECT COUNT(*) INTO v_subject_ranks_completed
    FROM user_ppl_ranks upr
    JOIN ppl_rank_definitions prd ON upr.rank_code = prd.rank_code
    WHERE upr.user_id = p_user_id
      AND prd.rank_level = 3
      AND prd.subject_code IS NOT NULL;

    -- 全5科目完了している場合
    IF v_subject_ranks_completed >= 5 THEN
      IF NOT EXISTS (
        SELECT 1 FROM user_ppl_ranks
        WHERE user_id = p_user_id AND rank_code = v_rank_def.rank_code
      ) THEN
        INSERT INTO user_ppl_ranks (user_id, rank_code)
        VALUES (p_user_id, v_rank_def.rank_code)
        ON CONFLICT (user_id, rank_code) DO NOTHING;

        RETURN QUERY SELECT v_rank_def.rank_code, v_rank_def.rank_name;
      END IF;
    END IF;
  END LOOP;

  RETURN;
END;
$$ LANGUAGE plpgsql;

-- 6. トリガー：記事完了時に自動的にランクをチェック
CREATE OR REPLACE FUNCTION trigger_check_ppl_ranks()
RETURNS TRIGGER AS $$
BEGIN
  -- 記事が完了した場合のみランクをチェック
  IF NEW.completed = true AND (OLD.completed IS NULL OR OLD.completed = false) THEN
    PERFORM check_and_award_ppl_ranks(NEW.user_id, NEW.content_id);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_check_ppl_ranks_on_progress ON learning_progress;
CREATE TRIGGER trigger_check_ppl_ranks_on_progress
  AFTER INSERT OR UPDATE OF completed ON learning_progress
  FOR EACH ROW
  WHEN (NEW.completed = true)
  EXECUTE FUNCTION trigger_check_ppl_ranks();

-- 7. ユーザーの取得済みランクを取得する関数
CREATE OR REPLACE FUNCTION get_user_ppl_ranks(p_user_id UUID)
RETURNS TABLE(
  rank_code TEXT,
  rank_name TEXT,
  rank_level INTEGER,
  subject_code TEXT,
  category_code TEXT,
  section_code TEXT,
  phase INTEGER,
  icon TEXT,
  color TEXT,
  earned_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    prd.rank_code,
    prd.rank_name,
    prd.rank_level,
    prd.subject_code,
    prd.category_code,
    prd.section_code,
    prd.phase,
    prd.icon,
    prd.color,
    upr.earned_at
  FROM user_ppl_ranks upr
  JOIN ppl_rank_definitions prd ON upr.rank_code = prd.rank_code
  WHERE upr.user_id = p_user_id
  ORDER BY prd.display_order, upr.earned_at;
END;
$$ LANGUAGE plpgsql;

