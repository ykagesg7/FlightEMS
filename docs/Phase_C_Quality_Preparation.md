# Phase C 品質準備メモ（Lighthouse・A11y）

**最終更新**: 2026-05-06（§4 カバレッジ 13.99% スナップショット）

**目的**: [01_Current_Status_and_Roadmap.md](01_Current_Status_and_Roadmap.md) Phase C（C-4〜C-5）に向け、“着手可能な準備のみ” を集約。**UI の大規模変更はしない**（レイアウト・トークン変更は DESIGN.md と承認を要する）。

---

## 1. ページ優先リスト（監査順のたたき台）

本番またはプレビューで、次を **同一ウィンドウ幅** で再現しやすい順に並べる。

| 優先 | パス／画面 | メモ |
|------|-------------|------|
| 高 | `/`（Home） | マーケ表示・レイアウト共通 |
| 高 | `/articles`、`/articles/{よく読まれる CPL ID}` | 記事一覧・長文スクロール |
| 高 | `/test` | 入力・結果・フォーカス順 |
| 中 | `/planning`、`/dashboard`、`/profile` | ログイン連携・アプリレイアウト |

---

## 2. Lighthouse CLI（ログの取り方の例）

手元で Chrome と Lighthouse を使える場合、`lighthouse <url> --only-categories=performance,accessibility --output html --output-path ./artifacts/lighthouse-$(date +%Y%m%d).html` のように **単発 HTML** を artifacts に溜める。CI 自動化は Phase C-5 で [01](01_Current_Status_and_Roadmap.md) に沿って検討。

---

## 3. A11y（WCAG 2.1 A の初動）

Chrome DevTools の **Issues / Accessibility** パネル、または axe DevTools で **自動検出のみ** を週次で走らせ、`src/` に紐づく課題に **ファイル名だけ** メモしておく。**即修正はしない**（仕様優先順を 01 と相談）。

---

## 4. カバレッジスナップショット（Phase C KPI 参照用）

[`vitest.config.ts`](../vitest.config.ts) の閾値は CI 下限。ロードマップの **`src` 実効 Statements** の**主目標は Phase C で 15%**（ストレッチ 18%・任意）であり、集計手順は [06_Long_Term_Execution.md](06_Long_Term_Execution.md) §1 と [01](01_Current_Status_and_Roadmap.md) に従う。月末に **`npm run test:coverage`** の **`coverage/lcov-report/index.html`** またはターミナル概要をスクリーンショット／数値だけ残す運用がよい。**B-4 追補後**の実測は **`coverage-final.json` でパスに `FlightAcademyTsx/src/` を含むファイルのみ**で **Statements 約 13.99%**（詳細・根拠は [01](01_Current_Status_and_Roadmap.md) 技術的負債表）。

### 月末記録（数値メモ）

| 締め | `src` Statements 実効（概算） | 実行コマンド・メモ |
|------|------------------------------|---------------------|
| **2026-05 月中** | **約 13.99%** | B-4 残タスク一括実施後。`npm run test:coverage` → v8 `coverage-final.json`・パス **`FlightAcademyTsx/src/`** のみ集計 |
| **2026-05 末** | （記入） | 月末に同手順で再確認。UI 変更なし |

### Lighthouse / A11y（任意・監査のみ）

**2026-05-06**: 本ファイル §2・§3 の手順に従い、**自動検出のみ**を週次〜月次で溜める。修正コミットは [01](01_Current_Status_and_Roadmap.md) Phase C と DESIGN 承認に紐づける。

---

## 5. GA4（観測）

タグ側のチェックリストは [04_Operations_Guide.md](04_Operations_Guide.md)「GA4」節および **Post-Phase-B 本番確認ログ表** が正（**2026-05-06** 本番リアルタイムで受信確認済み）。
