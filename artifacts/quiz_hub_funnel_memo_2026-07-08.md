# Quiz Hub GA4 ファネル確認メモ（W27）

**作成日**: 2026-07-01（W27 ブロック H）  
**最終更新**: 2026-05-28（GA4 MCP `run_report` / `run_funnel_report` 再取得）  
**対象期間**: 2026-06-06（Quiz Hub Lane A 本番投入）〜 2026-07-08  
**プロパティ**: FlightAcademy — 測定 ID `G-22VFYSM69J` / Data API property ID **`532610432`**（[04_Operations_Guide.md](../docs/04_Operations_Guide.md)）  
**タイムゾーン**: Asia/Tokyo（レポートメタデータ）

---

## データソース

| 試行 | 日付 | 手段 | 結果 |
|------|------|------|------|
| 1 | 2026-07-01 | GA4 MCP | **失敗** — `invalid_grant`（ADC 失効） |
| 2 | 2026-05-28 | GA4 MCP | **失敗** — 同上 |
| 3 | 2026-05-28 | GA4 MCP（ADC 再ログイン後） | **成功** — `get_account_summaries`・`run_report`・`run_funnel_report` |

復旧手順: [`scripts/ga4-mcp-reauth.ps1`](../scripts/ga4-mcp-reauth.ps1) · [Cursor_MCP_Setup.md](../docs/Cursor_MCP_Setup.md)

---

## 計測イベント（実装正本）

[`src/lib/quizAnalytics.ts`](../src/lib/quizAnalytics.ts) より:

| ステップ | イベント名 | 主なパラメータ |
|----------|------------|----------------|
| 1 | `quiz_hub_view` | `tab`, `exam`, `content_id` |
| 2（任意） | `quiz_filter_open` | `tab`, `exam` |
| 3 | `quiz_session_start` + `quiz_start` | `tab`, `mode`, `count`, `subject`, `content_id`, `exam` |
| 4 | `quiz_session_complete` | `score_pct`, `count`, `mode` |

関連: `article_to_quiz_click`, `review_article_click`（学習ループ PR-Q4）

---

## イベント集計（Data API `run_report`）

**期間**: 2026-06-06 〜 2026-07-08  
**フィルタ**: 上表 7 イベント

| eventName | eventCount | totalUsers |
|-----------|----------:|----------:|
| `quiz_session_start` | 160 | 20 |
| `quiz_session_complete` | 106 | 11 |
| `quiz_start` | 61 | 7 |
| `quiz_hub_view` | 46 | 6 |
| `review_article_click` | 10 | 4 |
| `article_to_quiz_click` | 3 | 1 |
| `quiz_filter_open` | 2 | 2 |

**補足**:

- `quiz_hub_view` はすべて **`/test`** 上（46 イベント / 6 ユーザー）。
- `quiz_session_start`（20 ユーザー）> `quiz_hub_view`（6 ユーザー）— 記事→クイズ等 **`quiz_hub_view` を経由しない開始**、または計測開始前のセッションが混在する可能性。
- `quiz_start` と `quiz_session_start` は同一操作で **二重送信**（実装どおり）。件数差は投入時期・経路差の影響。

---

## ファネル（Data API `run_funnel_report`）

**定義**: 同一ユーザーの **オープン順序** — `quiz_hub_view` → `quiz_session_start` → `quiz_session_complete`  
**期間**: 2026-06-06 〜 2026-07-08

| ステップ | activeUsers | 前ステップ比 | 第1ステップ比 |
|----------|----------:|-------------:|--------------:|
| 1. Hub view | 6 | — | 100% |
| 2. Session start | 6 | 100% | 100% |
| 3. Session complete | 3 | **50%** | **50%** |

**解釈（Hub 経由の狭義ファネル）**:

- Hub を見た **6 ユーザー**はすべて **セッション開始**まで到達（100%）。
- そのうち **3 ユーザー**が **セッション完了**（Hub 起点では **50%** 完走）。
- `quiz_filter_open` は 2 ユーザー・2 イベントのみ — フィルタ UI の利用は限定的。

**全体（イベント単位・参考）**: 開始 160 回 / 完了 106 回 ≒ **66%**（同一ユーザー保証なし。経路混在あり）。

---

## パラメータ偏り（`exam` / `tab`）

- Data API の **カスタムディメンション未登録**（`get_custom_dimensions_and_metrics` → 空）。`customEvent:exam` はレポート不可。
- **GA4 探索**でイベントパラメータを見るか、Admin で `exam` / `tab` / `content_id` をカスタムディメンション化すると MCP 再取得可能。
- 現時点では **`/test` ページ上の Hub 閲覧**に偏り、学習ループは `review_article_click` 10 回・`article_to_quiz_click` 3 回（小さいが計測されている）。

---

## 所見

1. **計測パイプラインは成立** — Quiz Hub 系カスタムイベントが GA4 に蓄積されている（サンプルは小さいが 0 ではない）。
2. **Hub 狭義ファネル** — 6 → 6 → 3 ユーザー。完走率 50% はコホルト規模では参考値。UI 変更は **承認待ち**（Phase C）。
3. **経路の混在** — `quiz_session_start` の方がユーザー数が多く、Hub 以外からのクイズ開始が主因と推定。記事→クイズ導線の効果測定は `article_to_quiz_click` を別 KPI にするとよい。
4. **次の計測改善（コード不要・Admin のみ）**: `exam` / `content_id` をカスタムディメンション登録 → 次回 MCP で偏りを数値化。

**UI 改善案**: 本メモでは **着手しない**（[July_2026_Implementation_Plan.md](../docs/July_2026_Implementation_Plan.md) — C-1〜C-5 承認待ち）。

---

## 次アクション

- [x] ADC 再ログイン → MCP 再取得（2026-05-28）
- [ ] （任意）GA4 Admin で `exam` / `content_id` カスタムディメンション登録
- [ ] W30 七月末ゲートでファネル再確認（[July_2026_Content_Sprint.md](../docs/July_2026_Content_Sprint.md) §6）
