# 2026年7月期 実装・コンテンツ計画

**作成日**: 2026-06-30  
**位置づけ**: [Phase C](01_Current_Status_and_Roadmap.md)（2026年6–7月）の **後半**。六月スプリント（[June_2026_Implementation_Plan.md](June_2026_Implementation_Plan.md)）完了後の実行計画。戦略の正本は [00](00_Flight_Academy_Strategy.md)、ロードマップ KPI は [01](01_Current_Status_and_Roadmap.md)、長期バックログは [06](06_Long_Term_Execution.md)。

**週次の正本**: [05_Content_Pipeline.md](05_Content_Pipeline.md) Phase 2 **週次着手記録表**。**実行メモ（ブロック H〜K・ゲート §7）**: [July_2026_Content_Sprint.md](July_2026_Content_Sprint.md)。

**六月からの引き継ぎ（2026-06-30 時点）**: verified 未マッピング **23**・`learning_test_mapping` **106 行 / 95 記事**・PPL **46/150 MDX**・Subject 2 Phase 1 **12/12 完走**・`src` Statements **18.07%**（2026-06-06）。

---

## 1. 7月期末の「DONE」条件

「7月という区切りで記録できること」を DONE とする。Phase C 全体（6–7月）の KPI は §3 を参照。

| 種別 | 2026-07 末までの DONE 条件 |
|------|---------------------------|
| **ゲート・記録** | [Phase_C_Quality_Preparation.md](Phase_C_Quality_Preparation.md) §4 に **「2027-07 末」行は不要** — **7月末スナップショット**を同 §4 または [01](01_Current_Status_and_Roadmap.md) 更新履歴に **1 行**（`npm run test:coverage` 後の `src` 実効 %・日付）。六月 **18.07%** を下回らないこと（維持）。 |
| **週次パイプライン** | **[2026-W27〜W30](05_Content_Pipeline.md)** について [05 の週次表](05_Content_Pipeline.md) に **それぞれ最低 1 行**（着手単位 2〜4 が目安。**0 でも空欄禁止**）。 |
| **マッピングサイクル** | **最低 1 サイクル**: [14 §5](Article_Coverage_Backlog.md) 再集計 → [14](Article_Coverage_Backlog.md) ヘッダ更新。**新規 `.sql` 本番適用 ≥1**（Tier A または Tier B）。verified 未マッピング **23→0 は必須としない**（段階削減）。 |
| **C-6（CPL Phase 2・マッピング）** | [14 §6–§7](Article_Coverage_Backlog.md) 上位クラスタから **≥1 本**の `learning_test_mapping` 追補または既存記事スコープ拡張を週次行に記録。候補: **着氷/着氷の防止**、**航法計器/レーダー**、**電波の伝播** 等（2026-06-30 MCP 上位）。 |
| **C-7（PPL 継続）** | Subject 2 **Phase 2 着手 ≥2 本**（[構造案 §4](content_outlines/PPL_Subject2_Aviation_Meteorology_Structure.md) の `PPL-2-2-4` / `PPL-2-3-3` / `PPL-2-3-4` 等）**または** Phase 1 記事 **≥2 本の深文化**（Compet Check Six 節追加等）。いずれかを週次で正直に記録。 |
| **CPL↔PPL Callout** | **法規 `3.1.x` ← `PPL-5-*`** の復習 Callout を **≥3 記事**に追記（[14 §1.1](Article_Coverage_Backlog.md) 監査表と整合）。気象 `3.3.3/4/12` は **2026-06-30 済**。 |
| **GA4（六月フォロー）** | Quiz Hub 投入（2026-06-06）から **4 週以降**に GA4 で **ファネル確認メモ**を `artifacts/` に 1 件（ファイル名は `phase` で始めない）。 |
| **B-4（テスト）** | [06 §1.2](06_Long_Term_Execution.md) から **追加 2〜4 テスト単位**。`npm run test:run` 緑。Phase C **`src` 15% 主目標は六月に達成済** — 7月は維持・モックしやすい純関数優先。 |
| **Phase C プロダクト（C-1〜C-5）** | **承認後のみ**コード着手。未承認時は [Phase_C §2–§3](Phase_C_Quality_Preparation.md) **監査メモのみ**（UI 無承認変更なし）。 |

---

## 2. ISO 週と [05](05_Content_Pipeline.md) への転記

| 週（ISO） | 目安締め日（表記） |
|-----------|---------------------|
| **2026-W27** | （〜2026-07-08） |
| **2026-W28** | （〜2026-07-15） |
| **2026-W29** | （〜2026-07-22） |
| **2026-W30** | （〜2026-07-29） |

**運用メモ**:

- **W30** 週末で **7月ゲート**（§7）を実施してよい。8月にまたぐ作業は [July_2026_Content_Sprint.md](July_2026_Content_Sprint.md) §6 に引き継ぎメモを残す。
- 着手本数の目安は [05 の暫定 KPI](05_Content_Pipeline.md)（**2〜4**）を踏襲。

### 2.1 W27〜W30 週別サマリー（実行メモ）

詳細チェックリストは [July コンテンツスプリント §7](July_2026_Content_Sprint.md)。実績は [05 の週次表](05_Content_Pipeline.md) が正本。

| 週 | 目安締め | フォーカス（要約） |
|----|-----------|-------------------|
| **2026-W27** | （〜2026-07-08） | **GA4 ファネル**確認メモ。法規 **`3.1.x` ← `PPL-5-*` Callout** 着手（2〜3 本）。MCP 再集計（七月第 1 サイクル）。B-4 1 単位。 |
| **2026-W28** | （〜2026-07-15） | **Tier A マッピング 1 本**（例: 着氷クラスタ → 工学 `3.2.x` または既存記事）。PPL Subject 2 **Phase 2 第 1 本**（`PPL-2-2-4` または `PPL-2-3-3`）。 |
| **2026-W29** | （〜2026-07-22） | **Tier B マッピング精緻化 1 本**（例: `3.4.x` / `3.5.x` / 航法計器レーダー）。PPL Phase 2 **第 2 本**。Callout 残り。 |
| **2026-W30** | （〜2026-07-29） | **七月末ゲート**: `test:coverage` → Phase_C / 01 更新。MCP スナップショット。B-4 追補。Phase C 後半振り返り 1 行。 |

---

## 3. Phase C（6–7月）との境界

| KPI | 六月末 | 7月の役割 |
|-----|--------|-----------|
| **`src` Statements 15%+** | **18.07% 達成** | **維持**（七月末再計測） |
| **PPL 25/150+** | **46/150 達成** | 二次 KPI — Subject 2 Phase 2 または Subject 3 着手の記録 |
| **CPL Phase 2 / マッピング** | 未マッピング **23** | **段階削減**（週次 SQL + 月次再集計） |
| **Quiz Hub / GA4** | Lane A 完了 | **計測レビューのみ**（新 UI 機能は承認制） |
| **C-1〜C-5 プロダクト** | 監査メモのみ | 承認が出るまで **着手しない** |

8月以降は [01 §Phase D](01_Current_Status_and_Roadmap.md)（cohort 拡大・PPL 50% 二次・カバレッジ 50% 北極星）へ接続。

---

## 4. コンテンツ優先順位（7月）

### 4.1 CPL / マッピング（C-6 最優先）

1. [14 §5.2](Article_Coverage_Backlog.md) 再実行 — ヘッダ数値更新
2. **Tier A** — 着氷（4 問）、空力残（揚力/抗力/三次元翼 各 1 問）等
3. **Tier B** — `3.4.x` 航法、`3.5.x` 通信、航法計器/レーダー（2 問）

### 4.2 PPL（C-7 二次）

1. **Subject 2 Phase 2** — [構造案 §4](content_outlines/PPL_Subject2_Aviation_Meteorology_Structure.md): `PPL-2-2-4`、`PPL-2-3-3`、`PPL-2-3-4`（優先 2 本以上）
2. **Phase 1 深文化** — ~~`PPL-2-2-1`~~ ✅（2026-07-01）。`PPL-2-2-2`〜`2-3-2` に試験型 `Check Six` を追加（新規 stem より後回し可）
3. **Subject 3/4** — 7月必須ではない。余力のみ

### 4.3 リンク網（Callout）

- **法規**: `3.1.1`〜`3.1.4` 等 ← 対応する `PPL-5-*`（[PPL_Subject5 構造案](content_outlines/PPL_Subject5_Aviation_Law_Structure.md)）
- **気象**: Phase 1 完了に伴い、未差し替えの `3.3.x` があれば [14 §1.1](Article_Coverage_Backlog.md) で監査

---

## 5. 原則・禁止（六月から継続）

| 項目 | 内容 |
|------|------|
| 依存バージョン | 無承認で `package.json` をバンプしない |
| `public/docs/` | 手編集禁止 — 正本は `docs/` |
| SQL 本番 | MCP 適用後 [scripts/database/INDEX.md](../scripts/database/INDEX.md) と [14](Article_Coverage_Backlog.md) を一致 |
| UI/UX | 無承認のレイアウト・トークン変更をしない |
| コミット | 英語・Conventional Commits（[git-conventions](../.cursor/rules/git-conventions.mdc)） |

---

## 6. 参照一覧

| 役割 | パス |
|------|------|
| 六月 DONE・引き継ぎ | [June_2026_Implementation_Plan.md](June_2026_Implementation_Plan.md)、[June_2026_Content_Sprint.md](June_2026_Content_Sprint.md) |
| 七月週次・ゲート | [July_2026_Content_Sprint.md](July_2026_Content_Sprint.md) |
| 週次表 | [05_Content_Pipeline.md](05_Content_Pipeline.md) |
| マッピング | [Article_Coverage_Backlog.md](Article_Coverage_Backlog.md) |
| PPL 気象 Phase 2 | [PPL_Subject2_Aviation_Meteorology_Structure.md](content_outlines/PPL_Subject2_Aviation_Meteorology_Structure.md) |
| 品質 | [Phase_C_Quality_Preparation.md](Phase_C_Quality_Preparation.md) |

---

### 変更履歴

| 日付 | 内容 |
|------|------|
| 2026-06-30 | 初版。7月 DONE・W27–W30・C-6/C-7/Callout/GA4/B-4・Phase C 境界。 |
