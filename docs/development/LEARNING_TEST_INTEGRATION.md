# Learning-Test連携システム実装ガイド

## 概要

FlightAcademyTsxの学習記事とCPL試験問題を連携させ、個別化された学習体験を提供するシステムです。

## Phase 1: 基本連携機能 ✅ **完了**

### 実装済み機能

#### 1. データベース設計 ✅
- **learning_test_mapping**: 学習記事とテスト問題のマッピング
- **user_weak_areas**: ユーザー弱点領域分析
- **learning_recommendations**: 学習推奨データ
- **learning_sessions**: 学習セッション記録
- **learning_progress_integration**: 統合進捗ビュー

#### 2. データベース関数 ✅
- `get_related_cpl_questions()`: 関連CPL問題取得
- `get_recommended_articles_for_weak_areas()`: 弱点記事推奨
- `update_user_weak_areas()`: 弱点領域更新
- `calculate_user_overall_accuracy()`: 総合正答率計算
- `generate_learning_recommendations()`: 学習推奨生成
- `measure_learning_effectiveness()`: 学習効果測定
- `record_learning_session()`: 学習セッション記録

#### 3. フロントエンドコンポーネント ✅
- **EnhancedRelatedTestButton.tsx**: 学習記事末尾の関連テストボタン
- **EnhancedReviewContentLink.tsx**: テスト結果後の復習記事推奨
- **AdaptiveLearningDashboard.tsx**: 学習進捗とテスト成績の統合ダッシュボード

#### 4. セキュリティ設定 ✅
- Row Level Security (RLS) ポリシー適用
- ユーザー別データアクセス制御
- 管理者権限による編集制御

### 技術仕様

#### データベーススキーマ

```sql
-- 学習テストマッピング
CREATE TABLE learning_test_mapping (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    learning_content_id VARCHAR NOT NULL,
    content_title VARCHAR,
    content_category VARCHAR,
    test_question_ids TEXT[],
    unified_cpl_question_ids UUID[],
    topic_category VARCHAR,
    subject_area VARCHAR,
    relationship_type VARCHAR DEFAULT 'related',
    weight_score NUMERIC DEFAULT 0.5,
    difficulty_level INTEGER DEFAULT 3,
    estimated_study_time INTEGER DEFAULT 30,
    mapping_source VARCHAR DEFAULT 'manual',
    confidence_score NUMERIC DEFAULT 0.7,
    verification_status VARCHAR DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    created_by UUID
);

-- ユーザー弱点分析
CREATE TABLE user_weak_areas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    subject_category VARCHAR NOT NULL,
    sub_category VARCHAR,
    accuracy_rate NUMERIC NOT NULL,
    attempt_count INTEGER DEFAULT 1,
    improvement_trend VARCHAR DEFAULT 'stable',
    priority_level INTEGER DEFAULT 5,
    first_identified TIMESTAMPTZ DEFAULT now(),
    last_updated TIMESTAMPTZ DEFAULT now()
);

-- 学習推奨
CREATE TABLE learning_recommendations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    recommended_content_id VARCHAR NOT NULL,
    content_type VARCHAR DEFAULT 'article',
    recommendation_reason TEXT,
    priority_score NUMERIC DEFAULT 5.0,
    estimated_impact NUMERIC,
    estimated_time INTEGER,
    difficulty_match NUMERIC,
    algorithm_version VARCHAR DEFAULT 'v1.0',
    generated_at TIMESTAMPTZ DEFAULT now(),
    is_active BOOLEAN DEFAULT true,
    viewed_at TIMESTAMPTZ,
    acted_upon_at TIMESTAMPTZ
);

-- 学習セッション
CREATE TABLE learning_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    session_type VARCHAR NOT NULL CHECK (session_type IN ('reading', 'testing', 'review', 'practice')),
    content_id VARCHAR NOT NULL,
    content_type VARCHAR DEFAULT 'article' CHECK (content_type IN ('article', 'test', 'video', 'exercise')),
    session_duration INTEGER,
    completion_rate NUMERIC,
    session_metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT now(),
    ended_at TIMESTAMPTZ
);
```

#### 統合ビュー

```sql
CREATE VIEW learning_progress_integration AS
SELECT 
    lp.user_id,
    lp.content_id,
    lc.title,
    lc.category,
    lp.completed,
    lp.progress_percentage,
    lp.last_read_at,
    COALESCE(test_stats.total_questions, 0) as related_test_questions,
    COALESCE(test_stats.attempted_questions, 0) as attempted_questions,
    COALESCE(test_stats.correct_answers, 0) as correct_answers,
    COALESCE(ROUND(test_stats.accuracy_rate, 2), 0) as test_accuracy_rate,
    CASE 
        WHEN test_stats.accuracy_rate < 0.6 THEN 'weak'
        WHEN test_stats.accuracy_rate < 0.8 THEN 'average'
        ELSE 'strong'
    END as performance_level,
    CASE 
        WHEN lp.completed = false AND test_stats.accuracy_rate < 0.6 THEN 'review_content_first'
        WHEN lp.completed = true AND test_stats.accuracy_rate < 0.7 THEN 'practice_more'
        WHEN lp.completed = true AND test_stats.accuracy_rate >= 0.8 THEN 'advance_to_next'
        ELSE 'continue_learning'
    END as recommended_action
FROM learning_progress lp
JOIN learning_contents lc ON lp.content_id = lc.id
LEFT JOIN learning_test_mapping ltm ON ltm.learning_content_id = lp.content_id
LEFT JOIN (
    -- テスト統計サブクエリ
) test_stats ON test_stats.learning_content_id = lp.content_id;
```

### 使用方法

#### 1. 関連テストボタンの実装

```tsx
import EnhancedRelatedTestButton from '../components/learning/EnhancedRelatedTestButton';

// 学習記事の末尾に配置
<EnhancedRelatedTestButton 
  contentId="3.1_AviationLegal1"
  contentTitle="技能証明制度の完全理解"
/>
```

#### 2. 復習記事推奨の実装

```tsx
import EnhancedReviewContentLink from '../components/learning/EnhancedReviewContentLink';

// テスト結果画面に配置
<EnhancedReviewContentLink 
  testResults={testResults}
  userWeakAreas={weakAreas}
/>
```

#### 3. 学習ダッシュボードの実装

```tsx
import AdaptiveLearningDashboard from '../components/learning/AdaptiveLearningDashboard';

// 専用ページまたはタブとして配置
<AdaptiveLearningDashboard />
```

### API使用例

#### 関連問題の取得

```javascript
const { data: relatedQuestions } = await supabase
  .rpc('get_related_cpl_questions', {
    p_content_id: 'content_id',
    p_limit: 10
  });
```

#### 弱点分析の更新

```javascript
const { data } = await supabase
  .rpc('update_user_weak_areas', {
    p_user_id: user.id,
    p_test_results: testResultsArray
  });
```

#### 学習推奨の生成

```javascript
const { data: recommendations } = await supabase
  .rpc('generate_learning_recommendations', {
    p_user_id: user.id
  });
```

### パフォーマンス最適化

#### インデックス設定
```sql
-- 学習テストマッピング用インデックス
CREATE INDEX idx_learning_test_mapping_content_id ON learning_test_mapping(learning_content_id);
CREATE INDEX idx_learning_test_mapping_topic_category ON learning_test_mapping(topic_category);

-- ユーザー弱点分析用インデックス
CREATE INDEX idx_user_weak_areas_user_id ON user_weak_areas(user_id);
CREATE INDEX idx_user_weak_areas_priority ON user_weak_areas(user_id, priority_level DESC);

-- 学習推奨用インデックス
CREATE INDEX idx_learning_recommendations_user_active ON learning_recommendations(user_id, is_active);

-- 学習セッション用インデックス
CREATE INDEX idx_learning_sessions_user_time ON learning_sessions(user_id, created_at DESC);
```

## Phase 2: 試験逆算学習システム 🔄 **計画中**

### 予定機能
- 目標試験日からの逆算学習計画
- 科目別学習進捗管理
- 適応的難易度調整
- 学習時間最適化

## Phase 3: 適応的学習パス 🔄 **計画中**

### 予定機能
- 個人の学習スタイル分析
- 動的学習経路生成
- リアルタイム難易度調整
- 学習効率最適化

## Phase 4: 進捗統合管理 🔄 **計画中**

### 予定機能
- 総合学習ダッシュボード
- 予測分析機能
- 学習効果可視化
- パフォーマンス予測

## トラブルシューティング

### よくある問題

1. **関連問題が表示されない**
   - learning_test_mappingテーブルにデータが登録されているか確認
   - unified_cpl_question_idsが正しく設定されているか確認

2. **弱点分析が更新されない**
   - user_test_resultsテーブルにテスト結果が記録されているか確認
   - update_user_weak_areas関数が正常に動作しているか確認

3. **学習推奨が生成されない**
   - user_weak_areasテーブルにデータが存在するか確認
   - learning_test_mappingとの関連付けが正しいか確認

### デバッグ用SQL

```sql
-- 学習進捗統合ビューの確認
SELECT * FROM learning_progress_integration LIMIT 5;

-- 弱点分析データの確認
SELECT * FROM user_weak_areas WHERE user_id = 'user_uuid';

-- 学習推奨の確認
SELECT * FROM generate_learning_recommendations('user_uuid');
```

## 今後の拡張計画

1. **機械学習統合**: 学習パターン分析の高度化
2. **ソーシャル機能**: 学習グループ機能
3. **モバイル対応**: PWA化
4. **多言語対応**: 国際化対応
5. **API拡張**: 外部システム連携

## 貢献ガイド

新機能の追加や改善提案は、以下の手順で行ってください：

1. Issueの作成
2. 機能仕様の詳細化
3. 実装計画の策定
4. プルリクエストの作成
5. レビューとテスト

---

**最終更新**: 2024年12月21日  
**バージョン**: Phase 1 完了版  
**ステータス**: Phase 1 実装完了、Phase 2 計画中 