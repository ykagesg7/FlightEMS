# 2026年7月（W27〜W30）コンテンツ・品質スプリント

**作成日**: 2026-06-30  
**正本の位置づけ**: [July_2026_Implementation_Plan.md](July_2026_Implementation_Plan.md) の **週次実行メモ**。DONE 条件の正本は同ファイルおよび [01](01_Current_Status_and_Roadmap.md)。**週次表の正本**: [05_Content_Pipeline.md](05_Content_Pipeline.md) Phase 2 週次着手記録。

---

## 1. 前提（六月からの引き継ぎ）

- **六月スプリント完了**: [June_2026_Content_Sprint.md](June_2026_Content_Sprint.md) §6 — W23〜W26 済。PPL Subject 2 Phase 1 **12/12**、未マッピング **23**、mapping **106 行 / 95 記事**。
- **Phase C 後半**: C-6（マッピング）最優先、C-7（PPL Phase 2）二次、C-1〜C-5 は承認待ち。
- **verified 未マッピングをゼロにすることは必須ではない**（[July 実装計画 §1](July_2026_Implementation_Plan.md)）。

---

## 2. 対象ウィーク（[05](05_Content_Pipeline.md) への転記）

| ブロック | ISO 週（目安締め） | 主目的（要約） |
|----------|-------------------|----------------|
| **H** | **2026-W27**（〜2026-07-08） | GA4 ファネル。法規 Callout `3.1.x`←`PPL-5-*`。MCP 七月第 1 再集計。 |
| **I** | **2026-W28**（〜2026-07-15） | Tier A マッピング 1 本。PPL-2 Phase 2 第 1 本。 |
| **J** | **2026-W29**（〜2026-07-22） | Tier B 精緻化 1 本。PPL Phase 2 第 2 本。Callout 残り。 |
| **K** | **2026-W30**（〜2026-07-29） | **七月末ゲート**（§7）。カバレッジ・MCP・01 更新履歴。 |

---

## 3. CPL ↔ PPL の対応（7月の狙い）

| 軸 | 7月の累計目標 |
|------|----------------|
| **CPL（C-6）** | MCP 再集計 **≥1**、新規 mapping SQL **≥1**、未マッピング **23 から段階削減** |
| **PPL（C-7）** | Subject 2 Phase 2 **≥2 MDX** または Phase 1 **≥2 本深文化** |
| **Callout** | 法規 **`3.1.x` ← `PPL-5-*`** を **≥3 記事** |

---

## 4. 外部 LLM（Gemini 等）

[May_2026_Late_Content_Sprint.md §4](May_2026_Late_Content_Sprint.md) および [External_LLM_Article_Brief.md](templates/External_LLM_Article_Brief.md) に従う。Phase 2 用ブリーフは必要に応じて `content_outlines/PPL_Meteorology_2026/` に `PPL-2-2-4_*` 等を起票。

---

## 5. ウィーク別完了ログ（実装の正本）

| ブロック／週 | 状態 | MDX／DB／メモ |
|---------------|------|----------------|
| **H / W27** | **未着手** | — |
| **I / W28** | **未着手** | — |
| **J / W29** | **未着手** | — |
| **K / W30** | **未着手** | — |

---

## 6. 七月末ゲート・W30 実行チェックリスト

**実行タイミング**: **W30 週末**（2026-07-29 前後）。

1. **[14 §5](Article_Coverage_Backlog.md)** 同種 MCP `execute_sql` で再集計し、**ヘッダ**に日付・**verified 未マッピング**・`learning_test_mapping` 行数/記事数を反映。
2. **新規 `scripts/database/*.sql` を本番適用した場合**、[scripts/database/INDEX.md](../scripts/database/INDEX.md) と [14 §9](Article_Coverage_Backlog.md) を更新。
3. **`npm run test:coverage`** → `FlightAcademyTsx/src/` のみ **Statements 実効 %** を再集計（[Phase_C §4](Phase_C_Quality_Preparation.md)、[06 §1](06_Long_Term_Execution.md)）。
4. **[01_Current_Status_and_Roadmap.md](01_Current_Status_and_Roadmap.md)** に **更新履歴 1 行**（七月末）。技術的負債表の **`src` 実効**が古い場合は追随。
5. **Phase C 6–7月振り返り**: C-6/C-7 の達成度を 1 行（未達なら 8月継続方針）。
6. **GA4**: [June W26 フォロー](June_2026_Content_Sprint.md) — ファネルメモが未作成なら W27 で先に実施し、ここで完了確認。
7. **B-4**: `npm run test:run` 緑。七月追加分のテストファイルを週次行に記録。

---

### 変更履歴

| 日付 | 内容 |
|------|------|
| 2026-06-30 | 初版。W27〜W30 ブロック H〜K、7月 PPL/CPL 狙い、§7 ゲート。 |
