# 2026年5月後半（第2〜第4週相当）コンテンツ拡充プラン

**作成日**: 2026-05-07  
**正本の位置づけ**: [01](01_Current_Status_and_Roadmap.md)「2026年5月期スプリント」と並ぶ **5月後半だけの実行メモ**。週次の数え方・KPI の正本は [05_Content_Pipeline.md](05_Content_Pipeline.md)。

---

## 1. 前提（認識の言い換え）

- **CPL** は Phase 1+2 で **主要分野の長文記事が揃っている**一方、[14](Article_Coverage_Backlog.md) のとおり **verified 未マッピング設問やクラスタの穴は残っている**（「試験 DB 上の完全網羅」とは別次元）。
- 本スプリントは **深文化（CPL）＋対応する PPL（追記または新規）** を **3 ブロック**に分けて着手する。

---

## 2. 対象ウィーク（[05](05_Content_Pipeline.md) への転記）

ISO 週のつながりは既存表に合わせ、**実作業ブロック**は次の三つとする。

| ブロック | ISO 週（目安締め） | 主目的 |
|----------|-------------------|--------|
| **A（5月第2週）** | **2026-W20**（〜2026-05-20） | **`3.2.7_LiftAndDrag`** 深文化。対応 PPL は **追記優先**（下表）。 |
| **B（5月第3週）** | **2026-W21**（〜2026-05-27） | **`3.2.8_PowerAndPerformance`** または **`3.2.9_PitotStaticSystem`** の **どちらか 1 本**を週の主軸に深文化。 |
| **C（5月第4週）** | **2026-W22**（〜2026-06-03） | **法規**（`3.1.1`〜`3.1.3` の総則・用語の芯）**または** **新規 PPL 1 テーマ**に振る。忙しければ **CPL 1 本 + PPL 追記のみ**でよい。 |

各週終わりに [05](05_Content_Pipeline.md) の週次行へ **着手単位**（2〜4 目安）を正直に記録する。

---

## 3. CPL ↔ PPL の対応（このスプリントのペア）

| 優先 | CPL（深文化） | PPL（追記 or 新規の判断） |
|------|----------------|---------------------------|
| 1 | [`3.2.7_LiftAndDrag`](../src/content/lessons/3.2.7_LiftAndDrag.mdx) | 既存 [`PPL-1-1-4_DragBasics`](../src/content/lessons/PPL-1-1-4_DragBasics.mdx)・[`PPL-1-1-3_BernoulliPrinciple`](../src/content/lessons/PPL-1-1-3_BernoulliPrinciple.mdx) に **CPL へのリンクと用語の短いブリッジ**。**新規 PPL は任意**。 |
| 2 | [`3.2.8_PowerAndPerformance`](../src/content/lessons/3.2.8_PowerAndPerformance.mdx) | 既存 [`PPL-1-1-9_FlightPerformance`](../src/content/lessons/PPL-1-1-9_FlightPerformance.mdx) を中心に追記。 |
| 2 代替 | [`3.2.9_PitotStaticSystem`](../src/content/lessons/3.2.9_PitotStaticSystem.mdx) | 既存 [`PPL-1-2-2_PitotStatic`](../src/content/lessons/PPL-1-2-2_PitotStatic.mdx) を中心に追記。 |
| 3（任意） | 法規スタブ〜本文化寄りの整理 `3.1.1`〜`3.1.3` | PPL 法規は Master 未整備が多い。**5月内は CPL 側の見出し・用語整理のみ**でも可。 |

詳細な **箇条書きブリーフ**（Gemini 投入用）は [May_2026_Late_PPL_CPL_Outlines.md](content_outlines/May_2026_Late_PPL_CPL_Outlines.md) を正とする。

---

## 4. 外部 LLM（Gemini 等）で下書きするときの方針

**推奨**: 本リポジトリの **概略箇条書き** → 外部 LLM で **初稿** → **人間または Cursor 側で MDX へ整形**の二段構え。

| 長所 | 短所・対策 |
|------|------------|
| 構成と分量の下書きが速い | 法令・数値は **必ず一次典または既存記事と照合**（非公式学習支援の注意は [00](00_Flight_Academy_Strategy.md) §3）。 |
| ターゲット読者のトーンを揃えやすい | 出力は **そのまま `src/content` に貼らない**。必ず **`export const meta`**（[PPL テンプレート](templates/PPL_Article_Template.mdx)／既存 CPL の書式）に合わせる。 |
| 複数記事の並列がしやすい | 新規 PPL/CPL は **`learning_contents` / `learning_test_mapping`** を別作業として [08](08_Syllabus_Management_Guide.md)・Skill に従う。 |

**Gemini への指示に含めるとよいもの**（短文でよい）:

1. 当該記事の **ブリーフ原文**（`content_outlines` の箇条書きをそのまま貼る）。
2. **禁止**: YAML フロントマター（本プロジェクトは **`export const meta`**）、出典のない具体的法条番号の断定。
3. **必須**: 既存記事への内部リンク形式 `/articles/{id}`、文体は既存 Michizane 調に寄せるかどうか一言。

詳細チェックリスト: [templates/External_LLM_Article_Brief.md](templates/External_LLM_Article_Brief.md)。

---

## 5. 参照

- [Article_Coverage_Backlog.md](Article_Coverage_Backlog.md) §6–§7  
- [PPL_Master_Syllabus.md](PPL_Master_Syllabus.md)  
- [June_2026_Implementation_Plan.md](June_2026_Implementation_Plan.md)（6月への接続）

---

### 変更履歴

| 日付 | 内容 |
|------|------|
| 2026-05-07 | 初版。5月後半3ブロック・CPL/PPL 対応・Gemini 連携方針。 |
