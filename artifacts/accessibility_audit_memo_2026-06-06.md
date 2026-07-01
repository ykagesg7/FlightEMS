# /test Quiz Hub — A11y 監査メモ（自動検出のみ）

**日付**: 2026-06-06  
**対象**: `/test` Quiz Hub 刷新後（Lane A PR-Q0〜Q5）  
**方針**: [Phase_C_Quality_Preparation.md](../docs/Phase_C_Quality_Preparation.md) §2–§3 — **修正コミットは DESIGN 承認後**。本ファイルは観測メモのみ。

---

## 対象画面・コンポーネント

| 領域 | ファイル | 備考 |
|------|----------|------|
| ハブ IA | `TestPage.tsx`, `QuizHubToolbar.tsx` | タブ `diagnostic` / `review` / `subject` / `content` |
| フィルタ | `QuizFilterDrawer.tsx`, `QuizActiveFilterChips.tsx` | モバイル Bottom Sheet |
| 弱点 Hero | `WeakAreasHero.tsx` | ログイン時 `user_weak_areas` |
| クイズ本体 | `QuizComponent.tsx` | モバイル問題パレット固定 Bottom Sheet、44px タップ |
| 結果 | `QuizResultsView.tsx` | 記事推薦 Hero（`ReviewContentLink`） |

---

## 実装済み A11y 配慮（コードレビュー）

- 問題パレット: `role="navigation"` + `aria-label="問題一覧"`、各問 `aria-label` / `aria-current`
- 試験モード: 残り時間 `aria-live`（既存 `QuizComponent`）
- フィードバック: `role="status"`（既存）
- 結果スクロール: `prefers-reduced-motion` 尊重（`TestPage`）
- フィルタ Listbox: 既存 `FilterListbox` のキーボード操作

---

## 手動確認推奨（未実施・次回 Lighthouse 前）

1. **モバイル**: 問題パレット Bottom Sheet が本文・解答ボタンを隠さないか（`pb` 余白）
2. **フォーカス**: ドロワー開閉時のフォーカストラップ・Esc 閉じ
3. **コントラスト**: `brand-primary/15` 境界線上のチップ可読性
4. **スクリーンリーダー**: 診断タブ「N問診断を開始」→ クイズ開始の状態変化アナウンス

---

## Lighthouse / axe（未取得）

本ターンでは CI 未連携。**W27 以降**に `npm run test:e2e` 通過後、ローカル Lighthouse（Mobile）で `/test?tab=diagnostic` を計測予定。

---

## GA4 ファネル（観測）

カスタムイベント投入日: **2026-06-06**（`quiz_filter_open`, `quiz_session_start`, `quiz_session_complete`, `article_to_quiz_click`, `review_article_click`）。  
**4 週後**に GA4 で `/test` PV → `quiz_session_start` → `quiz_session_complete` を再取得（目標 ≥40% start/PV — [June 計画](../docs/June_2026_Implementation_Plan.md)）。
