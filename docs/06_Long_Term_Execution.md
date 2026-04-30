# 長期実行計画（品質・コンテンツ・分析・成長）

**最終更新**: 2026-04-25（§5 に旧 12 統合）

**位置づけ**: [01_Current_Status_and_Roadmap.md](01_Current_Status_and_Roadmap.md)・[00_Flight_Academy_Strategy.md](00_Flight_Academy_Strategy.md) の補助。執筆方針と記事 ID の**原則**は [Docs_Consistency_Decisions.md](Docs_Consistency_Decisions.md) を正とし、本書は実装・運用の**長期バックログ**に絞る。

---

## 1. 品質・観測・テスト

**根拠**: [01](01_Current_Status_and_Roadmap.md) 技術的負債（カバレッジ、Lighthouse 未、A11y 未）。

### 1.1 テストカバレッジ

- **正本**: [vitest.config.ts](../vitest.config.ts) の `coverage.thresholds` と `npm run test:coverage`。
- **解釈**: レポート先頭の **All files** は `node_modules` 等を含みうる。ロードマップ上の 30% / 50% は `src` の **Statements 実効**を判断材料にする（[01](01_Current_Status_and_Roadmap.md) 技術的負債表・更新履歴）。
- **方針**: 閾値は CI 安定用の下限。未達分は B-4（フック・ユーティリティ拡充）で段階的に。Phase B 末 30%・Phase D 末 50% は [01](01_Current_Status_and_Roadmap.md) に従う。

### 1.2 優先テスト層

| 層 | 例 | 理由 |
|----|-----|------|
| 学習進捗・統計 | `useArticleProgress`, `calculateLearningStats` | DB 整合とダッシュボード数値の要 |
| ゲーミフィケーション | `useGamification`, `streak` 系 | 体験への直接影響 |
| データ取得 | [src/utils/supabase.ts](../src/utils/supabase.ts) 周辺 | 二重クライアント等の退行防止 |
| Planning / 空域 | `airspace.ts`, `planDocument.ts` | 安全系 |
| API 境界 | `api/lib/swimNotamCore.ts` 等の純粋変換 | モック可能な単位から |

### 1.3 観測・品質ゲート

| 項目 | 状態 | 次アクション |
|------|------|----------------|
| Sentry | 導入済 | 本番 DSN・ソースマップ・`Issues` をリリースチェックに含める（[04_Operations_Guide.md](04_Operations_Guide.md)） |
| GA4 | 実装済 | 本番受信は [04](04_Operations_Guide.md) ログ表。タグ未送信は Data API では解決しない |
| Lighthouse CI | 未 | Phase C（[01](01_Current_Status_and_Roadmap.md) C-5） |
| A11y | 未 | Phase C（C-4）WCAG 2.1 A |

**製品側の学習指標の詳細**: [本書 §5](#5-クイズ分析ランキング詳細)（旧 `12_Quiz_Analytics_Phase_Design.md` を統合）

---

## 2. コンテンツ（MDX）と Supabase の整合

**根拠**: [Docs_Consistency_Decisions.md](Docs_Consistency_Decisions.md)（データソース二重化・記事 ID 正本）。

### 2.1 正本

| 概念 | 正本 | 補足 |
|------|------|------|
| ルーティング・DB キー | MDX ファイル名 stem = `learning_contents.id` | [11](Docs_Consistency_Decisions.md) §2.4 |
| 分類 | `unified_cpl_questions` の `(main_subject, sub_subject)` | PPL は `applicable_exams` |
| 記事–問題 | `learning_test_mapping`（[08](08_Syllabus_Management_Guide.md)「問題–記事連携契約」） | |
| 計画用スラッグ | [10](10_航空工学_学科試験攻略ブログ_ロードマップ.md) の `aero-*` 等 | **DB に入れない** |

### 2.2 期待整合

1. 各 `src/content/**/*.mdx` stem が本番 `learning_contents.id` に存在（公開は `is_published`）。
2. `meta` と [02](02_System_Spec.md) / [08](08_Syllabus_Management_Guide.md) の運用方針が一致。
3. `learning_test_mapping` 行が有効な設問を参照。
4. 一時非公開は `withdrawnArticleIds` と DB の**両方**（[02](02_System_Spec.md)）。

### 2.3 段階的チェック

| 段階 | 内容 |
|------|------|
| A | リポジトリ glob と `scripts/database` 内 id の突合（読み取り専用スクリプト） |
| B | [14](Article_Coverage_Backlog.md) スナップショットを MCP 等で本番と同期（[04](04_Operations_Guide.md)） |
| C | 必要に応じ CI へ整合スクリプト（コストと相談） |

4ChoiceQuiz CSV は当面別リポジトリ。[11](Docs_Consistency_Decisions.md) の**対照表**で橋渡し。記事登録は [.cursor/rules/supabase-article-registration.mdc](../.cursor/rules/supabase-article-registration.mdc)。`public/docs/` は [FOLDER_STRUCTURE.md](FOLDER_STRUCTURE.md) のとおり **手編集禁止**（`npm run sync:public-docs`）。

---

## 3. 学習分析・復習・計測の実装順

**根拠**: [本書 §5](#5-クイズ分析ランキング詳細)・[01](01_Current_Status_and_Roadmap.md) Phase D/E。

- 個人向け分析は既存テーブルで可。ランキングは**同意・匿名化・集計スキーマ**を先に設計。

**推奨順**:

1. 直近 10 問正答率（`user_test_results` 直近 10 件）
2. 分野別正答率の強調（`SubjectRadarChart` 等）
3. 復習導線（弱点 → `/test?mode=review`、SRS due）
4. 励まし一言（任意）
5. 集計ビュー / RPC / マテビュー（重くなったら）
6. ランキング（オプトイン・期間・モード別。公開ボードは最後）

**GA4 週次 / Data API / MCP** は本番 `g/collect` 安定後（[04](04_Operations_Guide.md)）。Phase B-5 完了判断にもログ表を使う。

**参照コード**: [src/utils/dashboard.ts](../src/utils/dashboard.ts), [src/pages/dashboard/HomePage.tsx](../src/pages/dashboard/HomePage.tsx)

---

## 4. 成長・持続可能性・ガバナンス

**根拠**: [00](00_Flight_Academy_Strategy.md) §3、[01](01_Current_Status_and_Roadmap.md) Phase C 以降。

| 領域 | 目標 | 参照 |
|------|------|------|
| ブランド・SEO | OGP、構造化、サイトマップ | [01](01_Current_Status_and_Roadmap.md) C-1, C-2 |
| PWA | オフライン・インストール | C-3、E-2。まず記事読み戻しと復習キュー |
| ポリシー | Terms / Privacy たたき台 | C-8（**所管確認後**） |

- **コスト**: API 従量・Vercel 時間・Supabase プランの可視化。ログイン後のみ・キャッシュ・上限（[00](00_Flight_Academy_Strategy.md) §3.1、03 B-7）。SWIM/気象の帰属は [03](03_Development_Guide.md)。
- **プライバシー**: GA4 / Sentry の目的をポリシーに一言。学習データの比較・ランキングは**同意**と**最小開示**（§3 と同時設計）。
- **表現**: 非公式学習支援。一次情報（公告）は当局サイトへ誘導（[00](00_Flight_Academy_Strategy.md) §3.2–3.3）。

---

## 5. クイズ分析・ランキング詳細

> 旧 **`12_Quiz_Analytics_Phase_Design.md`** を本書に統合（2026-04）。上記 §3 の実装順と併読。

### 5.1 概要

4択クイズ改善プラン Phase 1 完了後、ランキング・分析機能を段階的に導入するための設計。

### 5.2 実装済み（2026年3月）

- **学習時間記録**: `answeredAt` / `responseTimeMs` を `learning_sessions` に保存
- **今週の学習時間**: `learning_sessions` 直近7日の `duration_minutes` 合計
- **ヒートマップ**: 縦軸=曜日、横軸=週、`learning_sessions` を日別集計
- **弱点トピック**: `user_test_results.subject_category` ベースで正答率が低い順
- **科目別レーダーチャート**: `SubjectRadarChart` で `user_test_results` を集計
- **user_learning_profiles ブートストラップ**: 初回クイズ/記事学習時に自動で行を作成
- **復習導線**: 弱点トピックカードから `/test?mode=review` へリンク

### 5.3 後続フェーズ（未実装）

- `current_streak_days` の自動計算（現状はプロファイル行のブートストラップのみ）
- フラグの永続保存・Review 連携
- SRS 更新の強化
- ランキング・ライバル比較

### 5.4 現状のデータソース

| テーブル | 用途 |
|---------|------|
| `user_test_results` | 個別回答（question_id, is_correct, subject_category, answered_at） |
| `learning_sessions` | 学習時間・ヒートマップの元データ（session_duration, duration_minutes） |
| `user_learning_profiles` | 継続日数（current_streak_days）、ブートストラップ済み |
| `quiz_sessions` | セッション単位（questions_attempted, questions_correct, score_percentage, session_type） |
| `user_unified_srs_status` | SRS 復習スケジュール |
| `user_weak_areas` | 弱点科目と推奨コンテンツ（現行本線では未使用の可能性あり） |

### 5.5 保存済みデータだけで出せる指標

- **直近 N 問正答率**: `user_test_results` を `answered_at` 降順で取得し集計
- **分野別正答率**: `subject_category` でグルーピング
- **復習推奨**: `user_weak_areas` または正答率が低い科目
- **継続日数**: `user_learning_profiles.current_streak_days`（既存）
- **セッション別成績**: `quiz_sessions` から取得

### 5.6 追加保存が必要な指標

- **ランキング**: 他ユーザーとの比較のため、集計用ビューまたはマテリアライズドビューが必要
- **直近10問正答率（リアルタイム）**: 現状は全履歴から計算可能だが、パフォーマンスのためキャッシュ検討
- **分野別トレンド**: 時系列での正答率変化 → 集計テーブルまたはビュー

### 5.7 段階計画

#### Phase A: 個人向け分析の強化（優先）

1. **直近10問正答率**
   - `user_test_results` から直近10件を取得し正答率を算出
   - ダッシュボードの「クイズ正答率」カードに「直近10問」を併記

2. **分野別正答率の可視化**
   - `dashboard.getTestResults` の `subjectBreakdown` を活用
   - Home ダッシュボードに簡易チャート（SubjectRadarChart 拡張）を追加

3. **復習推奨の明確化**
   - 弱点トピックから「今日の復習」への導線を強化（`/test?mode=review`）
   - SRS の due 件数を表示

#### Phase B: ランキング系の土台

1. **集計ビューの検討**
   - `user_test_results` を集計したビュー（週次・月次）
   - Supabase の Materialized View または RPC

2. **ランキング用スキーマ**
   - 匿名化されたスコア集計テーブル
   - 期間（日/週/月）、モード（practice/exam/review）別

3. **OneMessage 的な一言**
   - 直近成績に基づく励ましメッセージ
   - 例: 「直近10問 80%！ この調子で」

#### Phase C: ランキング・ライバル比較（将来）

- フレンド機能または匿名ランキング
- 期間別リーダーボード
- 科目別ランキング

### 5.8 実装の優先順位

**長期の実装順**（本節の詳細と併用）: 上記 **§3**。

1. 直近10問正答率（既存データで即時実装可能）
2. 分野別正答率のダッシュボード表示強化
3. 復習推奨メッセージの改善
4. 集計ビュー・ランキング用スキーマの設計

### 5.9 関連ファイル

- `src/utils/dashboard.ts` - メトリクス取得
- `src/types/dashboard.ts` - 型定義
- `src/pages/dashboard/HomePage.tsx` - ダッシュボード UI
- `src/hooks/useTestResultTracker.ts` - テスト結果記録

---

## 参照一覧（短縮）

| 用途 | 文書 |
|------|------|
| Phase・KPI | [01](01_Current_Status_and_Roadmap.md) |
| 戦略 | [00](00_Flight_Academy_Strategy.md) |
| 記事 ID・06/10 関係 | [11](Docs_Consistency_Decisions.md) |
| 分析機能の中身 | [本書 §5](#5-クイズ分析ランキング詳細)（旧 12 統合） |
| 現行仕様 | [02](02_System_Spec.md) |
