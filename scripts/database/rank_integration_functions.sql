-- ===============================
-- PPL/CPLランク統合実装
-- ランク判定ロジックの統合
-- ===============================

-- PPLランクコードをuser_rank_typeにマッピングする関数
CREATE OR REPLACE FUNCTION map_ppl_rank_code_to_user_rank_type(p_rank_code TEXT)
RETURNS user_rank_type AS $$
BEGIN
  -- rank_codeに基づいてuser_rank_typeを返す
  RETURN CASE p_rank_code
    WHEN 'ppl-1-1-1-phase1' THEN 'ppl-aero-basics-phase1'::user_rank_type
    WHEN 'ppl-1-1-1-phase2' THEN 'ppl-aero-basics-phase2'::user_rank_type
    WHEN 'ppl-1-1-1-master' THEN 'ppl-aero-basics-master'::user_rank_type
    WHEN 'ppl-1-1-2-phase1' THEN 'ppl-aero-performance-phase1'::user_rank_type
    WHEN 'ppl-1-1-2-phase2' THEN 'ppl-aero-performance-phase2'::user_rank_type
    WHEN 'ppl-1-1-2-master' THEN 'ppl-aero-performance-master'::user_rank_type
    WHEN 'ppl-1-1-master' THEN 'ppl-aerodynamics-master'::user_rank_type
    WHEN 'ppl-1-master' THEN 'ppl-engineering-master'::user_rank_type
    WHEN 'ppl-master' THEN 'ppl'::user_rank_type
    ELSE 'fan'::user_rank_type
  END;
END;
$$ LANGUAGE plpgsql;

-- PPLランク取得時にprofiles.rankを更新する関数
CREATE OR REPLACE FUNCTION update_profile_rank_for_ppl(p_user_id UUID)
RETURNS void AS $$
DECLARE
  current_rank user_rank_type;
  new_rank user_rank_type;
  current_xp INTEGER;
  highest_ppl_rank_code TEXT;
  highest_ppl_rank_level INTEGER;
  has_ppl_master BOOLEAN;
  has_cpl_master BOOLEAN;
BEGIN
  -- 現在のXPとランクを取得
  SELECT xp_points, rank INTO current_xp, current_rank
  FROM profiles WHERE id = p_user_id;

  -- PPLマスターレベル（ppl-master）を取得しているかチェック
  SELECT EXISTS (
    SELECT 1 FROM user_ppl_ranks
    WHERE user_id = p_user_id
    AND rank_code = 'ppl-master'
  ) INTO has_ppl_master;

  -- CPLマスターレベル（将来実装）をチェック
  SELECT EXISTS (
    SELECT 1 FROM user_cpl_ranks
    WHERE user_id = p_user_id
    AND rank_code = 'cpl-master'
  ) INTO has_cpl_master;

  -- ランク判定ロジック（優先順位: CPL > PPL > PPL中間ランク > XPベース）
  IF has_cpl_master THEN
    new_rank := 'cpl'::user_rank_type;
  ELSIF has_ppl_master THEN
    new_rank := 'ppl'::user_rank_type;
  ELSE
    -- 取得済みのPPL中間ランクの中で最も高いランクを取得
    SELECT prd.rank_code, prd.rank_level
    INTO highest_ppl_rank_code, highest_ppl_rank_level
    FROM user_ppl_ranks upr
    JOIN ppl_rank_definitions prd ON upr.rank_code = prd.rank_code
    WHERE upr.user_id = p_user_id
    ORDER BY prd.rank_level DESC, prd.display_order DESC
    LIMIT 1;

    -- PPL中間ランクが取得されている場合
    IF highest_ppl_rank_code IS NOT NULL THEN
      -- rank_codeをuser_rank_typeにマッピング
      new_rank := map_ppl_rank_code_to_user_rank_type(highest_ppl_rank_code);
    ELSE
      -- XPベースのランク判定（更新されたXP要件）
      new_rank := CASE
        WHEN current_xp >= 2500 THEN 'legend'::user_rank_type
        WHEN current_xp >= 2000 THEN 'master'::user_rank_type
        WHEN current_xp >= 1500 THEN 'ace'::user_rank_type
        WHEN current_xp >= 1200 THEN 'wingman'::user_rank_type
        ELSE 'fan'::user_rank_type
      END;
    END IF;
  END IF;

  -- ランクが変更された場合のみ更新
  IF current_rank != new_rank THEN
    UPDATE profiles
    SET rank = new_rank
    WHERE id = p_user_id;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- PPLランク取得時に自動的にprofiles.rankを更新するトリガー
CREATE OR REPLACE FUNCTION trigger_update_profile_rank_on_ppl_rank()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM update_profile_rank_for_ppl(NEW.user_id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_profile_rank_on_ppl_rank_insert ON user_ppl_ranks;
CREATE TRIGGER trigger_update_profile_rank_on_ppl_rank_insert
  AFTER INSERT ON user_ppl_ranks
  FOR EACH ROW
  EXECUTE FUNCTION trigger_update_profile_rank_on_ppl_rank();

