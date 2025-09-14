#!/usr/bin/env node

import { execSync } from 'child_process';
import { existsSync, writeFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

class GitHooksSetup {
  constructor() {
    this.projectRoot = join(__dirname, '../../');
    this.gitHooksDir = join(this.projectRoot, '.git/hooks');
    this.scriptsDir = join(__dirname);
  }

  setupHooks() {
    console.log('🔧 Git Hooks を設定します...');

    try {
      // .git/hooks ディレクトリの確認
      if (!existsSync(this.gitHooksDir)) {
        console.error('❌ .git/hooks ディレクトリが見つかりません');
        return;
      }

      // pre-commit hook の設定
      this.setupPreCommitHook();

      // post-commit hook の設定
      this.setupPostCommitHook();

      // pre-push hook の設定
      this.setupPrePushHook();

      console.log('✅ Git Hooks の設定が完了しました');
    } catch (error) {
      console.error('❌ Git Hooks 設定エラー:', error);
    }
  }

  setupPreCommitHook() {
    const hookContent = `#!/bin/sh
# FlightAcademyTsx - Pre-commit Hook
# コミット前にドキュメント品質チェックを実行

echo "🔍 コミット前のドキュメント品質チェックを実行中..."

# ドキュメント品質チェック
cd "${this.scriptsDir}"
node validate-docs.js

if [ $? -ne 0 ]; then
    echo "❌ ドキュメント品質チェックに失敗しました"
    echo "コミットを中止します"
    exit 1
fi

echo "✅ ドキュメント品質チェックが完了しました"
exit 0
`;

    const hookPath = join(this.gitHooksDir, 'pre-commit');
    writeFileSync(hookPath, hookContent);
    execSync(`chmod +x "${hookPath}"`);
    console.log('📝 pre-commit hook を設定しました');
  }

  setupPostCommitHook() {
    const hookContent = `#!/bin/sh
# FlightAcademyTsx - Post-commit Hook
# コミット後にドキュメント自動更新を実行

echo "📚 コミット後のドキュメント自動更新を実行中..."

# ドキュメント自動更新
cd "${this.scriptsDir}"
node update-docs.js

if [ $? -eq 0 ]; then
    echo "✅ ドキュメント自動更新が完了しました"

    # 更新されたドキュメントがある場合は通知
    if git diff --name-only HEAD~1 | grep -q "docs/"; then
        echo "📝 ドキュメントが更新されました"
        echo "変更を確認してください: git diff HEAD~1 -- docs/"
    fi
else
    echo "⚠️ ドキュメント自動更新でエラーが発生しました"
fi

exit 0
`;

    const hookPath = join(this.gitHooksDir, 'post-commit');
    writeFileSync(hookPath, hookContent);
    execSync(`chmod +x "${hookPath}"`);
    console.log('📝 post-commit hook を設定しました');
  }

  setupPrePushHook() {
    const hookContent = `#!/bin/sh
# FlightAcademyTsx - Pre-push Hook
# プッシュ前に最終品質チェックを実行

echo "🚀 プッシュ前の最終品質チェックを実行中..."

# ドキュメント品質チェック
cd "${this.scriptsDir}"
node validate-docs.js

if [ $? -ne 0 ]; then
    echo "❌ 最終品質チェックに失敗しました"
    echo "プッシュを中止します"
    exit 1
fi

# 技術スタックの整合性チェック
echo "⚙️ 技術スタックの整合性を確認中..."
cd "${this.projectRoot}"

# package.json とドキュメントの整合性チェック
if ! node "${this.scriptsDir}/validate-docs.js" | grep -q "技術スタックの整合性チェック完了"; then
    echo "❌ 技術スタックの整合性チェックに失敗しました"
    exit 1
fi

echo "✅ 最終品質チェックが完了しました"
exit 0
`;

    const hookPath = join(this.gitHooksDir, 'pre-push');
    writeFileSync(hookPath, hookContent);
    execSync(`chmod +x "${hookPath}"`);
    console.log('📝 pre-push hook を設定しました');
  }

  createHuskyConfig() {
    // Husky設定ファイルの作成（オプション）
    const huskyConfig = {
      hooks: {
        'pre-commit': 'cd scripts/docs-auto-update && node validate-docs.js',
        'post-commit': 'cd scripts/docs-auto-update && node update-docs.js',
        'pre-push': 'cd scripts/docs-auto-update && node validate-docs.js'
      }
    };

    const configPath = join(this.projectRoot, '.huskyrc.json');
    writeFileSync(configPath, JSON.stringify(huskyConfig, null, 2));
    console.log('📝 Husky設定ファイルを作成しました');
  }
}

// メイン実行
if (import.meta.url === `file://${process.argv[1]}`) {
  const setup = new GitHooksSetup();
  setup.setupHooks();
}
