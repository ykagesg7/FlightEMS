-- ===============================
-- Whisky Papa Rank Expansion - Enum型更新
-- 注意: このスクリプトは既存のuser_rank_type enumに新しい値を追加します
-- PostgreSQLでは、トランザクション内でenum型に値を追加できないため、
-- このスクリプトは個別に実行する必要があります
-- ===============================

-- PostgreSQL 9.1以降では、ALTER TYPE ... ADD VALUEがサポートされていますが、
-- トランザクション内では実行できません（例外: PostgreSQL 12以降ではCOMMIT内で実行可能）
-- 安全のため、各値を個別に追加します

-- 既存の値を保持しつつ、新しいランクを追加
DO $$
BEGIN
  -- fanランクの追加
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum
    WHERE enumlabel = 'fan'
    AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'user_rank_type')
  ) THEN
    ALTER TYPE user_rank_type ADD VALUE IF NOT EXISTS 'fan' BEFORE 'spectator';
  END IF;

  -- studentランクの追加
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum
    WHERE enumlabel = 'student'
    AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'user_rank_type')
  ) THEN
    ALTER TYPE user_rank_type ADD VALUE IF NOT EXISTS 'student' AFTER 'trainee';
  END IF;

  -- apprenticeランクの追加
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum
    WHERE enumlabel = 'apprentice'
    AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'user_rank_type')
  ) THEN
    ALTER TYPE user_rank_type ADD VALUE IF NOT EXISTS 'apprentice' AFTER 'student';
  END IF;

  -- pilotランクの追加
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum
    WHERE enumlabel = 'pilot'
    AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'user_rank_type')
  ) THEN
    ALTER TYPE user_rank_type ADD VALUE IF NOT EXISTS 'pilot' AFTER 'apprentice';
  END IF;

  -- aceランクの追加
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum
    WHERE enumlabel = 'ace'
    AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'user_rank_type')
  ) THEN
    ALTER TYPE user_rank_type ADD VALUE IF NOT EXISTS 'ace' AFTER 'wingman';
  END IF;

  -- masterランクの追加
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum
    WHERE enumlabel = 'master'
    AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'user_rank_type')
  ) THEN
    ALTER TYPE user_rank_type ADD VALUE IF NOT EXISTS 'master' AFTER 'ace';
  END IF;

  -- legendランクの追加
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum
    WHERE enumlabel = 'legend'
    AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'user_rank_type')
  ) THEN
    ALTER TYPE user_rank_type ADD VALUE IF NOT EXISTS 'legend' AFTER 'master';
  END IF;
END $$;

-- 注意: PostgreSQLのバージョンによっては、IF NOT EXISTSがサポートされていない場合があります
-- その場合は、エラーを無視するか、手動で各値を追加してください

