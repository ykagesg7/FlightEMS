# Githubワークフロー：ブランチマージとコンフリクト解決の自動化ガイド

このドキュメントでは、`master`ブランチと`main`ブランチの間でコンフリクトが発生した場合の解決手順と、その自動化方法について説明します。

## 基本的なワークフロー

1. **ブランチの同期確認**
2. **マージ実行**
3. **コンフリクト解決**
4. **コミットとプッシュ**

## 自動化のためのスクリプト

### 1. 準備：必要なツールのインストール

Gitとjqがインストールされていることを確認してください。

```bash
# jqのインストール（Windowsの場合はChocolateyを使用）
choco install jq

# Linuxの場合
# apt-get install jq
```

### 2. 自動マージスクリプト（`merge_branches.sh`）

以下のスクリプトを`merge_branches.sh`として保存します。

```bash
#!/bin/bash
# 
# master から main へのマージを自動化するスクリプト
#

set -e  # エラー発生時に停止

# リポジトリのディレクトリに移動
REPO_DIR="$(pwd)"
cd "$REPO_DIR"

echo "🔄 リポジトリ: $REPO_DIR"

# リモートの最新情報を取得
echo "📥 リモートからの最新情報を取得中..."
git fetch origin

# mainブランチがあるか確認
if git show-ref --verify --quiet refs/heads/main; then
    echo "✅ mainブランチが存在します。mainブランチに切り替えます。"
    git checkout main
else
    echo "❌ mainブランチが存在しません。リモートからmainブランチを取得します。"
    if git show-ref --verify --quiet refs/remotes/origin/main; then
        git checkout -b main origin/main
    else
        echo "❌ リモートにもmainブランチがありません。masterブランチをもとにmainを作成します。"
        git checkout -b main
    fi
fi

# mainブランチを最新にする
echo "📥 mainブランチを最新にします..."
git pull origin main || echo "⚠️ リモートからのプルでエラーが発生しましたが、継続します。"

# masterブランチが存在するか確認
if git show-ref --verify --quiet refs/heads/master; then
    echo "✅ masterブランチが存在します。"
    git checkout master
    
    echo "📥 masterブランチを最新にします..."
    git pull origin master || echo "⚠️ リモートからのプルでエラーが発生しましたが、継続します。"
    
    # masterの変更をmainにマージ
    git checkout main
    echo "🔄 masterブランチの変更をmainにマージします..."
    
    # --allow-unrelated-histories オプションを使用
    if ! git merge master --allow-unrelated-histories; then
        echo "⚠️ マージコンフリクトが発生しました。コンフリクトを自動解決します..."
        
        # JSONファイルのコンフリクトを自動解決
        CONFLICTED_FILES=$(git diff --name-only --diff-filter=U | grep -E '\.json$')
        
        for file in $CONFLICTED_FILES; do
            if [ -f "$file" ]; then
                echo "🔧 JSONファイルのコンフリクトを解決: $file"
                
                # JSONファイルの検証と修正
                content=$(cat "$file")
                
                # 最初の行がテキストの場合、削除して配列開始に修正
                if [[ $content == ウェイポイントデータ* ]]; then
                    echo "🔧 非JSON文字列を削除して配列開始を追加します"
                    content=$(echo "$content" | sed '1d')
                    content="[$content"
                fi
                
                # JSONが配列で囲まれていない場合、配列で囲む
                if [[ ! $content =~ ^\[ && ! $content =~ ^\{ ]]; then
                    echo "🔧 配列で囲みます: $file"
                    content="[$content]"
                fi
                
                # ファイルに書き込む
                echo "$content" > "$file"
                
                # ステージングに追加
                git add "$file"
                echo "✅ $file のコンフリクトを解決しました"
            fi
        done
        
        # その他のファイルは手動でマージ
        REMAINING_CONFLICTS=$(git diff --name-only --diff-filter=U)
        if [ -n "$REMAINING_CONFLICTS" ]; then
            echo "⚠️ 以下のファイルは手動でコンフリクトを解決する必要があります:"
            echo "$REMAINING_CONFLICTS"
            exit 1
        fi
        
        # コンフリクトを解決した変更をコミット
        git commit -m "Merge branch 'master' into main (自動コンフリクト解決)"
    fi
    
    # GitHub にプッシュ
    echo "📤 変更を GitHub にプッシュします..."
    git push origin main
    
    echo "✅ マージとプッシュが完了しました！"
else
    echo "❌ masterブランチが存在しません。マージする必要はありません。"
fi
```

### 3. TypeScriptファイル向けのコンフリクト解決スクリプト（追加機能）

より高度なコンフリクト解決が必要な場合、以下のスクリプトを`resolve_ts_conflicts.js`として保存します。

```javascript
// resolve_ts_conflicts.js
const fs = require('fs');
const path = require('path');

// コンフリクトのあるファイルを取得
const execSync = require('child_process').execSync;
const conflictedFiles = execSync('git diff --name-only --diff-filter=U | grep -E "\\.(ts|tsx)$"')
  .toString().trim().split('\n');

if (!conflictedFiles[0]) {
  console.log('TypeScriptファイルのコンフリクトはありません');
  process.exit(0);
}

// 各ファイルのコンフリクトを解決
conflictedFiles.forEach(filePath => {
  if (!fs.existsSync(filePath)) return;
  
  console.log(`TypeScriptファイルのコンフリクトを解決: ${filePath}`);
  
  let content = fs.readFileSync(filePath, 'utf8');
  
  // コンフリクトマーカーのパターン
  const conflictPattern = /<<<<<<< HEAD\n([\s\S]*?)\n=======\n([\s\S]*?)>>>>>>> master/g;
  
  // 基本的に HEAD（main）の内容を優先するが、比較的単純なケースのみ
  content = content.replace(conflictPattern, (match, mainCode, masterCode) => {
    // 特定のパターンによって適切な方を選択
    if (mainCode.includes('import') && !masterCode.includes('import')) {
      return mainCode; // mainのインポート宣言を優先
    } else if (masterCode.includes('import') && !mainCode.includes('import')) {
      return masterCode; // masterのインポート宣言を優先
    } else if (mainCode.includes('function') && masterCode.includes('function')) {
      // 両方に関数定義がある場合、両方を含める
      return `${mainCode}\n\n// 以下はmasterからマージされた実装\n/* ${masterCode} */`;
    } else {
      // デフォルトではmainを優先
      return mainCode;
    }
  });
  
  fs.writeFileSync(filePath, content);
  
  // 変更をステージング
  execSync(`git add "${filePath}"`);
  console.log(`✅ ${filePath} のコンフリクトを解決しました`);
});
```

## 使用方法

1. **スクリプトの実行権限を付与**

```bash
chmod +x merge_branches.sh
```

2. **スクリプトを実行**

```bash
./merge_branches.sh
```

3. **自動的に解決できないコンフリクトがある場合**

```bash
# TypeScriptファイルの自動解決を試みる
node resolve_ts_conflicts.js

# それでも残るコンフリクトは手動で解決
# 各ファイルを開いて<<<<<<< HEAD、=======、>>>>>>> masterのマーカーを編集
# 解決後:
git add .
git commit -m "Merge branch 'master' into main (手動コンフリクト解決)"
git push origin main
```

## 注意事項

- このスクリプトはJSONファイルのコンフリクトを自動的に解決しようとしますが、複雑なケースでは手動での確認が必要です。
- 重要なファイルには必ずバックアップを取ってから実行してください。
- GitHub Actionsを使用して定期的に自動実行することも可能です。

## GitHub Actionsでの自動化（オプション）

`.github/workflows/merge-branches.yml`を作成することで、定期的なマージを自動化できます。

```yaml
name: Merge master to main

on:
  schedule:
    - cron: '0 0 * * *'  # 毎日UTC 0:00に実行
  workflow_dispatch:  # 手動実行も可能

jobs:
  merge:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
        with:
          fetch-depth: 0
      
      - name: Set Git Config
        run: |
          git config user.name "GitHub Actions"
          git config user.email "actions@github.com"
      
      - name: Run Merge Script
        run: |
          chmod +x merge_branches.sh
          ./merge_branches.sh
```

これにより、masterからmainへの定期的なマージが自動化され、単純なコンフリクトも自動的に解決されます。 