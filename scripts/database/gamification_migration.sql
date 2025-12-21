-- ===============================
-- Whisky Papa Gamification Migration
-- Phase 2: Wingman Program
-- ===============================

-- 1. User Rank Enum型の作成
CREATE TYPE IF NOT EXISTS user_rank_type AS ENUM ('spectator', 'trainee', 'wingman');

-- 2. profilesテーブルの拡張
-- rank と xp_points カラムを追加
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS rank user_rank_type DEFAULT 'spectator',
ADD COLUMN IF NOT EXISTS xp_points INTEGER DEFAULT 0;

-- 3. missionsテーブルの作成
CREATE TABLE IF NOT EXISTS missions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  required_action TEXT NOT NULL, -- 'quiz_pass', 'plan_create', 'photo_post', 'article_read', etc.
  xp_reward INTEGER DEFAULT 100,
  min_rank_required user_rank_type DEFAULT 'spectator',
  mission_type TEXT DEFAULT 'one_time', -- 'one_time', 'daily', 'weekly'
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 4. user_missionsテーブルの作成
CREATE TABLE IF NOT EXISTS user_missions (
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  mission_id UUID REFERENCES missions(id) ON DELETE CASCADE,
  completed_at TIMESTAMPTZ DEFAULT now(),
  xp_earned INTEGER DEFAULT 0,
  PRIMARY KEY (user_id, mission_id)
);

-- 5. インデックスの作成
CREATE INDEX IF NOT EXISTS idx_user_missions_user_id ON user_missions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_missions_mission_id ON user_missions(mission_id);
CREATE INDEX IF NOT EXISTS idx_missions_required_action ON missions(required_action);
CREATE INDEX IF NOT EXISTS idx_missions_mission_type ON missions(mission_type);
CREATE INDEX IF NOT EXISTS idx_profiles_rank ON profiles(rank);

-- 6. 初期ミッションデータの挿入
INSERT INTO missions (title, description, required_action, xp_reward, min_rank_required, mission_type) VALUES
-- 初級ミッション (Spectator)
('初めてのクイズ', 'CPLクイズを1回完了する', 'quiz_pass', 50, 'spectator', 'one_time'),
('初めてのプラン', 'フライトプランを1つ作成する', 'plan_create', 50, 'spectator', 'one_time'),
('記事を読む', '記事を1つ読む', 'article_read', 25, 'spectator', 'one_time'),
('デイリーチャレンジ', '毎日クイズに挑戦する', 'quiz_pass', 10, 'spectator', 'daily'),

-- 中級ミッション (Trainee)
('クイズマスター', 'CPLクイズで80%以上の正答率を達成する', 'quiz_pass', 100, 'trainee', 'one_time'),
('プランニングエキスパート', 'フライトプランを5つ作成する', 'plan_create', 150, 'trainee', 'one_time'),
('学習継続', '7日連続で学習する', 'article_read', 200, 'trainee', 'weekly'),

-- 上級ミッション (Wingman)
('パーフェクトスコア', 'CPLクイズで100%の正答率を達成する', 'quiz_pass', 300, 'wingman', 'one_time'),
('マスタープランナー', 'フライトプランを10つ作成する', 'plan_create', 250, 'wingman', 'one_time'),
('知識の探求者', '記事を50個読む', 'article_read', 500, 'wingman', 'one_time')

ON CONFLICT DO NOTHING;

-- 7. ランクアップ判定用の関数
CREATE OR REPLACE FUNCTION check_rank_up()
RETURNS TRIGGER AS $$
DECLARE
  current_xp INTEGER;
  new_rank user_rank_type;
BEGIN
  -- 現在のXPを取得
  current_xp := NEW.xp_points;

  -- XPに基づいてランクを決定
  IF current_xp >= 1000 THEN
    new_rank := 'wingman';
  ELSIF current_xp >= 300 THEN
    new_rank := 'trainee';
  ELSE
    new_rank := 'spectator';
  END IF;

  -- ランクが変更された場合のみ更新
  IF NEW.rank != new_rank THEN
    NEW.rank := new_rank;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 8. ランクアップ判定トリガー
DROP TRIGGER IF EXISTS trigger_check_rank_up ON profiles;
CREATE TRIGGER trigger_check_rank_up
  BEFORE UPDATE OF xp_points ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION check_rank_up();

-- 9. ミッション達成時のXP加算関数
CREATE OR REPLACE FUNCTION complete_mission(
  p_user_id UUID,
  p_mission_id UUID
)
RETURNS JSON AS $$
DECLARE
  mission_record RECORD;
  xp_earned INTEGER;
  new_xp INTEGER;
  result JSON;
BEGIN
  -- ミッション情報を取得
  SELECT * INTO mission_record
  FROM missions
  WHERE id = p_mission_id AND is_active = true;

  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'error', 'Mission not found or inactive');
  END IF;

  -- 既に達成済みかチェック（one_timeミッションの場合）
  IF mission_record.mission_type = 'one_time' THEN
    IF EXISTS (
      SELECT 1 FROM user_missions
      WHERE user_id = p_user_id AND mission_id = p_mission_id
    ) THEN
      RETURN json_build_object('success', false, 'error', 'Mission already completed');
    END IF;
  END IF;

  -- ユーザーの現在のランクをチェック
  IF EXISTS (
    SELECT 1 FROM profiles
    WHERE id = p_user_id AND rank < mission_record.min_rank_required
  ) THEN
    RETURN json_build_object('success', false, 'error', 'Insufficient rank');
  END IF;

  -- XPを加算
  xp_earned := mission_record.xp_reward;
  UPDATE profiles
  SET xp_points = xp_points + xp_earned
  WHERE id = p_user_id
  RETURNING xp_points INTO new_xp;

  -- ミッション達成記録を追加
  INSERT INTO user_missions (user_id, mission_id, xp_earned)
  VALUES (p_user_id, p_mission_id, xp_earned)
  ON CONFLICT (user_id, mission_id) DO UPDATE
  SET completed_at = now(), xp_earned = xp_earned;

  -- 結果を返す
  SELECT json_build_object(
    'success', true,
    'xp_earned', xp_earned,
    'new_xp', new_xp,
    'mission_title', mission_record.title
  ) INTO result;

  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- 10. 完了メッセージ
DO $$
BEGIN
  RAISE NOTICE '=== Whisky Papa Gamification Migration 完了 ===';
  RAISE NOTICE '作成されたテーブル: missions, user_missions';
  RAISE NOTICE '拡張されたテーブル: profiles (rank, xp_points)';
  RAISE NOTICE '作成された関数: check_rank_up(), complete_mission()';
  RAISE NOTICE '作成されたトリガー: trigger_check_rank_up';
END $$;

