# コンテンツ・パイプライン（段階2 の配信と記事の作り方）

**作成日**: 2025年1月16日  
**最終更新**: 2026年9月23日（段階2 の CP / FN / メンタリティ配信表へ改稿。段階1 の Phase 表・週次 W18〜W35・暫定 KPI は [Closed_Sprints.md](Closed_Sprints.md) と git 履歴へ）  
**バージョン**: v2.0.0

**読む人**: 記事を書く・配信を組む人と AI アシスタント。方針は [Product_North_Star_and_GTM.md](Product_North_Star_and_GTM.md) §0、ワークストリームは [01](01_Current_Status_and_Roadmap.md) §2、週末の弧は [ops/Weekend_Content_Pipeline.md](ops/Weekend_Content_Pipeline.md)。

---

## 1. 配信ルール（段階2）

- **週3本**。1本目は日曜（17:00 JST の digest と同時に読める）、2・3本目は水・金。
- **1週1シリーズ**を基本にする。メンタリティは CP / FN の週に **+1 本まで**混ぜてよい。水増しして5本にしない。
- 公開は MDX の `meta.publishedAt`（JST）と `learning_contents.is_published` を cron `article-publish-sync`（毎日 00:10 JST）が揃える。schedule 正本は [`api/_lib/articlePublishSchedule.ts`](../api/_lib/articlePublishSchedule.ts)。
- schedule に載せるのは **MDX が main にある話だけ**。MDX と schedule は同じ PR に入れる。
- 公開確認は Skill `article-publish-check`。人手で `is_published` を回さない。

## 2. シリーズ別の配信表

| シリーズ | 置き場所 | 在庫（2026-09-23） | 次にやること | 執筆正本 |
|----------|----------|--------------------|--------------|----------|
| **CP**（Contact） | `src/content/lessons/CP-*` | 1-1〜5-5 の MDX（5-5 まで W39 に schedule 済）。**5-6〜5-9 は DB 行のみで MDX なし** | 5-6 Split-S/Immelmann、5-7 Cuban Eight、5-8 Cloverleaf、5-9 Chandelle の MDX | [Contact_Transition_2026](content_outlines/Contact_Transition_2026/README.md)、[Gemini_CP_FN_System_Prompt](ops/Gemini_CP_FN_System_Prompt.md) |
| **FN**（旧 FMT Season 1。id は `FMT-1-*`） | `src/content/lessons/FMT-1-*` | 1-1〜1-10 の MDX がストック（`is_published: false`） | CP が git 上で完結した週から、Editorial が開始週を決める | [FN_Formation_2026](content_outlines/FN_Formation_2026/README.md)、[Gemini_CP_FN_System_Prompt](ops/Gemini_CP_FN_System_Prompt.md) |
| **メンタリティ**（道真稿） | `src/content/articles/` | `1.1.1`〜`1.1.4` 公開。残り **24 本**は非公開ゲート | 1 本ずつ道真稿に改稿し、個別に再公開（28 本一括の republish SQL は使わない） | [04](04_Operations_Guide.md)「ブログ記事の精査・非公開・再公開」、[Gemini_Memoir_Article_System_Prompt](ops/Gemini_Memoir_Article_System_Prompt.md) |
| 訓練の当たり前（`4.1.*` / `4.2.*`） | `src/content/articles/` | W32〜W33 に公開済 | 追加は Editorial が決める | [ops/Weekend_Content_Pipeline.md](ops/Weekend_Content_Pipeline.md) |
| CPL / PPL 学科 | `src/content/lessons/` | 段階1 完了（[Closed_Sprints.md](Closed_Sprints.md)） | 穴埋めのみ（例: `PPL-2-3-3` / `2-3-4` は骨子だけ） | [08](08_Syllabus_Management_Guide.md)、[PPL_Master_Syllabus.md](PPL_Master_Syllabus.md) |

## 3. 週次の配信記録

1週1行。遅れた週も空白にせず理由を書く。W35 以前は git 履歴。

| 週（ISO） | 配信 | メモ |
|-----------|------|------|
| 2026-W36（〜09-07） | CP 2-4 / 2-5 / 2-6 | CP Season 2 完結 |
| 2026-W37（〜09-14） | CP 3-1 / 3-2 / 4-1 | |
| 2026-W38（〜09-21） | CP 4-2 / 5-1 / 5-2（9/13・16・18） | |
| 2026-W39（〜09-28） | CP 5-3 / 5-4 / 5-5（9/20・23・25） | `is_published` は cron |
| 2026-W40（〜10-05） | 未定 | CP 5-6 以降は MDX が先。無ければ FN かメンタリティを Editorial で選ぶ |

---

## 4. 記事の作り方（共通）

### MDX の契約

- メタは ESM `export const meta`。**YAML frontmatter は禁止**（`.cursor/rules/mdx-article-guide.mdc`）。
- Gemini などの下書きは Markdown 本文のみ受け取り、レビュー後に MDX 化する。脱AI臭は Skill `mdx-ai-smell-inspect`（診断のみ）。
- 公開済み MDX のファイル名・slug・id は変えない（URL と DB が壊れる）。

### 学科記事（CPL / PPL）

- CPL 記事は CPL 出題範囲に絞り、PPL と重なる基礎は短い要約と **PPL 記事へのリンク**（「基礎を復習（PPL）」Callout）にする。共通の定義・法規は PPL 記事を正本にする（[00 §4](00_Flight_Academy_Strategy.md)）。
- 分類ツリーの正本は CPL クラスタ（`unified_cpl_questions` の `(main_subject, sub_subject)`）。PPL は `applicable_exams` に `PPL` を含む設問の部分集合として扱う（[08](08_Syllabus_Management_Guide.md)）。
- 既に同トピックの `PPL-*` 記事があれば新規 ID で重複執筆しない。`learning_test_mapping` の追加で足りる。
- 粒度は 1 トピック 1 記事。

### 手順

1. 問題データの抽出（学科のみ）: `unified_cpl_questions` を `main_subject` / `sub_subject` で絞り、`importance_score` と `appearance_frequency` で優先度を付ける。
2. 構成: 学習目標、出題傾向、問題例（学科は最低3問）、解説、試験対策のポイント。操縦記事（CP / FN）は各執筆正本の「1 話の型」に従う。
3. MDX を置く。`meta.series` / `order` を設定する。
4. `learning_contents` に登録する（Skill `learning-contents-registration`）。学科は `learning_test_mapping` も（連携契約は [08](08_Syllabus_Management_Guide.md)「問題–記事連携契約」）。
5. 品質確認: 内容の正確性、問題との関連、記事↔Quiz の動作。航空安全の判断が絡むときは agent `aviation-safety-review`。

### 学科記事の品質基準

- 学習目標、出題傾向、試験問題の引用（3問以上）と解説、試験対策のポイント、関連テストへのリンク、参考書籍、`series` / `order` がある。
- 目安: 基本記事 3,000〜5,000 字、詳細記事 5,000〜8,000 字。計算問題には図解、概念説明には表。

---

## 5. データベース連携

| テーブル | 役割 |
|----------|------|
| `learning_contents` | 記事メタ（カテゴリ、`order_index`、`is_published`） |
| `learning_test_mapping` | 記事と設問の対応（`unified_cpl_question_ids`）。`v_mapped_questions` で関連問題を取得 |
| `unified_cpl_questions` | 設問のソース。`applicable_exams` で PPL / CPL を切り分け（`scripts/database/20260324_add_unified_cpl_applicable_exams.sql`） |

CPL Phase 1（19本）の進捗は [db/CPL_KPI_and_Database_Operations.md](db/CPL_KPI_and_Database_Operations.md)。CPL シリーズの索引は [09_CPL_Learning_Stub.md](09_CPL_Learning_Stub.md)。航空工学の単元対照は [10_航空工学_学科試験攻略ブログ_ロードマップ.md](10_航空工学_学科試験攻略ブログ_ロードマップ.md)。
