-- ===============================
-- Whisky Papa Rank Expansion Migration
-- ランクシステム10段階化とエンゲージメント追跡
-- ===============================

-- 1. user_rank_type enumの拡張（新しいランクを追加）
-- 注意: PostgreSQLではenum型への値の追加は直接できないため、型を再作成する必要があります
-- 既存のデータを保持しながら型を拡張

-- 一時的な型を作成（新しいランクを含む）
DO $$
BEGIN
  -- 既存の型を確認し、新しいランクを追加
  -- 注意: PostgreSQLのenum型は直接変更できないため、マイグレーション時は慎重に行う必要があります
  -- 本番環境では、ダウンタイムを考慮した手順が必要な場合があります

  -- 既存のuser_rank_typeが存在する場合、新しい値を追加
  -- この処理は手動で実行する必要がある場合があります
  IF NOT EXISTS (
    SELECT 1 FROM pg_type WHERE typname = 'user_rank_type_expanded'
  ) THEN
    -- 一時的な拡張型を作成（実際のマイグレーションでは既存の型を更新）
    CREATE TYPE user_rank_type_expanded AS ENUM (
      'fan',
      'spectator',
      'trainee',
      'student',
      'apprentice',
      'pilot',
      'wingman',
      'ace',
      'master',
      'legend'
    );
  END IF;
END $$;

-- 2. streak_recordsテーブルの作成（連続学習日数追跡）
CREATE TABLE IF NOT EXISTS streak_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE UNIQUE,
  current_streak INTEGER DEFAULT 0,        -- 現在の連続日数
  longest_streak INTEGER DEFAULT 0,        -- 過去最長記録
  last_activity_date DATE,                 -- 最終活動日
  streak_freeze_count INTEGER DEFAULT 0,   -- ストリークフリーズ残り回数
  streak_multiplier DECIMAL(3,2) DEFAULT 1.0,   -- XPボーナス倍率（1.00-2.99）
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. user_achievementsテーブルの作成（マイルストーン報酬）
CREATE TABLE IF NOT EXISTS user_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  achievement_type TEXT NOT NULL,          -- 'first_article', 'streak_7', 'exam_pass', etc.
  achieved_at TIMESTAMPTZ DEFAULT now(),
  xp_bonus INTEGER DEFAULT 0,              -- 達成時のボーナスXP
  is_notified BOOLEAN DEFAULT false,       -- 通知済みフラグ
  metadata JSONB,                          -- 追加情報
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, achievement_type)
);

-- 4. purchase_historyテーブルの作成（購買履歴・エンゲージメント追跡）
CREATE TABLE IF NOT EXISTS purchase_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  purchase_type TEXT NOT NULL,             -- 'shop', 'gallery', 'premium', 'streak_freeze'
  item_id UUID,                            -- products.id または fan_photos.id
  item_name TEXT NOT NULL,
  amount INTEGER NOT NULL,                 -- 購入金額（円）
  xp_earned INTEGER DEFAULT 0,             -- 購買によるXP
  purchase_date TIMESTAMPTZ DEFAULT now(),
  metadata JSONB,                          -- 追加情報（商品カテゴリ、ギャラリーイベントIDなど）
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 5. rank_requirementsテーブルの作成（ランク条件管理）
CREATE TABLE IF NOT EXISTS rank_requirements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rank user_rank_type NOT NULL,
  requirement_type TEXT NOT NULL,          -- 条件タイプ
  requirement_value INTEGER NOT NULL,      -- 必要値
  requirement_config JSONB,                -- 詳細設定（試験IDリスト、商品カテゴリなど）
  is_required BOOLEAN DEFAULT true,        -- 必須/任意
  alternative_group TEXT,                  -- OR条件のグループ（同じグループはOR判定）
  priority INTEGER DEFAULT 0,
  display_name TEXT,                       -- 表示名
  description TEXT,                        -- 説明文
  icon TEXT,                               -- アイコン
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 6. インデックスの作成
CREATE INDEX IF NOT EXISTS idx_streak_records_user_id ON streak_records(user_id);
CREATE INDEX IF NOT EXISTS idx_streak_records_last_activity ON streak_records(last_activity_date);
CREATE INDEX IF NOT EXISTS idx_user_achievements_user_id ON user_achievements(user_id);
CREATE INDEX IF NOT EXISTS idx_user_achievements_type ON user_achievements(achievement_type);
CREATE INDEX IF NOT EXISTS idx_purchase_history_user_id ON purchase_history(user_id);
CREATE INDEX IF NOT EXISTS idx_purchase_history_type ON purchase_history(purchase_type);
CREATE INDEX IF NOT EXISTS idx_purchase_history_date ON purchase_history(purchase_date);
CREATE INDEX IF NOT EXISTS idx_rank_requirements_rank ON rank_requirements(rank);
CREATE INDEX IF NOT EXISTS idx_rank_requirements_type ON rank_requirements(requirement_type);
CREATE INDEX IF NOT EXISTS idx_rank_requirements_group ON rank_requirements(alternative_group) WHERE alternative_group IS NOT NULL;

-- 7. 既存ユーザー用のstreak_records初期化（既存ユーザーがいる場合）
-- このクエリは既存ユーザーに対して実行されますが、空のレコードは作成しません
-- 初回活動時にレコードが作成されるようにします

-- 8. 完了メッセージ
DO $$
BEGIN
  RAISE NOTICE '=== Rank Expansion Migration テーブル作成完了 ===';
  RAISE NOTICE '作成されたテーブル: streak_records, user_achievements, purchase_history, rank_requirements';
  RAISE NOTICE '注意: user_rank_type enumの拡張は手動で実行する必要があります';
  RAISE NOTICE 'ALTER TYPE user_rank_type ADD VALUE IF NOT EXISTS ''fan'';';
  RAISE NOTICE 'ALTER TYPE user_rank_type ADD VALUE IF NOT EXISTS ''student'';';
  RAISE NOTICE 'ALTER TYPE user_rank_type ADD VALUE IF NOT EXISTS ''apprentice'';';
  RAISE NOTICE 'ALTER TYPE user_rank_type ADD VALUE IF NOT EXISTS ''pilot'';';
  RAISE NOTICE 'ALTER TYPE user_rank_type ADD VALUE IF NOT EXISTS ''ace'';';
  RAISE NOTICE 'ALTER TYPE user_rank_type ADD VALUE IF NOT EXISTS ''master'';';
  RAISE NOTICE 'ALTER TYPE user_rank_type ADD VALUE IF NOT EXISTS ''legend'';';
END $$;

