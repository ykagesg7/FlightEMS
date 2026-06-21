# 2026年6月（W23〜W26）コンテンツ・品質スプリント

**作成日**: 2026-05-12  
**前回更新**: 2026-05-12 — **W23 実績**を §6 に反映（法規・工学リンク・マッピング草案・Vitest）  
**正本の位置づけ**: [June_2026_Implementation_Plan.md](June_2026_Implementation_Plan.md) の **週次実行メモ**。DONE 条件・禁止事項の正本は同ファイルおよび [01](01_Current_Status_and_Roadmap.md)。**週次の表の正本**: [05_Content_Pipeline.md](05_Content_Pipeline.md) Phase 2 週次着手記録。

---

## 1. 前提（認識の言い換え）

- **5月後半**の続きで、May ブロック C（[May_2026_Late_Content_Sprint.md](May_2026_Late_Content_Sprint.md)）の **未完があれば W23 冒頭で優先**する（`3.2.9`＋`PPL-1-2-2`、任意の法規 `3.1.1`〜`3.1.3`）。
- **六月全体**の完了定義は [June 実装計画 §1](June_2026_Implementation_Plan.md)（週次パイプライン・マッピング 1 サイクル・Phase_C カバレッジ記録・PPL 狙い・B-4・UI 無承認変更なし）。
- **verified 未マッピングをゼロにすることは必須ではない**（同上）。

---

## 2. 対象ウィーク（[05](05_Content_Pipeline.md) への転記）

ISO 週と目安締めは [June 実装計画 §2](June_2026_Implementation_Plan.md) と同一。各週末に [05](05_Content_Pipeline.md) の当該行へ **着手単位の実績**を追記する（**0 でもよいが空欄禁止**）。

| ブロック | ISO 週（目安締め） | 主目的（要約） |
|----------|-------------------|----------------|
| **D** | **2026-W23**（〜2026-06-10） | 法規 **`3.1.1`〜`3.1.3`** 整理。`3.2.7`〜`3.2.9` 体裁・リンク。[14 §6](Article_Coverage_Backlog.md) **上位クラスタ 1** へマッピング追補。B-4 分割着手。 |
| **E** | **2026-W24**（〜2026-06-17） | [14 §7 Tier A](Article_Coverage_Backlog.md)（例: 総則/目的・航法計器系）＋ **Tier B** から 1 本のマッピング精緻化。PPL Callout 累計への積み増し。 |
| **F** | **2026-W25**（〜2026-06-24） | **マッピング 1 サイクル**（[14 §5](Article_Coverage_Backlog.md)、MCP `execute_sql`）→ 数値を [14](Article_Coverage_Backlog.md) に反映。Tier A/B の残り、B-4 の積み増し。 |
| **G** | **2026-W26**（〜2026-07-01） | **六月末ゲート**（§7）: `test:coverage`、Phase_C §4、01 更新履歴。Lighthouse/A11y **監査メモのみ**。PPL／CPL 未達なら延期理由 1 行。 |

---

## 3. CPL ↔ PPL の対応（6月の狙い）

[June 実装計画 §1・§3](June_2026_Implementation_Plan.md) に従う。**週ごとの必須ペア固定はしない**。次のいずれか（または併用）を六月累計で達成し、[05](05_Content_Pipeline.md) の各行に正直に残す。

| 軸 | 内容 |
|------|------|
| **CPL（最優先）** | [14 §6–§7](Article_Coverage_Backlog.md) Tier A/B、工学 [10](10_航空工学_学科試験攻略ブログ_ロードマップ.md)、拡張単元 **`3.2.7`〜`3.2.9`** の体裁・マッピング。法規・通信の **`learning_contents` / `mapping_source`**。 |
| **PPL（二次）** | [07](PPL_Master_Syllabus.md) の未済から **新規 `PPL-*.mdx` ≥1 本** *または* **CPL の未リンク記事への復習 Callout ≥3 単位（累計）**。 |
| **任意の素案フォルダ** | 外部 LLM を使う記事について [content_outlines/W22_2026/README.md](content_outlines/W22_2026/README.md) と同型の `content_outlines/June_2026_*` を **必要な週のみ**新設してよい（本リポジトリの任意運用）。 |

---

## 4. 外部 LLM（Gemini 等）で下書きするときの方針

**正本手順**は [May_2026_Late_Content_Sprint.md §4](May_2026_Late_Content_Sprint.md) と同じ。**ブリーフ用テンプレート**: [templates/External_LLM_Article_Brief.md](templates/External_LLM_Article_Brief.md)。記事登録・メタ同期: [08](08_Syllabus_Management_Guide.md)、[Skill `learning-contents-registration`](../.cursor/skills/learning-contents-registration/SKILL.md)。

---

## 5. 参照

- [June_2026_Implementation_Plan.md](June_2026_Implementation_Plan.md) — 六月 DONE・禁止・優先順位  
- [05_Content_Pipeline.md](05_Content_Pipeline.md) — 週次着手記録表（W23〜W26）  
- [Article_Coverage_Backlog.md](Article_Coverage_Backlog.md) §5–§7 — 集計クエリ・Tier A/B  
- [Phase_C_Quality_Preparation.md](Phase_C_Quality_Preparation.md) §2–§4 — Lighthouse・A11y・カバレッジ記録  
- [06_Long_Term_Execution.md](06_Long_Term_Execution.md) §1.2 — B-4 の選び方  
- [May_2026_Late_Content_Sprint.md](May_2026_Late_Content_Sprint.md) — 直前ブロックとの接続  

---

## 6. ウィーク別完了ログ（実装の正本）

| ブロック／週 | 状態 | MDX／DB／メモ |
|---------------|------|----------------|
| **D / W23** | **済（2026-05-12）** | 法規 `3.1.1`〜`3.1.3`：シリーズ **Callout**。`3.1.1` tags 調整。**`3.2.9`** ← **`3.2.7` / `3.2.8`** リンク。**DB**: [`20260512_learning_test_mapping_legal_sokusoku_mokuteki.sql`](../scripts/database/20260512_learning_test_mapping_legal_sokusoku_mokuteki.sql) 本番適用（`総則/目的` 14 問）。B-4：`pressureAltitudeIsa` テスト。 |
| **E / W24** | **済（2026-06-06）** | **Tier A**: 空力基礎 3 クラスタ → `3.2.7_LiftAndDrag`（[`20260606_learning_test_mapping_aero_lift_drag_clusters.sql`](../scripts/database/20260606_learning_test_mapping_aero_lift_drag_clusters.sql) MCP 適用）。**PPL Callout**: `3.2.7` に PPL-1-1-3/4 リンク。 |
| **F / W25** | **済（2026-06-06）** | MCP スナップショット: verified 未マッピング **47→36**、`learning_test_mapping` **73→74 行** / **64 記事**（[14](Article_Coverage_Backlog.md) ヘッダ更新）。 |
| **G / W26** | **済（2026-06-06）** | `test:coverage` → **`src` Statements 18.07%**（Phase_C §4）。A11y メモ: [`artifacts/accessibility_audit_memo_2026-06-06.md`](../artifacts/accessibility_audit_memo_2026-06-06.md)。Lane A Quiz Hub 完了。 |

---

## 7. 六月末ゲート・W25〜W26 実行チェックリスト

**実行タイミングの目安**: マッピング再集計は **W25 または W26 前半**。カバレッジ転記・01 履歴は **W26（六月末まで）**。

1. **[14 §5](Article_Coverage_Backlog.md)** と同種の MCP `execute_sql` 集計を再実行し、**ヘッダまたは §9・監査メモ**に **日付・主要数値**（verified クラスタ数、`learning_contents` 件数、`learning_test_mapping` 行数、verified 未マッピング件数など）を記載する。
2. **新規 `scripts/database/*.sql` を本番適用した場合**のみ、[scripts/database/INDEX.md](../scripts/database/INDEX.md) 更新・コミットと [14](Article_Coverage_Backlog.md) の記述一致を確認する。
3. **`npm run test:coverage`** 実行後、`coverage-final.json` から **`FlightAcademyTsx/src/` のみ**で **Statements 実効 %** を再集計（手順・定義は [Phase_C §4](Phase_C_Quality_Preparation.md)、[06 §1](06_Long_Term_Execution.md)）。
4. **[Phase_C_Quality_Preparation.md](Phase_C_Quality_Preparation.md) §4** の **「2026-06 末」**行を **実測値・日付・一言メモ**で更新する。
5. **[01_Current_Status_and_Roadmap.md](01_Current_Status_and_Roadmap.md)** に **更新履歴 1 行**。技術的負債表の **`src` 実効**が旧い場合は追随する。
6. **PPL 六月狙いが未達**のときは、[01](01_Current_Status_and_Roadmap.md) または §6 ログに **延期理由と七月継続方針**を 1 行残す（[June 実装計画 §1](June_2026_Implementation_Plan.md)）。
7. **B-4**: [06 §1.2](06_Long_Term_Execution.md) に沿い **六月のうちに 4〜8 テスト単位**を追加。`npm run test:run` が緑であること。
8. **Lighthouse / A11y**: [Phase_C §2–§3](Phase_C_Quality_Preparation.md) に従い **自動検出のみ**を `artifacts/` にメモ。**ファイル名**は `*_2026-06-*.md` 等とし、**`phase` で始めない**（`.gitignore` 衝突回避、[June 実装計画 §5](June_2026_Implementation_Plan.md)）。

---

### 変更履歴

| 日付 | 内容 |
|------|------|
| 2026-05-12 | **W23 実行**ログを §6 に追記。[05](05_Content_Pipeline.md) の W23 行を実績に更新。 |
| 2026-05-12 | 初版。W23〜W26 ブロック D〜G、六月 PPL/CPL 狙い、§7 ゲート・チェックリスト、[05](05_Content_Pipeline.md)・[June 実装計画](June_2026_Implementation_Plan.md) との連携。 |
