# クイズ分析・ランキング機能 後続フェーズ設計

## 概要

4択クイズ改善プラン Phase 1 完了後、ランキング・分析機能を段階的に導入するための設計ドキュメント。

## 実装済み（2026年3月）

- **学習時間記録**: `answeredAt` / `responseTimeMs` を `learning_sessions` に保存
- **今週の学習時間**: `learning_sessions` 直近7日の `duration_minutes` 合計
- **ヒートマップ**: 縦軸=曜日、横軸=週、`learning_sessions` を日別集計
- **弱点トピック**: `user_test_results.subject_category` ベースで正答率が低い順
- **科目別レーダーチャート**: `SubjectRadarChart` で `user_test_results` を集計
- **user_learning_profiles ブートストラップ**: 初回クイズ/記事学習時に自動で行を作成
- **復習導線**: 弱点トピックカードから `/test?mode=review` へリンク

## 後続フェーズ（未実装）

- `current_streak_days` の自動計算（現状はプロファイル行のブートストラップのみ）
- フラグの永続保存・Review 連携
- SRS 更新の強化
- ランキング・ライバル比較

## 現状のデータソース

| テーブル | 用途 |
|---------|------|
| `user_test_results` | 個別回答（question_id, is_correct, subject_category, answered_at） |
| `learning_sessions` | 学習時間・ヒートマップの元データ（session_duration, duration_minutes） |
| `user_learning_profiles` | 継続日数（current_streak_days）、ブートストラップ済み |
| `quiz_sessions` | セッション単位（questions_attempted, questions_correct, score_percentage, session_type） |
| `user_unified_srs_status` | SRS 復習スケジュール |
| `user_weak_areas` | 弱点科目と推奨コンテンツ（現行本線では未使用の可能性あり） |

## 保存済みデータだけで出せる指標

- **直近 N 問正答率**: `user_test_results` を `answered_at` 降順で取得し集計
- **分野別正答率**: `subject_category` でグルーピング
- **復習推奨**: `user_weak_areas` または正答率が低い科目
- **継続日数**: `user_learning_profiles.current_streak_days`（既存）
- **セッション別成績**: `quiz_sessions` から取得

## 追加保存が必要な指標

- **ランキング**: 他ユーザーとの比較のため、集計用ビューまたはマテリアライズドビューが必要
- **直近10問正答率（リアルタイム）**: 現状は全履歴から計算可能だが、パフォーマンスのためキャッシュ検討
- **分野別トレンド**: 時系列での正答率変化 → 集計テーブルまたはビュー

## 段階計画

### Phase A: 個人向け分析の強化（優先）

1. **直近10問正答率**
   - `user_test_results` から直近10件を取得し正答率を算出
   - ダッシュボードの「クイズ正答率」カードに「直近10問」を併記

2. **分野別正答率の可視化**
   - `dashboard.getTestResults` の `subjectBreakdown` を活用
   - Home ダッシュボードに簡易チャート（SubjectRadarChart 拡張）を追加

3. **復習推奨の明確化**
   - 弱点トピックから「今日の復習」への導線を強化（`/test?mode=review`）
   - SRS の due 件数を表示

### Phase B: ランキング系の土台

1. **集計ビューの検討**
   - `user_test_results` を集計したビュー（週次・月次）
   - Supabase の Materialized View または RPC

2. **ランキング用スキーマ**
   - 匿名化されたスコア集計テーブル
   - 期間（日/週/月）、モード（practice/exam/review）別

3. **OneMessage 的な一言**
   - 直近成績に基づく励ましメッセージ
   - 例: 「直近10問 80%！ この調子で」

### Phase C: ランキング・ライバル比較（将来）

- フレンド機能または匿名ランキング
- 期間別リーダーボード
- 科目別ランキング

## 実装の優先順位

1. 直近10問正答率（既存データで即時実装可能）
2. 分野別正答率のダッシュボード表示強化
3. 復習推奨メッセージの改善
4. 集計ビュー・ランキング用スキーマの設計

## 関連ファイル

- `src/utils/dashboard.ts` - メトリクス取得
- `src/types/dashboard.ts` - 型定義
- `src/pages/dashboard/HomePage.tsx` - ダッシュボード UI
- `src/hooks/useTestResultTracker.ts` - テスト結果記録
