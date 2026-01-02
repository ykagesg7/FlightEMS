# PPL/CPL統合Syllabus管理ガイド

**作成日**: 2025年1月
**最終更新**: 2026年1月
**バージョン**: v1.1

## 📖 このドキュメントを読むべき人

- ✅ **AIアシスタント**: PPL/CPL両方のSyllabus管理方法を確認したい場合
- ✅ **コンテンツ作成者**: 記事作成時の命名規則やデータベース登録方法を確認したい場合
- ✅ **プロジェクトマネージャー**: システム統合の全体像を理解したい場合

**推奨読み順**: [docs/README.md](README.md) → [06_記事作成ロードマップ.md](06_記事作成ロードマップ.md) → [07_PPL_Master_Syllabus.md](07_PPL_Master_Syllabus.md) → このドキュメント

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

---

**次のステップ**: テンプレート作成と最初の記事作成

