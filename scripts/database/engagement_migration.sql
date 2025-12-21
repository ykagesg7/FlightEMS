-- ===============================
-- Whisky Papa Engagement Migration
-- Phase 3: Shop & Gallery
-- ===============================

-- 1. productsテーブルの作成
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  price INTEGER NOT NULL,
  image_url TEXT,
  required_rank user_rank_type DEFAULT 'spectator',
  external_link TEXT, -- 外部カート(BASE等)へのリンク
  is_available BOOLEAN DEFAULT true,
  stock_count INTEGER, -- NULLの場合は在庫無制限
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. fan_photosテーブルの作成
CREATE TABLE IF NOT EXISTS fan_photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  caption TEXT,
  is_approved BOOLEAN DEFAULT false, -- 管理者承認フラグ
  is_featured BOOLEAN DEFAULT false, -- 「今週のベスト」フラグ
  approved_by UUID REFERENCES profiles(id), -- 承認した管理者のID
  approved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. インデックスの作成
CREATE INDEX IF NOT EXISTS idx_products_required_rank ON products(required_rank);
CREATE INDEX IF NOT EXISTS idx_products_is_available ON products(is_available);
CREATE INDEX IF NOT EXISTS idx_fan_photos_user_id ON fan_photos(user_id);
CREATE INDEX IF NOT EXISTS idx_fan_photos_is_approved ON fan_photos(is_approved);
CREATE INDEX IF NOT EXISTS idx_fan_photos_is_featured ON fan_photos(is_featured);
CREATE INDEX IF NOT EXISTS idx_fan_photos_created_at ON fan_photos(created_at DESC);

-- 4. 初期商品データの挿入（サンプル）
INSERT INTO products (name, description, price, required_rank, external_link, is_available) VALUES
-- Spectator向け商品
('Whisky Papa ステッカー', '公式ステッカー（小）', 500, 'spectator', 'https://example.com/product/sticker', true),
('Whisky Papa ロゴTシャツ', '公式ロゴTシャツ', 3000, 'spectator', 'https://example.com/product/tshirt', true),

-- Trainee向け商品
('Whisky Papa パッチ', '公式パッチ（中）', 1500, 'trainee', 'https://example.com/product/patch', true),
('Whisky Papa キャップ', '公式キャップ', 4000, 'trainee', 'https://example.com/product/cap', true),

-- Wingman向け商品
('Whisky Papa 限定ワッペン', 'Wingman限定ワッペン', 2500, 'wingman', 'https://example.com/product/wingman-patch', true),
('Whisky Papa フライトジャケット', '限定フライトジャケット', 15000, 'wingman', 'https://example.com/product/jacket', true)

ON CONFLICT DO NOTHING;

-- 5. Storage Bucket作成のためのSQL（Supabase Dashboardで手動実行が必要な場合の参考）
-- 注意: Storage BucketはSupabase DashboardまたはSupabaseMCPで作成する必要があります
-- 以下のSQLは参考用です

-- Storage Bucket: fan-photos
-- 設定:
--   - Public: true (公開読み取り)
--   - File size limit: 5MB
--   - Allowed MIME types: image/jpeg, image/png, image/webp, image/gif

-- 6. RLS (Row Level Security) ポリシーの設定

-- productsテーブルのRLS
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- 全ユーザーが閲覧可能
CREATE POLICY "products_select_all" ON products
  FOR SELECT
  USING (true);

-- fan_photosテーブルのRLS
ALTER TABLE fan_photos ENABLE ROW LEVEL SECURITY;

-- 承認済み写真は全ユーザーが閲覧可能
CREATE POLICY "fan_photos_select_approved" ON fan_photos
  FOR SELECT
  USING (is_approved = true);

-- ユーザーは自分の写真を閲覧可能
CREATE POLICY "fan_photos_select_own" ON fan_photos
  FOR SELECT
  USING (auth.uid() = user_id);

-- ユーザーは自分の写真を投稿可能
CREATE POLICY "fan_photos_insert_own" ON fan_photos
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- 管理者は全ての写真を閲覧・更新可能
CREATE POLICY "fan_photos_admin_all" ON fan_photos
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND roll = 'admin'
    )
  );

-- 7. 完了メッセージ
DO $$
BEGIN
  RAISE NOTICE '=== Whisky Papa Engagement Migration 完了 ===';
  RAISE NOTICE '作成されたテーブル: products, fan_photos';
  RAISE NOTICE 'Storage Bucket作成が必要: fan-photos';
END $$;

