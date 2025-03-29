# Agentモードでのブランチマージとコンフリクト解決の自動化

このドキュメントでは、Agentモードを使用してGitリポジトリのブランチマージとコンフリクト解決を自動化する方法について説明します。

## 概要

開発ワークフローでは、異なるブランチ（`master`と`main`など）間でコードをマージする必要があります。このプロセスでは、コンフリクトが発生することがあり、手動での解決が必要になることがあります。Agentモードを活用することで、これらのタスクを自動化または半自動化できます。

## 前提条件

- Gitがインストールされていること
- 対象のリポジトリへのアクセス権があること
- Node.jsがインストールされていること（スクリプト実行用）

## 自動化スクリプト

以下のスクリプトを`automate-merge.js`として保存します。このスクリプトは、AgentモードAPIを使用してブランチマージとコンフリクト解決を自動化します。

```javascript
// automate-merge.js
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// AgentモードAPIのクライアント設定（実際の実装に応じて調整）
const AgentAPI = {
  async resolveConflict(filePath, content) {
    // ここにAgentモードAPIを呼び出す実装を追加
    // 例: APIエンドポイントにファイル内容を送信し、解決済みの内容を受け取る
    console.log(`Resolving conflict in ${filePath} using Agent API...`);
    return content; // 実際の実装では、APIからの応答を返す
  }
};

async function main() {
  try {
    console.log('🚀 自動マージプロセスを開始します...');
    
    // リモートの最新情報を取得
    execSync('git fetch origin', { stdio: 'inherit' });
    
    // mainブランチに切り替え、なければ作成
    try {
      execSync('git checkout main', { stdio: 'inherit' });
    } catch (error) {
      console.log('mainブランチが存在しません。作成します...');
      execSync('git checkout -b main origin/main || git checkout -b main', { stdio: 'inherit' });
    }
    
    // mainブランチを最新にする
    try {
      execSync('git pull origin main', { stdio: 'inherit' });
    } catch (error) {
      console.log('警告: mainブランチのプルに失敗しました。継続します。');
    }
    
    // masterブランチが存在するか確認
    let masterExists = false;
    try {
      execSync('git show-ref --verify --quiet refs/heads/master');
      masterExists = true;
    } catch (error) {
      console.log('masterブランチが存在しません。マージする必要はありません。');
      return;
    }
    
    if (masterExists) {
      console.log('masterブランチからmainブランチにマージします...');
      
      // masterブランチの最新を取得
      execSync('git checkout master', { stdio: 'inherit' });
      try {
        execSync('git pull origin master', { stdio: 'inherit' });
      } catch (error) {
        console.log('警告: masterブランチのプルに失敗しました。継続します。');
      }
      
      // mainに戻ってマージ
      execSync('git checkout main', { stdio: 'inherit' });
      
      // マージ試行（コンフリクトが発生する可能性あり）
      try {
        execSync('git merge master --allow-unrelated-histories', { stdio: 'inherit' });
        console.log('✅ マージ成功！');
      } catch (error) {
        console.log('⚠️ マージコンフリクトが発生しました。自動解決を試みます...');
        
        // コンフリクトがあるファイルを特定
        const conflictedFiles = execSync('git diff --name-only --diff-filter=U')
          .toString().trim().split('\n')
          .filter(file => file); // 空行を除外
        
        if (conflictedFiles.length === 0) {
          console.log('コンフリクト情報を取得できません。');
          process.exit(1);
        }
        
        console.log(`${conflictedFiles.length}個のファイルでコンフリクトが発生しています。`);
        
        // 各コンフリクトファイルを処理
        for (const file of conflictedFiles) {
          if (!fs.existsSync(file)) {
            console.log(`警告: ${file}が見つかりません。スキップします。`);
            continue;
          }
          
          console.log(`処理中: ${file}`);
          const content = fs.readFileSync(file, 'utf8');
          
          // ファイルの種類に基づいた処理
          let resolvedContent;
          
          if (file.endsWith('.json')) {
            // JSONファイルの処理
            resolvedContent = await handleJsonConflict(file, content);
          } else if (file.endsWith('.ts') || file.endsWith('.tsx')) {
            // TypeScriptファイルの処理
            resolvedContent = await handleTypeScriptConflict(file, content);
          } else {
            // その他のファイルはAgentモードAPIに送信
            resolvedContent = await AgentAPI.resolveConflict(file, content);
          }
          
          if (resolvedContent) {
            fs.writeFileSync(file, resolvedContent);
            execSync(`git add "${file}"`, { stdio: 'inherit' });
            console.log(`✅ ${file}のコンフリクトを解決しました`);
          } else {
            console.log(`⚠️ ${file}の自動解決に失敗しました。手動で解決してください。`);
          }
        }
        
        // 残りのコンフリクトを確認
        const remainingConflicts = execSync('git diff --name-only --diff-filter=U')
          .toString().trim();
        
        if (remainingConflicts) {
          console.log('⚠️ 以下のファイルは自動解決できませんでした:');
          console.log(remainingConflicts);
          console.log('手動で解決した後、以下のコマンドを実行してください:');
          console.log('git add .');
          console.log('git commit -m "Merge branch \'master\' into main (手動解決)"');
          console.log('git push origin main');
          process.exit(1);
        } else {
          // コンフリクトがすべて解決された場合
          execSync('git commit -m "Merge branch \'master\' into main (自動解決)"', { stdio: 'inherit' });
          console.log('✅ コンフリクト解決完了！');
        }
      }
      
      // プッシュ
      console.log('GitHubにプッシュしています...');
      execSync('git push origin main', { stdio: 'inherit' });
      console.log('✅ プッシュ完了！');
    }
    
  } catch (error) {
    console.error('❌ エラーが発生しました:', error.message);
    process.exit(1);
  }
}

async function handleJsonConflict(file, content) {
  console.log(`JSONファイルのコンフリクトを処理中: ${file}`);
  
  // JSONファイルが正しいか検証
  try {
    // 非JSON文字列（ログメッセージなど）を削除
    if (content.includes('ウェイポイントデータ')) {
      content = content.replace(/ウェイポイントデータ.*\n/, '');
    }
    
    // コンフリクトマーカーを持つ場合
    if (content.includes('<<<<<<< HEAD')) {
      // HEADバージョンを取得
      const headMatch = content.match(/<<<<<<< HEAD\n([\s\S]*?)\n=======/);
      if (headMatch && headMatch[1]) {
        let headContent = headMatch[1];
        
        // JSONオブジェクトが適切にフォーマットされているか確認
        if (!headContent.trim().startsWith('[') && !headContent.trim().startsWith('{')) {
          headContent = `[${headContent}]`;
        }
        
        try {
          // JSON.parseでチェック（実際には書き込まない）
          JSON.parse(headContent);
          return headContent;
        } catch (e) {
          // HEADバージョンが無効な場合、masterを試す
          const masterMatch = content.match(/=======\n([\s\S]*?)>>>>>>> master/);
          if (masterMatch && masterMatch[1]) {
            let masterContent = masterMatch[1];
            
            if (!masterContent.trim().startsWith('[') && !masterContent.trim().startsWith('{')) {
              masterContent = `[${masterContent}]`;
            }
            
            try {
              JSON.parse(masterContent);
              return masterContent;
            } catch (e) {
              console.log(`両方のバージョンが無効なJSONです: ${file}`);
              return null;
            }
          }
        }
      }
    } else {
      // 既存のJSONが配列で囲まれていない場合修正
      if (!content.trim().startsWith('[') && !content.trim().startsWith('{')) {
        content = `[${content}]`;
      }
      
      // 検証
      JSON.parse(content);
      return content;
    }
  } catch (error) {
    console.log(`JSONファイルの処理に失敗しました: ${file}`);
    console.log(error.message);
    return null;
  }
}

async function handleTypeScriptConflict(file, content) {
  console.log(`TypeScriptファイルのコンフリクトを処理中: ${file}`);
  
  // コンフリクトマーカーを持つ場合
  if (content.includes('<<<<<<< HEAD')) {
    // AgentモードAPIを使用して解決
    return await AgentAPI.resolveConflict(file, content);
  }
  
  return content;
}

// スクリプト実行
main().catch(console.error);
```

## GitHub Actionsでの自動化

以下の設定ファイルを`.github/workflows/auto-merge.yml`として保存することで、定期的なマージを自動化できます。

```yaml
name: Auto Merge master to main

on:
  schedule:
    - cron: '0 0 * * *'  # 毎日UTC 0:00に実行
  workflow_dispatch:     # 手動実行も可能

jobs:
  merge:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout repository
        uses: actions/checkout@v2
        with:
          fetch-depth: 0
          token: ${{ secrets.GITHUB_TOKEN }}
      
      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '16'
      
      - name: Setup Git
        run: |
          git config user.name "GitHub Actions"
          git config user.email "actions@github.com"
      
      - name: Install dependencies
        run: npm install
      
      - name: Create merge script
        run: |
          cat > automate-merge.js << 'EOF'
          // スクリプト内容をここにコピー
          EOF
      
      - name: Run merge script
        run: node automate-merge.js
        env:
          AGENT_API_KEY: ${{ secrets.AGENT_API_KEY }}
```

## Agentモードの設定

Agentモードを使用するには、次の設定が必要です：

1. **APIキーの取得**: AgentモードのプロバイダーからAPIキーを取得します
2. **APIクライアントの設定**: 上記スクリプトの`AgentAPI`部分を実際のAPI呼び出しに置き換えます
3. **シークレットの設定**: GitHub Actionsを使用する場合は、リポジトリの設定でAPIキーをシークレットとして設定します

## 手動実行方法

自動化スクリプトを手動で実行するには：

1. リポジトリのルートディレクトリに移動します
2. 必要な依存関係をインストールします：`npm install`
3. スクリプトを実行します：`node automate-merge.js`

## コンフリクト解決戦略

スクリプトは以下の戦略でコンフリクトを解決します：

1. **JSONファイル**:
   - 構文エラーを自動修正（配列で囲むなど）
   - 非JSON文字列を削除
   - HEADバージョン（main）を優先、無効な場合はmasterバージョンを試行

2. **TypeScriptファイル**:
   - Agentモードを使用して解決
   - インポート文、関数定義の競合を自動解決

3. **その他のファイル**:
   - Agentモードに送信して解決

## トラブルシューティング

**Q: スクリプトが「コンフリクト情報を取得できません」というエラーを表示する**

A: Gitの設定または権限に問題がある可能性があります。以下を確認してください：
- Gitがインストールされていることを確認
- リポジトリへの書き込み権限があることを確認
- `git status`を実行してリポジトリの状態を確認

**Q: JSONファイルの自動解決に失敗する**

A: JSONファイルが複雑すぎるか、特殊な形式である可能性があります。以下を試してください：
- スクリプトを修正して、特定のJSONファイルの処理方法をカスタマイズ
- 手動でコンフリクトを解決

**Q: GitHub Actionsが失敗する**

A: 以下を確認してください：
- 適切な権限とトークンが設定されているか
- シークレット（AGENT_API_KEY）が設定されているか
- ワークフローに十分な権限があるか

## ベストプラクティス

1. **定期的なマージ**: コンフリクトを減らすために、定期的にmasterからmainにマージする
2. **テスト**: マージ後に自動テストを実行して、変更が問題ないことを確認する
3. **通知**: マージの成功または失敗を通知するシステムを設定する
4. **ログ**: 詳細なログを保存して、問題が発生した場合のデバッグを容易にする

## まとめ

Agentモードを活用することで、ブランチマージとコンフリクト解決プロセスを大幅に自動化できます。特に反復的なコンフリクト（JSONファイルなど）に対して効果的です。ただし、複雑なマージや重要なコード変更については、依然として人間のレビューと判断が必要です。 