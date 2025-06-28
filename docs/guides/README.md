# FlightAcademyTsx - 総合技術ガイド

このドキュメントでは、FlightAcademyTsxで使用される技術的なガイドをまとめています。

## 目次

1. [論理プレゼンテーションSQLガイド](#論理プレゼンテーションsqlガイド)
2. [手動SQL実行ガイド](#手動sql実行ガイド)
3. [MarkItDownセットアップガイド](#markitdownセットアップガイド)

## 論理プレゼンテーションSQLガイド

### 概要
このガイドでは、学習記事「論理プレゼンテーション」で使用されるSQL文の詳細な解説を提供します。学習者が実際にデータベースを操作することで、論理的な情報整理能力を向上させることを目的としています。

### データベース設計の背景

論理プレゼンテーションにおける情報整理の考え方：
1. **構造化された思考**: 情報を階層的に整理する
2. **論理的な関連性**: データ間の関係を明確にする
3. **効率的な検索**: 必要な情報を迅速に取得する

### 実践SQL例

```sql
-- プレゼンテーション構造テーブル
CREATE TABLE presentation_structure (
    id SERIAL PRIMARY KEY,
    section_name VARCHAR(100) NOT NULL,
    section_order INTEGER,
    parent_section_id INTEGER REFERENCES presentation_structure(id),
    content_summary TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- サンプルデータの挿入
INSERT INTO presentation_structure (section_name, section_order, content_summary) VALUES
('導入', 1, 'プレゼンテーションの目的と概要'),
('現状分析', 2, '現在の状況の詳細な分析'),
('課題特定', 3, '特定された問題点の列挙'),
('解決策提案', 4, '具体的な改善案の提示'),
('実行計画', 5, 'ステップバイステップの実装方法'),
('まとめ', 6, '結論と次のアクション');

-- 論理的な情報取得
SELECT 
    section_name,
    section_order,
    content_summary,
    CASE 
        WHEN section_order <= 2 THEN '問題提起フェーズ'
        WHEN section_order <= 4 THEN '分析・提案フェーズ'
        ELSE '実行・結論フェーズ'
    END as presentation_phase
FROM presentation_structure
ORDER BY section_order;
```

## 手動SQL実行ガイド

### 概要
FlightAcademyTsxでSupabaseデータベースに対して手動でSQL文を実行する方法を説明します。

### 前提条件
- Supabaseプロジェクトへのアクセス権限
- SQL文の基本的な理解
- データベーススキーマの把握

### 実行手順

#### 1. Supabase管理画面へのアクセス
1. [Supabase](https://supabase.com)にログイン
2. FlightAcademyTsxプロジェクトを選択
3. 左サイドバーから「SQL Editor」を選択

#### 2. SQL文の実行
```sql
-- 例: 学習進捗の確認
SELECT 
    profiles.username,
    learning_contents.title,
    user_progress.progress_percentage,
    user_progress.last_accessed
FROM user_progress
JOIN profiles ON user_progress.user_id = profiles.id
JOIN learning_contents ON user_progress.content_id = learning_contents.id
WHERE user_progress.progress_percentage > 50
ORDER BY user_progress.last_accessed DESC;
```

#### 3. 安全な実行のためのチェックリスト
- [ ] SELECT文から開始する（データの確認）
- [ ] WHERE句で対象を限定する
- [ ] 本番データに影響する前にテスト環境で確認
- [ ] バックアップの確認

### よく使用するSQL例

```sql
-- ユーザー統計の取得
SELECT 
    COUNT(*) as total_users,
    COUNT(CASE WHEN created_at >= CURRENT_DATE - INTERVAL '30 days' THEN 1 END) as new_users_30d,
    COUNT(CASE WHEN last_sign_in_at >= CURRENT_DATE - INTERVAL '7 days' THEN 1 END) as active_users_7d
FROM auth.users;

-- 人気記事の分析
SELECT 
    lc.title,
    lc.category,
    COUNT(up.user_id) as total_readers,
    AVG(up.progress_percentage) as avg_completion
FROM learning_contents lc
LEFT JOIN user_progress up ON lc.id = up.content_id
GROUP BY lc.id, lc.title, lc.category
ORDER BY total_readers DESC
LIMIT 10;
```

## MarkItDownセットアップガイド

### 概要
MarkItDownは、様々なファイル形式をMarkdown形式に変換するPythonライブラリです。FlightAcademyTsxでは、学習コンテンツの作成と管理に使用されます。

### インストール手順

#### 1. Python環境の確認
```bash
python --version
# Python 3.8以上が必要
```

#### 2. MarkItDownのインストール
```bash
pip install markitdown
```

#### 3. 依存関係のインストール
```bash
# PDFサポート用
pip install pymupdf

# Officeドキュメントサポート用
pip install python-docx openpyxl

# 画像処理用
pip install pillow
```

### 基本的な使用方法

#### Python スクリプトでの使用例
```python
from markitdown import MarkItDown

# MarkItDownインスタンスの作成
md = MarkItDown()

# PDFファイルをMarkdownに変換
with open('document.pdf', 'rb') as f:
    result = md.convert(f)
    print(result.text_content)

# WordファイルをMarkdownに変換
with open('document.docx', 'rb') as f:
    result = md.convert(f)
    print(result.text_content)
```

#### コマンドラインでの使用
```bash
# 単一ファイルの変換
markitdown document.pdf > output.md

# 複数ファイルの一括変換
for file in *.pdf; do
    markitdown "$file" > "${file%.pdf}.md"
done
```

### FlightAcademyTsxでの活用例

#### 学習コンテンツの作成フロー
1. **素材収集**: PDF資料、Word文書、PowerPointスライド
2. **Markdown変換**: MarkItDownを使用して一括変換
3. **MDX化**: ReactコンポーネントとMarkdownの統合
4. **品質確認**: 変換結果の校正と調整
5. **デプロイ**: 学習システムへの統合

#### 自動化スクリプト例
```python
import os
from markitdown import MarkItDown
from pathlib import Path

def convert_learning_materials(input_dir, output_dir):
    """学習素材を一括でMDXに変換"""
    md = MarkItDown()
    
    for file_path in Path(input_dir).glob('*'):
        if file_path.suffix in ['.pdf', '.docx', '.pptx']:
            try:
                with open(file_path, 'rb') as f:
                    result = md.convert(f)
                
                # MDXヘッダーの追加
                mdx_content = f"""---
title: "{file_path.stem}"
category: "自動変換"
description: "{file_path.name}から自動変換された学習コンテンツ"
order: 999
---

{result.text_content}
"""
                
                output_path = Path(output_dir) / f"{file_path.stem}.mdx"
                with open(output_path, 'w', encoding='utf-8') as f:
                    f.write(mdx_content)
                    
                print(f"変換完了: {file_path.name} -> {output_path.name}")
                
            except Exception as e:
                print(f"変換エラー: {file_path.name} - {str(e)}")

# 使用例
convert_learning_materials('./raw_materials', '../src/content')
```

### トラブルシューティング

#### よくある問題と解決方法

1. **文字化け問題**
   ```python
   # エンコーディングを明示的に指定
   with open(output_path, 'w', encoding='utf-8') as f:
       f.write(content)
   ```

2. **画像の処理**
   ```python
   # 画像パスの調整
   content = content.replace('![](', '![](/images/content/')
   ```

3. **表の整形**
   ```python
   # Markdown表の調整
   import re
   content = re.sub(r'\|(.+)\|', lambda m: '|' + '|'.join(cell.strip() for cell in m.group(1).split('|')) + '|', content)
   ```

---

最終更新日: 2025年1月12日 