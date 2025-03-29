# JSONファイルのバリデーションとコンフリクト解決ガイド

このドキュメントでは、複数のブランチ間でJSONファイルの同期を行う際に発生する問題を自動的に検出・修正する方法について説明します。

## 一般的なJSONファイルのエラー

JSONファイルでよく発生する問題は以下の通りです：

1. **ルート要素の欠如**: JSONファイルはトップレベルで配列 `[]` またはオブジェクト `{}` で囲まれている必要があります
2. **余分なテキスト**: JSONファイル内にテキストや説明文が含まれている
3. **コンマの問題**: 末尾のカンマや欠落したカンマ
4. **改行コードの違い**: 異なるOSでの編集によるLF/CRLFの混在

## 自動検証と修正ツール

### 1. JSON構文検証スクリプト

以下のPythonスクリプトは、JSONファイルを検証し一般的な問題を修正します：

```python
#!/usr/bin/env python3
# json_validator.py

import json
import sys
import os
import re

def validate_and_fix_json(file_path):
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # 非JSONテキストの検出と削除
        if re.match(r'^[^{\[\n]', content.strip()):
            print(f"⚠️ 警告: {file_path} には非JSON文字列が含まれています")
            # 最初の { または [ を探して、それ以前を削除
            match = re.search(r'[{\[]', content)
            if match:
                content = content[match.start():]
                print(f"🔧 非JSON文字列を削除しました")
        
        # JSONの構文解析を試みる
        try:
            json_data = json.loads(content)
            print(f"✅ {file_path} は有効なJSONです")
            return True, content
        except json.JSONDecodeError as e:
            print(f"❌ エラー: {file_path} は無効なJSONです: {e}")
            
            # 末尾のカンマを修正
            if "Expecting ',' delimiter" in str(e):
                line_info = str(e).split('line ')[1].split()[0]
                line_num = int(line_info.rstrip(':'))
                lines = content.split('\n')
                if line_num <= len(lines):
                    lines[line_num-1] = lines[line_num-1] + ','
                    content = '\n'.join(lines)
                    print(f"🔧 行 {line_num} にカンマを追加しました")
                    # 再試行
                    try:
                        json_data = json.loads(content)
                        print(f"✅ 修正後のJSONは有効です")
                        return True, content
                    except:
                        pass
            
            # 基本的なオブジェクト/配列の括り問題を修正
            if not content.strip().startswith('{') and not content.strip().startswith('['):
                content = '[' + content
                print(f"🔧 配列開始マーカー '[' を追加しました")
            if not content.strip().endswith('}') and not content.strip().endswith(']'):
                content = content + ']'
                print(f"🔧 配列終了マーカー ']' を追加しました")
                
                # 再試行
                try:
                    json_data = json.loads(content)
                    print(f"✅ 修正後のJSONは有効です")
                    return True, content
                except:
                    pass
            
            return False, content
    except Exception as e:
        print(f"❌ ファイル読み込みエラー: {e}")
        return False, None

def fix_json_file(file_path):
    is_valid, content = validate_and_fix_json(file_path)
    
    if not is_valid and content:
        choice = input(f"🔄 {file_path} を修正しますか？ (y/n): ")
        if choice.lower() == 'y':
            backup_file = file_path + '.bak'
            os.rename(file_path, backup_file)
            try:
                with open(file_path, 'w', encoding='utf-8') as f:
                    f.write(content)
                print(f"✅ ファイルを修正しました。元のファイルは {backup_file} にバックアップされています")
                
                # 再検証
                is_valid, _ = validate_and_fix_json(file_path)
                if is_valid:
                    print(f"✅ 修正が成功しました！")
                    return True
                else:
                    print(f"❌ 自動修正だけでは解決できませんでした。手動での確認が必要です")
                    return False
            except Exception as e:
                print(f"❌ ファイル書き込みエラー: {e}")
                # バックアップファイルを復元
                os.rename(backup_file, file_path)
                return False
    
    return is_valid

def main():
    if len(sys.argv) < 2:
        print("使用方法: python json_validator.py <JSONファイルパス>")
        sys.exit(1)
    
    file_path = sys.argv[1]
    if not os.path.exists(file_path):
        print(f"❌ ファイルが見つかりません: {file_path}")
        sys.exit(1)
    
    success = fix_json_file(file_path)
    if success:
        print(f"✅ {file_path} の検証と修正が完了しました")
        sys.exit(0)
    else:
        print(f"❌ {file_path} の検証と修正に失敗しました")
        sys.exit(1)

if __name__ == "__main__":
    main()
```

### 2. Gitのマージコンフリクト時に自動的にJSONを修正

以下のシェルスクリプトを作成して、JSONファイルのコンフリクト解決を自動化できます。

```bash
#!/bin/bash
# fix_json_conflicts.sh

# コンフリクトのあるJSONファイルを見つける
CONFLICTED_FILES=$(git diff --name-only --diff-filter=U | grep -E '\.json$')

if [ -z "$CONFLICTED_FILES" ]; then
    echo "✅ JSONファイルのコンフリクトはありません"
    exit 0
fi

echo "🔍 以下のJSONファイルにコンフリクトが見つかりました:"
echo "$CONFLICTED_FILES"

# JSONバリデータースクリプトがあるか確認
JSON_VALIDATOR="./json_validator.py"
if [ ! -f "$JSON_VALIDATOR" ]; then
    echo "⚠️ json_validator.py が見つかりません。作成します..."
    # ここにスクリプトの内容を記述（省略）
    echo "Python script content would be created here" > "$JSON_VALIDATOR"
    chmod +x "$JSON_VALIDATOR"
fi

# 各ファイルのコンフリクトを解決
for file in $CONFLICTED_FILES; do
    echo "🔧 JSONファイルのコンフリクトを解決: $file"
    
    # コンフリクトマーカーの有無をチェック
    if grep -q "<<<<<<< HEAD" "$file"; then
        echo "⚠️ コンフリクトマーカーを持つJSONファイル: $file"
        
        # 一時ファイルにHeadバージョンを抽出
        sed -n '/<<<<<<< HEAD/,/=======/p' "$file" | grep -v '<<<<<<< HEAD' | grep -v '=======' > "${file}.head"
        
        # 一時ファイルにマスターバージョンを抽出
        sed -n '/=======/,/>>>>>>> master/p' "$file" | grep -v '=======' | grep -v '>>>>>>> master' > "${file}.master"
        
        # Head（現在のブランチ）バージョンを優先
        cat "${file}.head" > "$file"
        
        # JSONの検証と修正
        if python "$JSON_VALIDATOR" "$file"; then
            echo "✅ $file のコンフリクトを解決し、修正しました"
            git add "$file"
        else
            echo "❌ $file の自動解決に失敗しました。手動での確認が必要です"
        fi
        
        # 一時ファイルを削除
        rm -f "${file}.head" "${file}.master"
    else
        echo "⚠️ このファイルにはコンフリクトマーカーがありません。手動での確認が必要です: $file"
    fi
done

# 残りのコンフリクトを確認
REMAINING_CONFLICTS=$(git diff --name-only --diff-filter=U)
if [ -n "$REMAINING_CONFLICTS" ]; then
    echo "⚠️ 以下のファイルのコンフリクトは解決されていません:"
    echo "$REMAINING_CONFLICTS"
    exit 1
else
    echo "✅ すべてのJSONファイルのコンフリクトを解決しました"
fi
```

## GitHub Actionsでの自動検証

以下の設定を `.github/workflows/validate-json.yml` に追加することで、Pull Request時に自動的にJSONファイルを検証できます。

```yaml
name: Validate JSON Files

on:
  pull_request:
    paths:
      - '**.json'

jobs:
  validate-json:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      
      - name: Set up Python
        uses: actions/setup-python@v2
        with:
          python-version: '3.x'
      
      - name: Install dependencies
        run: pip install jsonschema
      
      - name: Copy JSON validator script
        run: |
          cat > json_validator.py << 'EOF'
          # ここにjson_validator.pyの内容をコピー
          EOF
          chmod +x json_validator.py
      
      - name: Validate changed JSON files
        run: |
          git diff --name-only --diff-filter=ACMRT origin/${{ github.base_ref }} | grep -E '\.json$' | xargs -I {} python json_validator.py {}
```

## ベストプラクティス

1. **正しいJSONフォーマットを使用する**:
   - 適切なインデントとフォーマット
   - 末尾のカンマを避ける
   - UTF-8エンコーディングの使用

2. **大きなJSONファイルの分割**:
   - 論理的な単位で分割
   - 参照による再利用

3. **バージョン管理時の注意点**:
   - `.gitattributes` でJSON用の設定を追加:
     ```
     *.json text eol=lf
     ```
   - フォーマッターやLinterの導入

4. **JSON Schema の作成と利用**:
   - スキーマを定義し検証を自動化
   - フィールドの説明やドキュメント化

5. **GUI JSONエディターの活用**:
   - [JSONBuddy](https://www.json-buddy.com/)
   - [JSONEditorOnline](https://jsoneditoronline.org/)
   - VS Codeの拡張機能

## トラブルシューティング

1. **「End of file expected」エラー**:
   - JSONファイルはオブジェクト `{}` または配列 `[]` で始まり、同じもので終わる必要があります
   - 余分なテキストや説明文を削除
   - ファイルが適切な括弧で囲まれているか確認

2. **「Unexpected token」エラー**:
   - 正しい引用符（ダブルクォート）を使用
   - カンマの使用が正しいか確認
   - オブジェクトキーには必ず引用符が必要

3. **エンコーディングの問題**:
   - UTF-8エンコーディングを使用
   - BOMなしUTF-8で保存

このガイドとツールを活用することで、JSONファイルのコンフリクト解決とバリデーションを効率的に行うことができます。 