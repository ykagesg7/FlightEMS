-- ===============================
-- PPL Rank System Functions
-- ランクチェック・付与ロジック
-- ===============================

-- ランクチェック関数：記事完了時にランクをチェック・付与
CREATE OR REPLACE FUNCTION check_and_award_ppl_ranks(p_user_id UUID, p_content_id TEXT)
RETURNS TABLE(rank_code TEXT, rank_name TEXT) AS $$
DECLARE
  v_rank_def RECORD;
  v_completed_count INTEGER;
  v_required_count INTEGER;
  v_section_ranks_completed INTEGER;
  v_category_ranks_completed INTEGER;
  v_subject_ranks_completed INTEGER;
BEGIN
  -- Phase 1-3ランクのチェック（required_content_idsに基づく）
  FOR v_rank_def IN
    SELECT * FROM ppl_rank_definitions
    WHERE p_content_id = ANY(required_content_ids)
    AND rank_level = 1
    AND array_length(required_content_ids, 1) > 0
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

-- トリガー：記事完了時に自動的にランクをチェック
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

-- ユーザーの取得済みランクを取得する関数
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

