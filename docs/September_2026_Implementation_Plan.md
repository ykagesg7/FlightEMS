# 2026年9月期 実装・コンテンツ計画（Phase D 第2ヶ月）

**作成日**: 2026-08-12  
**最終更新**: 2026-08-13（FMT ドリップ 1-1 から・週3本）  
**位置づけ**: [Phase D](01_Current_Status_and_Roadmap.md)（2026年8–12月）の **第2ヶ月**。[August](August_2026_Implementation_Plan.md) 完了後の実行計画。

**週次の正本**: [05_Content_Pipeline.md](05_Content_Pipeline.md) Phase 2 **週次着手記録表**（**2026-W36〜W40**）。Articles 運用は [ops/Weekend_Content_Pipeline.md](ops/Weekend_Content_Pipeline.md)。A2-a 計測は [ops/Weekly_Telemetry_Review.md](ops/Weekly_Telemetry_Review.md) に統合。

---

## 0. 八月引き継ぎ（MCP 2026-08-12）

| 指標 | 値 |
|------|-----|
| `learning_contents` | **153**（公開 **123** / PPL **64/150**） |
| `learning_test_mapping` | **147 行 / 112 記事** |
| verified 設問 | **2,233** |
| 未マッピング verified | **10**（レガシー工学のみ・**CBT mapping 経路は 0**） |
| CBT 暫定束ね | **104/104** 完走（5 科目ハブ） |
| `src` Statements | **21.17%**（7728/36505・507 tests 緑） |
| Action2 **A2-a** | **実装済**（科目タブ default **5問**） |
| Action2 **A2-b** | 未着手（A2-a 計測後） |
| C-1〜C-5 | 未承認 |

**レガシー未マッピング 10**（すべて航空工学・1 問クラスタ）: 空力揚力/抗力/三次元翼、着氷、着陸装置構成、防火系統×2、遠隔表示計器/温度、燃料表示、汎用 `航空工学`。

---

## 1. 9月期末の「DONE」条件

| 種別 | 2026-09 末までの DONE 条件 | 備考 |
|------|---------------------------|------|
| **ゲート・記録** | `src` **≥21%** 維持を Phase_C / 01 に 1 行 | W40 九月末ゲート |
| **週次パイプライン** | W36〜W40 を [05](05_Content_Pipeline.md) に各週 1 行 | 空欄禁止 |
| **A2-a 効果測定** | GA4 で `tab=subject` の start→complete を **2 週連続**記録し、判定メモ 1 件 | [§4](#4-action2-a2-a-効果測定) |
| **CBT Phase B** | 暫定束ねから **≥1 科目**で細粒度再分類を本番 SQL 適用 | [CBT メモ](CBT_Example_Reclassification_Memo.md) 段階 B |
| **PPL 二次** | Subject 2 Phase 2 **≥1 本**（候補: `PPL-2-3-4`） | 64→65/150 目安 |
| **マッピング** | レガシー **10** から **≥1 クラスタ** または CBT 再分類で同等 | 任意だが W38 候補 |
| **Articles** | **週 3 本（月水金）** を空けるな。FMT は **1-1 から** ドリップ（W34 で 1-1〜1-3） | 訪問習慣 + 有益記事 |
| **Action3** | A3-a **description メタ 1〜2 件**（UI 変更なし） | 気象/通信ハブ |
| **C-1〜C-5** | 承認時のみ | 着手しない |

---

## 2. ISO 週（2026年9月）

| 週（ISO） | 目安締め | フォーカス | 状態 |
|-----------|----------|------------|------|
| **2026-W36** | 〜09-07 | A2-a ベースライン計測開始・9月 Editorial・CBT Phase B 準備 | 予定 |
| **2026-W37** | 〜09-14 | **A2-a 計測 W1**・PPL-2-3-4 着手・レガシー mapping 1 本 | 予定 |
| **2026-W38** | 〜09-21 | **A2-a 計測 W2**（2週目）・CBT 再分類 第1バッチ | 予定 |
| **2026-W39** | 〜09-28 | A2-a **判定**・A2-b Go/No-Go・Articles ドリップ | 予定 |
| **2026-W40** | 〜10-05 | **九月末ゲート**（coverage・MCP・01）・10月引き継ぎ | 予定 |

---

## 3. 優先順位（9月）

| 優先 | テーマ | 9月の役割 | Phase D |
|------|--------|-----------|---------|
| **1** | **A2-a 効果測定** | GA4 週次・2 週連続判定 | D-5 / ALPM |
| **2** | **Articles 運用** | 次シリーズ Editorial + ドリップ | 成長・LTV |
| **3** | **CBT Phase B** | 暫定→細粒度（週 1 科目 or 1 クラスタ） | D-1 |
| **4** | **PPL 二次** | Subject 2 Phase 2 継続 | D-4 |
| **5** | **レガシー 10** | Tier A 工学クラスタ | C-6 残 |
| **6** | **カバレッジ** | 21% 維持（W40） | D-2 |
| **7** | **C-1〜C-5** | 承認がなければ着手しない | — |

**スコープ外（9月 FA）**: Quiz Hub 全面リデザイン、A2-a と A2-b の同時 A/B、パッケージ無承認バンプ。

---

## 4. Action2 A2-a 効果測定

**実装日**: 2026-08-12 — 科目タブ default **5問**（`SUBJECT_DEFAULT_COUNT`）。診断・弱点復習は **10問** 維持。

**成功指標**（[Post_Exam_Action2_Action3_Policy_Memo](Post_Exam_Action2_Action3_Policy_Memo.md)）: 同一 `tab=subject` で **start→complete 率**が **2 週連続で改善**（母数 ≥ N は GA4 で確認）。

**イベント**（既存）: `quiz_session_start` / `quiz_session_complete` — パラメータ `tab`, `count`, `exam`（[`quizAnalytics.ts`](../src/lib/quizAnalytics.ts)）。

### 週次タスク

| 週 | タスク | 成果物 |
|----|--------|--------|
| **W36** | デプロイ後ベースライン — subject タブの start/complete 件数・率を GA4 で取得。七月 [`quiz_hub_funnel_memo`](../artifacts/quiz_hub_funnel_memo_2026-07-08.md) と比較メモ | [Weekly_Telemetry](ops/Weekly_Telemetry_Review.md) 節 + `artifacts/a2a_baseline_2026-W36.md`（任意） |
| **W37** | **計測 W1** — `tab=subject` ファネル、`count` 次元（5 vs 10+） | Telemetry 節 |
| **W38** | **計測 W2** — W37 と並べ **連続改善**の有無を判定 | Telemetry 節 |
| **W39** | **判定** — 改善あり → A2-a 維持・A2-b 検討を Post_Exam メモへ。改善なし/母数不足 → 要因メモ・継続観測 or ロールバック検討（PO 判断） | Post_Exam メモ追記 |
| **W40** | 九月ゲートに A2-a 判定 1 行を 01 / 本書 §6 へ | 01 更新履歴 |

**注意**: 週間 users が一桁のため（Telemetry T-02）、**絶対率より start 件数・complete 件数の推移**も併記する。

---

## 5. 週次タスク詳細（W36〜W40）

### W36（〜09-07）— 計測開始・9月設計

| # | タスク | 種別 |
|---|--------|------|
| 1 | **A2-a ベースライン** GA4（subject ファネル） | 計測 |
| 2 | **Articles** — 週 3 本（月水金）。FMT は 1-1 から（[W34 schedule](../api/_lib/articlePublishSchedule.ts)）。1-4 以降はストック | コンテンツ |
| 3 | **CBT Phase B** — 再分類第1対象科目の選定（通信 11 から推奨：最小） | 設計 |
| 4 | 土曜 **Weekly Telemetry**（GA4+Sentry） | 運用 |
| 5 | [05](05_Content_Pipeline.md) W36 行追記 | 記録 |

### W37（〜09-14）— A2-a W1 + PPL + mapping

| # | タスク | 種別 |
|---|--------|------|
| 1 | **A2-a 計測 W1** | 計測 |
| 2 | **PPL-2-3-4**（風系 Phase 2）MDX + `learning_contents` + mapping | コンテンツ |
| 3 | **レガシー Tier A** — 空力 3 クラスタ → `3.2.7_LiftAndDrag`（3 問）SQL 案 | DB |
| 4 | **A3-a** — `3.3.1` or `3.5.1` description メタ 1 件 | メタ |
| 5 | B-4: 純関数テスト 1 単位（任意） | 品質 |

### W38（〜09-21）— A2-a W2 + CBT 再分類

| # | タスク | 種別 |
|---|--------|------|
| 1 | **A2-a 計測 W2** + W37 比較 | 計測 |
| 2 | **CBT Phase B 第1バッチ** — 選定科目の細粒度 `learning_test_mapping` 置換/追加 | DB |
| 3 | Articles **W37 週ドリップ**（Editorial 確定後）— schedule + MDX + DB | コンテンツ |
| 4 | MCP 再集計 → [14](Article_Coverage_Backlog.md) ヘッダ | 監査 |
| 5 | レガシー残り（着氷・防火等）から 1 クラスタ（余力） | DB |

### W39（〜09-28）— A2-a 判定 + Action3

| # | タスク | 種別 |
|---|--------|------|
| 1 | **A2-a 判定** — 2 週連続改善？ → Post_Exam / 01 へ | プロダクト |
| 2 | **A2-b Go/No-Go** — 改善時のみ PO 承認後に着手検討 | 判断 |
| 3 | Articles ドリップ継続 | コンテンツ |
| 4 | CBT Phase B 第2バッチ（余力・同一パターン） | DB |
| 5 | cohort digest / Brevo UTM（Telemetry T-01 検討） | 運用 |

### W40（〜10-05）— 九月末ゲート

| # | タスク | 種別 |
|---|--------|------|
| 1 | `npm run test:coverage` → `src` **≥21%** | 品質 |
| 2 | MCP スナップショット — mapping / PPL / 未マッピング | 監査 |
| 3 | [01](01_Current_Status_and_Roadmap.md) v4.0.45+ 更新履歴 | 記録 |
| 4 | [Phase_C](Phase_C_Quality_Preparation.md) §4 九月行 | 記録 |
| 5 | **10月計画**起票（October_2026_Implementation_Plan.md） | 計画 |

---

## 6. CBT Phase B（再分類）方針

正本: [CBT_Example_Reclassification_Memo.md](CBT_Example_Reclassification_Memo.md) 段階 B。

| 順 | 科目 | 暫定ハブ | 9月の進め方 |
|----|------|----------|-------------|
| 1 | 航空通信 | `CPL-Hub-Communication` | **11 問** — 最小・W38 第1バッチ候補 |
| 2 | 航空気象 | `CPL-Hub-Meteorology` | 18 問 — サブ科目木へ週次分割 |
| 3 | 空中航法 | `CPL-Hub-Navigation` | 同上 |
| 4 | 航空工学 | `engineering_basics` | 26 問 |
| 5 | 航空法規 | `3.1.1_AviationLegal0` | 31 問 — 最後（細分類価値高） |

各バッチ: 問題文レビュー → 既存 `(main_subject, sub_subject)` へ付け替え → 暫定行は `mapping_source` で識別し置換。

---

## 7. 原則・禁止（継続）

| 項目 | 内容 |
|------|------|
| UI/UX | レイアウト・トークン無承認変更禁止（A2-b は承認後） |
| 依存 | `package.json` 無承認バンプ禁止 |
| SQL | MCP 適用後 INDEX + [14](Article_Coverage_Backlog.md) 一致 |
| 計測 | A2-a 判定前に A2-b を同時投入しない |

---

## 8. 参照

| 役割 | パス |
|------|------|
| 八月 DONE | [August_2026_Implementation_Plan.md](August_2026_Implementation_Plan.md) |
| Phase D KPI | [01_Current_Status_and_Roadmap.md](01_Current_Status_and_Roadmap.md) |
| Action2/3 | [Post_Exam_Action2_Action3_Policy_Memo.md](Post_Exam_Action2_Action3_Policy_Memo.md) |
| 週次テレメトリ | [ops/Weekly_Telemetry_Review.md](ops/Weekly_Telemetry_Review.md) |
| PPL 次候補 | [PPL_Master_Syllabus.md](PPL_Master_Syllabus.md) Subject 2 Phase 2 |

---

### 変更履歴

| 日付 | 内容 |
|------|------|
| 2026-08-12 | 初版。八月 MCP 引き継ぎ・W36〜W40 週次・A2-a 計測スケジュール。 |
