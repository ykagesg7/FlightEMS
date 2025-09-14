#!/usr/bin/env node

import { format } from 'date-fns';
import { existsSync, readFileSync, writeFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

class DocUpdater {
  constructor() {
    this.projectRoot = join(__dirname, '../../');
    this.docsDir = join(this.projectRoot, 'docs');
    this.srcDir = join(this.projectRoot, 'src');
    this.packageJsonPath = join(this.projectRoot, 'package.json');
  }

  async updateAllDocs() {
    console.log('📚 ドキュメント自動更新を開始します...');

    try {
      // 1. プロジェクト情報の収集
      const projectInfo = this.collectProjectInfo();

      // 2. 各ドキュメントの更新
      await this.updateReadme(projectInfo);
      await this.updateRoadmap(projectInfo);
      await this.updateFeatures(projectInfo);

      // 3. 更新履歴の記録
      this.recordUpdate();

      console.log('✅ ドキュメント更新が完了しました');
    } catch (error) {
      console.error('❌ ドキュメント更新エラー:', error);
      throw error;
    }
  }

  collectProjectInfo() {
    const packageJson = JSON.parse(readFileSync(this.packageJsonPath, 'utf-8'));

    return {
      name: packageJson.name,
      version: packageJson.version,
      dependencies: packageJson.dependencies,
      devDependencies: packageJson.devDependencies,
      scripts: packageJson.scripts,
      lastUpdated: format(new Date(), 'yyyy-MM-dd'),
      techStack: this.extractTechStack(packageJson)
    };
  }

  extractTechStack(packageJson) {
    const deps = { ...packageJson.dependencies, ...packageJson.devDependencies };

    return {
      frontend: {
        react: deps.react,
        typescript: deps.typescript,
        tailwindcss: deps.tailwindcss,
        'react-router-dom': deps['react-router-dom'],
        '@tanstack/react-query': deps['@tanstack/react-query']
      },
      backend: {
        '@supabase/supabase-js': deps['@supabase/supabase-js'],
        '@supabase/auth-helpers-react': deps['@supabase/auth-helpers-react']
      },
      build: {
        vite: deps.vite,
        '@vitejs/plugin-react': deps['@vitejs/plugin-react']
      },
      testing: {
        vitest: deps.vitest,
        '@testing-library/react': deps['@testing-library/react']
      }
    };
  }

  async updateReadme(projectInfo) {
    const readmePath = join(this.docsDir, 'README.md');
    if (!existsSync(readmePath)) return;

    let content = readFileSync(readmePath, 'utf-8');

    // 最終更新日の更新
    content = content.replace(
      /\*\*📅 最終更新\*\*: .*/,
      `**📅 最終更新**: ${projectInfo.lastUpdated}`
    );

    // バージョン情報の更新
    content = content.replace(
      /### ✅ 最新完了 \(Phase \d+ - \d{4}年\d+月\)/,
      `### ✅ 最新完了 (Phase 5 - ${projectInfo.lastUpdated})`
    );

    // 技術スタック情報の追加（存在しない場合）
    if (!content.includes('## 技術スタック')) {
      const techStackSection = this.generateTechStackSection(projectInfo.techStack);
      content += `\n\n## 技術スタック\n\n${techStackSection}`;
    }

    writeFileSync(readmePath, content);
    console.log('📝 README.md を更新しました');
  }

  async updateRoadmap(projectInfo) {
    const roadmapPath = join(this.docsDir, 'ROADMAP.md');
    if (!existsSync(roadmapPath)) return;

    let content = readFileSync(roadmapPath, 'utf-8');

    // 更新履歴の追加
    const updateEntry = `- ${projectInfo.lastUpdated}: 自動更新システムによる定期更新
  - 技術スタック情報の最新化
  - プロジェクト進捗の反映`;

    const updateHistoryIndex = content.indexOf('## 更新履歴');
    if (updateHistoryIndex !== -1) {
      const beforeHistory = content.substring(0, updateHistoryIndex);
      const afterHistory = content.substring(updateHistoryIndex);
      const historyStart = afterHistory.indexOf('\n') + 1;

      content = beforeHistory +
        '## 更新履歴\n\n' +
        updateEntry + '\n' +
        afterHistory.substring(historyStart);
    }

    writeFileSync(roadmapPath, content);
    console.log('📝 ROADMAP.md を更新しました');
  }

  async updateFeatures(projectInfo) {
    const featuresPath = join(this.docsDir, 'FEATURES.md');
    if (!existsSync(featuresPath)) return;

    let content = readFileSync(featuresPath, 'utf-8');

    // 最新の機能更新情報を追加
    const latestUpdate = `### ${projectInfo.lastUpdated} - 自動更新システム導入

- **ドキュメント自動更新システム**: 重要な変更の自動検出とドキュメント更新
- **レビュープロセス強化**: 品質チェック体制の構築
- **技術スタック管理**: 依存関係の自動追跡と更新`;

    // 既存の更新履歴セクションを探す
    const updateSectionIndex = content.indexOf('### 2025年1月 - UI/UX大幅改善');
    if (updateSectionIndex !== -1) {
      const beforeUpdate = content.substring(0, updateSectionIndex);
      const afterUpdate = content.substring(updateSectionIndex);

      content = beforeUpdate + latestUpdate + '\n\n' + afterUpdate;
    } else {
      // セクションが見つからない場合は末尾に追加
      content += `\n\n${latestUpdate}`;
    }

    writeFileSync(featuresPath, content);
    console.log('📝 FEATURES.md を更新しました');
  }

  generateTechStackSection(techStack) {
    return `### フロントエンド
- React ${techStack.frontend.react}
- TypeScript ${techStack.typescript}
- Tailwind CSS ${techStack.frontend.tailwindcss}
- React Router ${techStack.frontend['react-router-dom']}
- React Query ${techStack.frontend['@tanstack/react-query']}

### バックエンド
- Supabase ${techStack.backend['@supabase/supabase-js']}
- Supabase Auth ${techStack.backend['@supabase/auth-helpers-react']}

### ビルド・開発
- Vite ${techStack.build.vite}
- ESLint (最新版)
- Vitest ${techStack.testing.vitest}

### インフラ
- Vercel (ホスティング)
- Supabase Cloud (データベース)
- GitHub Actions (CI/CD)`;
  }

  async recordUpdate() {
    const logPath = join(__dirname, '../logs/doc-updates.log');
    const logEntry = `[${new Date().toISOString()}] ドキュメント自動更新実行\n`;

    // ログディレクトリを作成
    const logDir = dirname(logPath);
    if (!existsSync(logDir)) {
      const { execSync } = await import('child_process');
      execSync(`mkdir -p "${logDir}"`);
    }

    writeFileSync(logPath, logEntry, { flag: 'a' });
  }
}

// メイン実行
if (import.meta.url === `file://${process.argv[1]}`) {
  const updater = new DocUpdater();
  updater.updateAllDocs().catch(console.error);
}
