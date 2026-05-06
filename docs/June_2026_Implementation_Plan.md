# 2026年6月期 実装・コンテンツ計画

**作成日**: 2026-05-07  
**位置づけ**: [Phase C](01_Current_Status_and_Roadmap.md)（2026年6–7月）の **前半**にあたる、**コンテンツ拡充と品質基盤**に焦点を絞った実行計画。戦略・柱の正本は [00_Flight_Academy_Strategy.md](00_Flight_Academy_Strategy.md)、ロードマップ・フェーズ KPI は [01](01_Current_Status_and_Roadmap.md)、長期バックログは [06_Long_Term_Execution.md](06_Long_Term_Execution.md)。

**週次の正本**: [05_Content_Pipeline.md](05_Content_Pipeline.md) Phase 2 の **週次着手記録表**と **Phase 2 暫定 KPI**。本ファイルはその **6月ぶんのゴール設定と優先順位** をまとめる。

---

## 1. 6月期末の「DONE」条件（クローズの定義）

[01 の 5月スプリント記録節](01_Current_Status_and_Roadmap.md)と同型に、6月のみの完了条件を次で固定する。**継続タスクは終わらない**前提で、「6月という区切りで記録できること」を DONE とする。

| 種別 | 2026-06 末までの DONE 条件 |
|------|---------------------------|
| **ゲート・記録** | [Phase_C_Quality_Preparation.md](Phase_C_Quality_Preparation.md) §4 に **「2026-06 末」行**を追加または更新し、`npm run test:coverage` 後の **`FlightAcademyTsx/src/` の Statements 実効 %** と日付・一言メモを記入。[01](01_Current_Status_and_Roadmap.md) に **更新履歴 1 行**、技術的負債表の **`src` 実効**が古い場合は追随。 |
| **週次パイプライン** | **[2026-W23〜W26](05_Content_Pipeline.md)** について、[05 の週次着手記録表](05_Content_Pipeline.md) に **それぞれ最低 1 行**を追記（着手数・内容は [05 の「着手単位」](05_Content_Pipeline.md) に沿って **0 でもよいが空欄禁止**）。 |
| **マッピングサイクル** | **最低 1 サイクル必須**: [14 §5](Article_Coverage_Backlog.md) に基づき、Supabase MCP `execute_sql` で **現状スナップショット**（§1 と整合する集計クエリの再実行）を取り、[14](Article_Coverage_Backlog.md) ヘッダまたは §9・監査メモに **日付・主要数値**を反映。**新規 `.sql`** を本番適用する場合のみ [scripts/database/](scripts/database/) 投入と [INDEX.md](scripts/database/INDEX.md) を更新。**verified 未マッピング 69→0 は必須としない**。 |
| **CPL（深文化・Phase 2）** | **[14 §6–§7](Article_Coverage_Backlog.md)** の Tier A/B と [10](10_航空工学_学科試験攻略ブログ_ロードマップ.md) を参照し、**拡張単元 `3.2.7`〜`3.2.9` の体裁・出典・リンク**、[14](Article_Coverage_Backlog.md) 上位クラスタへの **マッピング準備または追補**のいずれかを **週次行に正直に記録**。新規 CPL 本体 MDX が無い週でもよい。 |
| **PPL（C-7／二次 KPI）** | Phase C KPI は **「PPL 25/150 以上」が 6–7月合算**。6月のみの達成強制としない。**6月の狙い**: (1) [PPL_Master_Syllabus.md](PPL_Master_Syllabus.md) の未済トピックから **新規 `PPL-*.mdx` を ≥1 本**、または (2) **CPL の未リンク記事への PPL 復習 Callout を ≥3 単位累計**。どちらも難しい場合は [05 の週次メモと 01 の更新履歴](01_Current_Status_and_Roadmap.md) に **延期理由と 7月継続方針**を 1 行残す。**UI レイアウト変更は DESIGN・承認の原則**に従う。 |
| **B-4（テスト）** | [06 §1.2](06_Long_Term_Execution.md) の優先層から **追加 4〜8 テスト単位**（複数ファイル可）。`npm run test:run` 緑。**`src` 実効 15%** は Phase C **7月末までの主目標**のため、6月のみで未達でも可。増分時は **`swimNotamCore` / `dashboard` の分岐、`services/` の純粋関数** 等、モックしやすい塊から。 |
| **Phase C のプロダクト改修（C-1〜C-5）** | **ブランド・SEO・PWA・本格 A11y・Lighthouse CI** は DESIGN・スコープ承認が必要。**6月中にコードへ着手する場合**は別途承認済みとして [01 Phase C](01_Current_Status_and_Roadmap.md) とリンク。**未承認の場合**は、[Phase_C §2–§3](Phase_C_Quality_Preparation.md) に沿った **監査・アーティファクトの蓄積のみ** でよい（UI の無承認変更はしない）。 |

---

## 2. ISO 週と [05](05_Content_Pipeline.md) への転記順

5月末の続きとして、[05 の表](05_Content_Pipeline.md) に以下の見出し週が **順に**載ることを期待する（**日付は 5–6月の表と同様の約束表記**。実クローズはプロジェクトで統一中の「日〜金」運用に合わせてよい）。

| 週（ISO） | 目安締め日（表記） |
|-----------|---------------------|
| **2026-W23** | （〜2026-06-10） |
| **2026-W24** | （〜2026-06-17） |
| **2026-W25** | （〜2026-06-24） |
| **2026-W26** | （〜2026-07-01） |

**運用メモ**:

- **W26** が月境界をまたぐ。**6月末ゲートの数値・メモ**は **[Phase_C の 2026-06 末行](Phase_C_Quality_Preparation.md)** と [01 の更新履歴](01_Current_Status_and_Roadmap.md) に集約してよい。
- 各週の「着手本数」は [05 の暫定 KPI](05_Content_Pipeline.md)（**着手単位 2〜4**）をそのまま目安とする。

---

## 3. コンテンツの優先順位（提案）

順序は [00](00_Flight_Academy_Strategy.md) の CPL 主軸に合わせる。

### 3.1 CPL（最優先）

1. **[14 §6 Tier A/B](Article_Coverage_Backlog.md)** — データ駆動の未マッピング上位クラスタ。新規長文または既存記事スコープ拡張＋マッピング行の両方またはいずれか。
2. **工学 `3.2.7`〜`3.2.9`** — W18 の「次深化候補」で挙げ済み。**深文化のみ**でも週次の妥当な着手になる。
3. **法規・通信の既存 3.x** — メタ同期・条文注・クイズ導線（`learning_contents` / `mapping_source`）。

### 3.2 PPL（二次・Phase C C-7）

- [07](PPL_Master_Syllabus.md) の **未チェック**トピックのうち、**CPL 記事から自然に張れる**順に `PPL-*` を増やすか、まず CPL 側の Callout で **不足リンクを削る**（5月実施済みパターンの継続）。

### 3.3 運用リンク

- 記事登録・メタ同期: [.cursor/rules/supabase-article-registration.mdc](../.cursor/rules/supabase-article-registration.mdc) および [.cursor/skills/learning-contents-registration/SKILL.md](../.cursor/skills/learning-contents-registration/SKILL.md)。

---

## 4. B-4 と「15%」の関係（6月中の読み）

- **`src` 実効 Statements 15%**（ストレッチ 18%）は [01 KPI](01_Current_Status_and_Roadmap.md)・[Phase_C §4](Phase_C_Quality_Preparation.md) の **Phase C の主目標**。
- **6月末**までに達しなくても計画不履行としない。**6月の義務は** 「テストを段階的に足し、[Phase_C と 01 の数値記録が破綻しないこと](Phase_C_Quality_Preparation.md)」。

---

## 5. アーティファクトと Phase C 準備

- Lighthouse HTML / axe は [Phase_C §2–§3](Phase_C_Quality_Preparation.md) に従い **`artifacts/`** に蓄積。**ファイル名**: 5月の [`accessibility_audit_memo`](../artifacts/accessibility_audit_memo_2026-05-06.md) とぶつからないよう `*_2026-06-*.md` 等とする。**注意**: `.gitignore` は `phase*.md` と衝突しうるので、**ファイル名は `phase` で始めない**。  
- 持続可能性のたたき台: [Sustainability_API_Memo.md](Sustainability_API_Memo.md) と [00 §3](00_Flight_Academy_Strategy.md)。

---

## 6. 原則・禁止（5月計画との継続）

| 項目 | 内容 |
|------|------|
| 依存バージョン | 無承認で `package.json` をバンプしない |
| `public/docs/` | **手編集禁止** — 正本は `docs/`、`npm run sync:public-docs` 等 |
| SQL 本番 | MCP／手順に従い、適用済みコミットと [14](Article_Coverage_Backlog.md) を一致させる |
| `tsc -b` 一括 | 計画対象外（[06 §1.4](06_Long_Term_Execution.md)） |
| UI/UX | 無承認のレイアウト・トークン変更をしない |

---

## 7. コミット・レビューの勧め

- Conventional Commits・**英語タイトル**（[git-conventions](../.cursor/rules/git-conventions.mdc)）。
- **コンテンツ（MDX）**と **DB/SQL**と **Vitest**は、可能なら **別コミット**に分けるとレビューしやすい。

---

## 8. 参照一覧

| 役割 | パス |
|------|------|
| 戦略・3本柱 | [00_Flight_Academy_Strategy.md](00_Flight_Academy_Strategy.md) |
| フェーズ KPI・Phase C | [01_Current_Status_and_Roadmap.md](01_Current_Status_and_Roadmap.md) |
| 週次表・Phase 2 | [05_Content_Pipeline.md](05_Content_Pipeline.md) |
| マッピング・スナップショット | [Article_Coverage_Backlog.md](Article_Coverage_Backlog.md)、[scripts/database/INDEX.md](scripts/database/INDEX.md) |
| 品質・カバレッジ・Lighthouse メモ | [Phase_C_Quality_Preparation.md](Phase_C_Quality_Preparation.md) |
| PPL の木 | [PPL_Master_Syllabus.md](PPL_Master_Syllabus.md) |

---

### 変更履歴

| 日付 | 内容 |
|------|------|
| 2026-05-07 | 初版。6月のみの DONE 条件・W23–W26・CPL/PPL の優先と B-4・Phase C 準備の境界を定義。 |
