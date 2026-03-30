# PPL/CPL統合Syllabus管理ガイド

**作成日**: 2025年1月
**最終更新**: 2026年3月
**バージョン**: v1.2

## 📖 このドキュメントを読むべき人

- ✅ **AIアシスタント**: PPL/CPL両方のSyllabus管理方法を確認したい場合
- ✅ **コンテンツ作成者**: 記事作成時の命名規則やデータベース登録方法を確認したい場合
- ✅ **プロジェクトマネージャー**: システム統合の全体像を理解したい場合

**推奨読み順**: [docs/README.md](README.md) → [06_記事作成ロードマップ.md](06_記事作成ロードマップ.md) → [07_PPL_Master_Syllabus.md](07_PPL_Master_Syllabus.md) → このドキュメント

**関連（記事パイプライン）**: [06_記事作成ロードマップ.md](06_記事作成ロードマップ.md)、[07_PPL_Master_Syllabus.md](07_PPL_Master_Syllabus.md)、[10_航空工学_学科試験攻略ブログ_ロードマップ.md](10_航空工学_学科試験攻略ブログ_ロードマップ.md)、[11_ドキュメント整合性検討.md](11_ドキュメント整合性検討.md)

---

## 📋 概要

このドキュメントは、PPL（自家用操縦士）とCPL（事業用操縦士）の両方の学科試験対策記事を統合管理するためのガイドです。既存のCPL記事システムと新規のPPL記事システムを統合し、将来的な拡張にも対応できる柔軟な構造を提供します。

---

## 🏗️ システム統合設計

### カテゴリー体系

#### PPL記事
- **category**: `'PPL'`
- **sub_category**: 科目名（例: `'航空工学'`, `'航空気象'`, `'空中航法'`, `'航空通信'`, `'航空法規'`）

#### CPL記事
- **category**: `'CPL'`
- **sub_category**: 科目名（既存のCPL記事と同様）

#### データベース例
```sql
-- PPL記事の登録例
INSERT INTO learning_contents (
  id,
  title,
  category,
  sub_category,
  description,
  order_index,
  content_type,
  is_published
) VALUES (
  'PPL-1-1-1_AerodynamicsBasics',
  '航空力学の基礎理論',
  'PPL',
  '航空工学',
  '飛行機が飛ぶ仕組みを理解するための基礎理論を解説します。',
  1,
  'text',
  true
);

-- CPL記事の登録例（既存）
INSERT INTO learning_contents (
  id,
  title,
  category,
  sub_category,
  description,
  order_index,
  content_type,
  is_published
) VALUES (
  '3.1.2_AviationLegal1',
  '技能証明制度の完全理解',
  'CPL',
  '航空法規',
  'CPL試験で頻出される技能証明関連問題を完全攻略します。',
  2,
  'text',
  true
);
```

---

## 📝 シリーズ命名規則

### PPLシリーズ

#### 全体シリーズ
- **series**: `'PPL-Master-Syllabus'`
  - PPL Master Syllabus全体を管理
  - 全150トピックを1つのシリーズとして管理

#### 科目別シリーズ（オプション）
- **series**: `'PPL-{Subject}-{Section}'`
  - 例: `'PPL-1-1-Aerodynamics'`（航空工学-航空力学）
  - 例: `'PPL-2-1-Atmosphere'`（航空気象-大気の物理）
  - 細分化して管理したい場合に使用

#### フロントマター例
```yaml
---
title: "航空力学の基礎理論"
slug: "ppl-1-1-1-aerodynamics-basics"
tags: ['PPL', '学科試験', '航空工学', '航空力学']
series: "PPL-Master-Syllabus"
order: 1
readingTime: 15
excerpt: "飛行機が飛ぶ仕組みを理解するための基礎理論を解説します。"
publishedAt: "2025-01-XX"
author: "Whisky Papa"
type: "lesson"
---
```

### CPLシリーズ

#### 既存シリーズ
- 既存のCPL記事は既にシリーズが設定されている場合がある
- 例: `'CPL-AviationLegal'`, `'CPL-PropellerTheory'`等

#### 将来のCPL Master Syllabus
- 将来的にCPL Master Syllabusを作成する場合
- **series**: `'CPL-Master-Syllabus'`を使用可能
- 同じ構造で管理可能

---

## 🏷️ タグ体系

### 共通タグ

#### PPL記事
- **必須タグ**: `['PPL', '学科試験']`
- **科目タグ**: `['航空工学'`, `'航空気象'`, `'空中航法'`, `'航空通信'`, `'航空法規']`
- **トピックタグ**: 各トピック固有のタグ（例: `'航空力学'`, `'ベルヌーイの定理'`）

#### CPL記事
- **必須タグ**: `['CPL', '学科試験']` または `['CPL学科', '事業用操縦士']`
- **科目タグ**: PPLと同様（共通）
- **トピックタグ**: 各トピック固有のタグ

### タグの統一

#### 科目名の統一
- 科目名はPPL/CPLで共通タグを使用
- 例: `'航空工学'`, `'航空気象'`, `'空中航法'`, `'航空通信'`, `'航空法規'`

#### 検索・フィルタリング
- タグでPPL/CPLをフィルタリング可能
- 科目タグで科目別に表示可能
- シリーズで全体を表示可能

### 問題DBとの対応（`applicable_exams`）

- PPL 記事（`category: PPL`）と紐づく CPL 形式の設問は、Supabase の **`unified_cpl_questions.applicable_exams`** に `PPL` を含める（例: `{PPL,CPL}` で CPL 出題も維持）。
- タグだけでなく **DB 列**で `/test` の「PPL 基礎のみ」フィルタと整合させる。
- 詳細・パイロット手順: [docs/db/APPLICABLE_EXAMS_PILOT.md](db/APPLICABLE_EXAMS_PILOT.md)

### 問題–記事連携契約（`learning_test_mapping`）

テスト結果画面の [ReviewContentLink](src/pages/articles/components/learning/ReviewContentLink.tsx) は、**設問 UUID がマッピング行に含まれる場合**に該当記事を優先表示する。マッピングが無い場合は `learning_contents.category` による粗いフォールバックのみとなるため、**連携規約を DB 登録時に揃える**ことが重要。

#### 分類ツリー：CPL クラスタを正とする

執筆計画・ナビ・`learning_test_mapping` の単位を揃えるときの **分類ツリーの正本**は次とする。

- **正**: `unified_cpl_questions` の **`(main_subject, sub_subject 全文)`** をノードとするツリー（**CPL 学科の出題範囲に沿ったクラスタ**）。`verification_status = 'verified'` の行から実在する組み合わせを集計し、足りないノードは DB・取込で補う。
- **PPL**: 上記ツリーと**同じノード名**のまま、**`applicable_exams` に `PPL` を含む設問だけが存在する部分集合**として扱う（`/test` の PPL 基礎フィルタと一致）。PPL 専用の別名・別ツリーを正にしない。
- **記事**: `learning_contents.category` が `PPL` でも `CPL` でも、**マッピング・単元見出しで参照するクラスタ表記は CPL 側の `sub_subject`（および `main_subject`）に合わせる**。表記ゆれの正規化は [20260307_normalize_unified_cpl_sub_subjects.sql](../scripts/database/20260307_normalize_unified_cpl_sub_subjects.sql) 等に従う。

問題プールは CPL 向けに厚く、PPL はタグで切り出したサブセットであるため、**ロードマップ・優先度付けは CPL 全クラスタを見てから**、各ノードに「PPL 設問の有無・推奨記事 id」を載せる運用がブレにくい。

#### 自然キー（問題クラスタの単位）

- **主キー**: Supabase `unified_cpl_questions` の **`main_subject`**（5 科目固定）と **`sub_subject` 全文**（多くは「中分類/小分類」相当の 1 文字列）。
- **記事スコープのデフォルト**: 原則 **1 記事が 1 つの `(main_subject, sub_subject)` クラスタ**（または意図的にまとめた複数 `sub_subject`）に対応する。1 問 1 記事は避ける（[06](06_記事作成ロードマップ.md) と同旨）。
- **中分類だけ**で束ねる場合は、執筆・マッピング両方でその範囲を明示する（ナビ用の任意グループ）。

#### `learning_contents` との整合

- **`sub_category`**: **`main_subject` と同じ文字列**（例: `'航空工学'`, `'航空気象'`, `'空中航法'`, `'航空通信'`, `'航空法規'`）とする。テスト UI・推薦フォールバックと一致させる。

#### `learning_test_mapping` 行のルール

| 列 | 値のルール |
|----|------------|
| `learning_content_id` | `learning_contents.id`（MDX ファイル名の stem と一致） |
| `topic_category` | **`main_subject` と同じ**（例: 航空工学の記事なら `'航空工学'`） |
| `subject_area` | 現行データでは `topic_category` と同一でよい（将来の細分化用に列が分かれている） |
| `unified_cpl_question_ids` | 上記クラスタに含める設問の UUID 配列（`verified` を推奨） |
| `test_question_ids` | 同一 UUID の `text[]`  cast（`ReviewContentLink` が overlaps で参照） |
| `mapping_source` | 投入元が分かる短い識別子（例: `incremental_20260329_ppl_engineering`） |

PPL 基礎記事に紐づける設問は **原則 `applicable_exams` に `PPL` を含む行**に限定する（[APPLICABLE_EXAMS_PILOT.md](db/APPLICABLE_EXAMS_PILOT.md)）。

- **例外**: 当該 `sub_subject` に PPL 付き設問がまだ無いが、CPL のみ `verified` 行が存在する場合、`learning_test_mapping` には **verified のみ**で束ねてよい（CPL 試験・復習で `ReviewContentLink` を有効にする）。`mapping_source` に `_cpl_pool` 等で識別すると後から差し替えやすい。例: [20260329_learning_test_mapping_incremental_ppl_clusters.sql](../scripts/database/20260329_learning_test_mapping_incremental_ppl_clusters.sql)。

#### 登録用 SQL テンプレート

```sql
-- 例: 1 記事に 1 クラスタ（sub_subject 完全一致）
INSERT INTO learning_test_mapping (
  learning_content_id,
  content_title,
  content_category,
  test_question_ids,
  unified_cpl_question_ids,
  topic_category,
  subject_area,
  mapping_source,
  verification_status
)
SELECT
  lc.id,
  lc.title,
  lc.category,
  (SELECT COALESCE(array_agg(q.id::text ORDER BY q.id), ARRAY[]::text[])
   FROM unified_cpl_questions q
   WHERE q.verification_status = 'verified'
     AND q.main_subject = '航空工学'
     AND q.sub_subject = '空力の基礎理論/対気速度'
     AND q.applicable_exams @> ARRAY['PPL']::text[]),
  (SELECT COALESCE(array_agg(q.id ORDER BY q.id), ARRAY[]::uuid[])
   FROM unified_cpl_questions q
   WHERE q.verification_status = 'verified'
     AND q.main_subject = '航空工学'
     AND q.sub_subject = '空力の基礎理論/対気速度'
     AND q.applicable_exams @> ARRAY['PPL']::text[]),
  '航空工学',
  '航空工学',
  'manual_template',
  'verified'
FROM learning_contents lc
WHERE lc.id = 'PPL-1-1-2_AirspeedBasics'
  AND NOT EXISTS (SELECT 1 FROM learning_test_mapping m WHERE m.learning_content_id = lc.id)
  AND EXISTS (
    SELECT 1 FROM unified_cpl_questions q
    WHERE q.verification_status = 'verified'
      AND q.main_subject = '航空工学'
      AND q.sub_subject = '空力の基礎理論/対気速度'
      AND q.applicable_exams @> ARRAY['PPL']::text[]
    LIMIT 1
  );
```

バッチ更新例（CPL シリーズと併用）: [scripts/database/20260325_batch_ppl_engineering_series_and_mapping.sql](../scripts/database/20260325_batch_ppl_engineering_series_and_mapping.sql)。  
PPL 工学・計器まとめて追加する例: [scripts/database/20260329_learning_test_mapping_incremental_ppl_clusters.sql](../scripts/database/20260329_learning_test_mapping_incremental_ppl_clusters.sql)。  
気象・航法・通信の科目ハブ（`CPL-Hub-*`）と `3.2.x` 等の `learning_contents` オーファン修復: [20260330_learning_test_mapping_cpl_clusters_by_subject.sql](../scripts/database/20260330_learning_test_mapping_cpl_clusters_by_subject.sql)。  
`3.1.2_AviationLegal1` を四分位から **単一 `sub_subject` クラスタ**へ差し替えた例: [20260331_learning_test_mapping_aviation_legal_312_skill_cluster.sql](../scripts/database/20260331_learning_test_mapping_aviation_legal_312_skill_cluster.sql)。

#### 航空法規 3.1.x と四分位マッピングからの移行方針

[20260325_batch_ppl_engineering_series_and_mapping.sql](../scripts/database/20260325_batch_ppl_engineering_series_and_mapping.sql) では、**航空法規**の `learning_test_mapping` を **`id` 順の四分位**で 4 記事（`3.1.1`〜`3.1.4`）に割り振っている。クイズ誤答に **シラバス上の `sub_subject` に対応した記事**を優先して出したい場合、この四分位束は理想とズレる（同一記事行に無関係な単元の UUID が混在しうる）。

**合意したい方針（推奨）**

1. **最終形**: 各 `3.1.x`（および増設する法規記事）について、**1 記事あたり 1 クラスタ（または明示した少数クラスタ）**に対応する `unified_cpl_question_ids` を載せる（上記テンプレどおり）。
2. **移行手順**: Supabase で `main_subject = 航空法規` の `sub_subject` を件数付きで一覧し、ロードマップ・執筆計画に沿って **記事 id とクラスタを割り当て**る → 日付付きの冪等 `UPDATE` SQL を積み上げる。四分位行は **上書きまたは削除の前に、新クラスタへの再割当表をドキュメント化**する。
3. **重複**: 細分化で **同一 UUID が複数記事に入る**状態を避ける。広いハブ記事と詳細記事を併用する場合は、フロントの推薦並び（overlap 数の多い行を優先）とセットで調整する。
4. **先行事例**: `3.1.2_AviationLegal1` はクラスタ **`航空機の運航/特定操縦技能の審査等`** に紐づけ済み（`mapping_source`: `cluster_20260331_aviation_legal_skill_review`）。残りの `3.1.1` / `3.1.3` / `3.1.4` も同様に、データでクラスタを選んでから差し替える。

#### 記事 ID の正本とエイリアス

`3.x.x_*`（CPL シリーズ）、`PPL-*`（PPL シラバス）、[10](10_航空工学_学科試験攻略ブログ_ロードマップ.md) の `aero-*` / `inst-*` の関係は [11_ドキュメント整合性検討.md](11_ドキュメント整合性検討.md) **§2.4** を正とする。

---

## 📁 ファイル構造と命名規則

### ディレクトリ構造

```
src/content/lessons/
├── PPL-1-1-1_AerodynamicsBasics.mdx      # PPL記事
├── PPL-1-1-2_Performance.mdx
├── PPL-2-1-1_AtmosphereBasics.mdx
├── ...
├── 3.1.2_AviationLegal1.mdx              # 既存CPL記事
├── 3.2.1_PropellerTheory.mdx
└── ...
```

### 命名規則

#### PPL記事
- **形式**: `PPL-{Subject}-{Section}-{Topic}_{Title}.mdx`
- **Subject**: 科目番号（1-5）
- **Section**: セクション番号（1-1, 1-2等）
- **Topic**: トピック番号（1-1-1, 1-1-2等）
- **Title**: 記事タイトルの短縮形（英語推奨）

**例**:
- `PPL-1-1-1_AerodynamicsBasics.mdx`（航空工学-航空力学-空力の基礎理論）
- `PPL-2-1-1_AtmosphereBasics.mdx`（航空気象-大気の物理-大気の基礎）
- `PPL-3-1-1_NavigationBasics.mdx`（空中航法-航法一般-地球と航法要素）

#### CPL記事
- 既存の命名規則を維持
- 例: `3.1.2_AviationLegal1.mdx`, `3.2.1_PropellerTheory.mdx`

---

## 🔗 データベース統合

### learning_contentsテーブル

#### 必須フィールド
- **id**: ファイル名と一致（例: `'PPL-1-1-1_AerodynamicsBasics'`）
- **title**: 記事タイトル
- **category**: `'PPL'` または `'CPL'`
- **sub_category**: 科目名
- **description**: 記事の説明
- **order_index**: シリーズ内の順序
- **content_type**: `'text'`
- **is_published**: `true`（公開時）

#### オプションフィールド
- **parent_id**: 親記事のID（階層構造が必要な場合）

### シリーズ管理

#### シリーズ情報の設定
- MDXファイルのフロントマターで`series`と`order`を設定
- データベースには直接保存しない（MDXから動的に取得）

#### 順次アンロック機能
- 既存の`useSeriesUnlock`フックをPPL記事にも適用
- シリーズ内の順序（`order`）に基づいて前の記事完了で次が解放

---

## 🔍 検索・フィルタリング

### タグによるフィルタリング

#### PPL記事のみ表示
```typescript
const pplArticles = await getArticles({
  tags: ['PPL'],
  publishedOnly: true
});
```

#### CPL記事のみ表示
```typescript
const cplArticles = await getArticles({
  tags: ['CPL'],
  publishedOnly: true
});
```

#### 科目別表示
```typescript
const engineeringArticles = await getArticles({
  tags: ['航空工学'],
  publishedOnly: true
});
```

### シリーズによる表示

#### PPL Master Syllabus全体
```typescript
const pplSyllabus = await getArticles({
  series: 'PPL-Master-Syllabus',
  sortBy: 'order',
  sortOrder: 'asc',
  publishedOnly: true
});
```

---

## 📊 進捗管理との統合

### 既存システムの活用

#### learning_progressテーブル
- PPL記事の進捗も`learning_progress`テーブルで管理
- `content_id`でPPL/CPLを区別
- セクションベースの進捗計算をそのまま適用

#### 進捗可視化
- 進捗ダッシュボードでPPL/CPL別に表示可能
- カテゴリー別の進捗集計
- シリーズ別の進捗表示

### XP付与設定

#### PPL記事読了時
- カテゴリー: `PPL`でXP付与
- シリーズ完了でミッション達成
- 進捗ダッシュボードで可視化

#### CPL記事読了時
- 既存のXP付与設定を維持
- カテゴリー: `CPL`でXP付与

---

## 🚀 将来の拡張性

### CPL Syllabus拡張

#### 同じ構造で対応可能
- `docs/09_CPL_Master_Syllabus.md`を作成可能
- 同じテンプレート（`docs/templates/PPL_Article_Template.mdx`）を使用可能
- 同じデータベース構造で管理可能

#### シリーズ命名
- `series = 'CPL-Master-Syllabus'`を使用
- PPLと同様の構造で管理

### その他の試験種別

#### ATPL、IR等の拡張
- カテゴリー体系を拡張するだけで対応可能
- 例: `category = 'ATPL'`, `category = 'IR'`
- 同じテンプレートとデータベース構造を使用

---

## ⚠️ 注意事項

### 既存システムの保護

#### CPL記事システム
- 既存のCPL記事システムを壊さないよう注意
- 既存の命名規則を維持
- 既存のシリーズ名を変更しない

### 命名規則の統一

#### カテゴリー名
- 大文字で統一: `'PPL'`, `'CPL'`
- ハイフンは使用しない

#### シリーズ名
- PPL/CPLで明確に区別
- 衝突を避ける（例: `'PPL-Master-Syllabus'` vs `'CPL-Master-Syllabus'`）

#### タグ体系
- 科目名などは共通タグを使用
- PPL/CPLを区別するタグは必須

---

## 📚 参考資料

### 関連ドキュメント
- `docs/07_PPL_Master_Syllabus.md` - PPL Master Syllabus
- `docs/06_記事作成ロードマップ.md` - CPL記事作成ロードマップ
- `docs/10_航空工学_学科試験攻略ブログ_ロードマップ.md` - 航空工学の科目別ロードマップ（中・小分類マッピング、4ChoiceQuiz連携）
- `docs/templates/PPL_Article_Template.mdx` - PPL記事テンプレート
- `docs/05_設計仕様書.md` - データベース設計仕様

### 既存システム
- `src/utils/articlesIndex.ts` - 記事インデックスシステム
- `src/hooks/useSeriesUnlock.ts` - シリーズ順次アンロック機能
- `src/hooks/useArticleProgress.ts` - 進捗管理フック

---

## 🔄 更新履歴

| 日付 | 更新内容 | 更新者 |
|------|----------|--------|
| 2025-01 | 初版作成、PPL/CPL統合管理ガイド策定 | System |
| 2026-01 | PPL記事3件作成完了、KaTeX数式記法サポート追加、シリーズロック機能確認 | System |
| 2026-03 | 問題–記事連携契約（`learning_test_mapping`・自然キー・テンプレ）、PPL/CPL プール例外、`applicable_exams` との関係を追記 | System |
| 2026-03 | 分類ツリーの正本を CPL クラスタ（`main_subject` / `sub_subject`）と明記、PPL を同一ツリー上の部分集合として定義 | System |

---

**次のステップ**: テンプレート作成と最初の記事作成

