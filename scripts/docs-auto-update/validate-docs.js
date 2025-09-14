#!/usr/bin/env node

import { format } from 'date-fns';
import { existsSync, readdirSync, readFileSync, writeFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

class DocValidator {
  constructor() {
    this.projectRoot = join(__dirname, '../../');
    this.docsDir = join(this.projectRoot, 'docs');
    this.validationResults = [];
    this.errors = [];
    this.warnings = [];
  }

  async validateAllDocs() {
    console.log('🔍 ドキュメント品質チェックを開始します...');

    try {
      // 1. ドキュメント構造の検証
      await this.validateDocStructure();

      // 2. 内容の品質チェック
      await this.validateContent();

      // 3. リンクの検証
      await this.validateLinks();

      // 4. 技術スタックの整合性チェック
      await this.validateTechStack();

      // 5. レポート生成
      this.generateReport();

      console.log('✅ ドキュメント品質チェックが完了しました');
      return this.validationResults;
    } catch (error) {
      console.error('❌ ドキュメント品質チェックエラー:', error);
      throw error;
    }
  }

  async validateDocStructure() {
    console.log('📁 ドキュメント構造を検証中...');

    const requiredFiles = [
      'README.md',
      'ROADMAP.md',
      'FEATURES.md',
      'development/DEVELOPMENT.md',
      'improvement-proposals/'
    ];

    for (const file of requiredFiles) {
      const filePath = join(this.docsDir, file);
      if (!existsSync(filePath)) {
        this.errors.push(`必須ファイルが見つかりません: ${file}`);
      } else {
        this.validationResults.push(`✅ ${file} が存在します`);
      }
    }

    // ディレクトリ構造のチェック
    const subdirs = ['development', 'improvement-proposals', 'guides', 'troubleshooting'];
    for (const dir of subdirs) {
      const dirPath = join(this.docsDir, dir);
      if (existsSync(dirPath)) {
        const files = readdirSync(dirPath).filter(f => f.endsWith('.md'));
        this.validationResults.push(`📂 ${dir}/: ${files.length}個のMarkdownファイル`);
      }
    }
  }

  async validateContent() {
    console.log('📝 ドキュメント内容を検証中...');

    const docFiles = this.getAllMarkdownFiles();

    for (const file of docFiles) {
      const content = readFileSync(file, 'utf-8');
      const relativePath = file.replace(this.docsDir, '');

      // 基本的な品質チェック
      const checks = [
        { name: 'ファイルサイズ', check: () => content.length > 100 },
        { name: 'タイトル存在', check: () => content.includes('# ') },
        { name: '更新日記載', check: () => content.includes('更新') || content.includes('Update') },
        { name: '目次構造', check: () => content.includes('## ') || content.includes('### ') }
      ];

      for (const check of checks) {
        if (!check.check()) {
          this.warnings.push(`${relativePath}: ${check.name}が不足しています`);
        }
      }

      // 特定のキーワードチェック
      const importantKeywords = ['FlightAcademy', 'React', 'TypeScript', 'Supabase'];
      const missingKeywords = importantKeywords.filter(keyword => !content.includes(keyword));

      if (missingKeywords.length > 0) {
        this.warnings.push(`${relativePath}: 重要なキーワードが不足: ${missingKeywords.join(', ')}`);
      }

      this.validationResults.push(`📄 ${relativePath}: 基本チェック完了`);
    }
  }

  async validateLinks() {
    console.log('🔗 リンクを検証中...');

    const docFiles = this.getAllMarkdownFiles();
    const brokenLinks = [];

    for (const file of docFiles) {
      const content = readFileSync(file, 'utf-8');
      const relativePath = file.replace(this.docsDir, '');

      // Markdownリンクの抽出
      const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
      let match;

      while ((match = linkRegex.exec(content)) !== null) {
        const linkText = match[1];
        const linkUrl = match[2];

        // 内部リンクの検証
        if (linkUrl.startsWith('./') || linkUrl.startsWith('../') || linkUrl.startsWith('/')) {
          const targetPath = join(dirname(file), linkUrl);
          if (!existsSync(targetPath)) {
            brokenLinks.push({
              file: relativePath,
              link: linkUrl,
              text: linkText
            });
          }
        }
      }
    }

    if (brokenLinks.length > 0) {
      this.errors.push(`破損したリンクが${brokenLinks.length}個見つかりました`);
      brokenLinks.forEach(link => {
        this.warnings.push(`${link.file}: "${link.text}" -> ${link.link}`);
      });
    } else {
      this.validationResults.push('✅ すべての内部リンクが有効です');
    }
  }

  async validateTechStack() {
    console.log('⚙️ 技術スタックの整合性を検証中...');

    const packageJsonPath = join(this.projectRoot, 'package.json');
    const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));

    // ROADMAP.mdの技術スタックと比較
    const roadmapPath = join(this.docsDir, 'ROADMAP.md');
    if (existsSync(roadmapPath)) {
      const roadmapContent = readFileSync(roadmapPath, 'utf-8');

      const techStackInDocs = this.extractTechStackFromDocs(roadmapContent);
      const techStackInPackage = this.extractTechStackFromPackage(packageJson);

      // バージョンの整合性チェック
      for (const [lib, version] of Object.entries(techStackInPackage)) {
        if (techStackInDocs[lib] && techStackInDocs[lib] !== version) {
          this.warnings.push(`技術スタックのバージョン不一致: ${lib} (docs: ${techStackInDocs[lib]}, package: ${version})`);
        }
      }
    }

    this.validationResults.push('✅ 技術スタックの整合性チェック完了');
  }

  extractTechStackFromDocs(content) {
    const techStack = {};
    const versionRegex = /- (\w+)\s+([\d.]+)/g;
    let match;

    while ((match = versionRegex.exec(content)) !== null) {
      techStack[match[1]] = match[2];
    }

    return techStack;
  }

  extractTechStackFromPackage(packageJson) {
    const deps = { ...packageJson.dependencies, ...packageJson.devDependencies };
    const importantLibs = [
      'react', 'typescript', 'vite', 'vitest', '@supabase/supabase-js',
      'tailwindcss', 'react-router-dom', '@tanstack/react-query'
    ];

    const techStack = {};
    importantLibs.forEach(lib => {
      if (deps[lib]) {
        techStack[lib] = deps[lib];
      }
    });

    return techStack;
  }

  getAllMarkdownFiles() {
    const files = [];

    const scanDir = (dir) => {
      const items = readdirSync(dir, { withFileTypes: true });

      for (const item of items) {
        const fullPath = join(dir, item.name);

        if (item.isDirectory()) {
          scanDir(fullPath);
        } else if (item.name.endsWith('.md')) {
          files.push(fullPath);
        }
      }
    };

    scanDir(this.docsDir);
    return files;
  }

  generateReport() {
    const reportPath = join(__dirname, '../logs/validation-report.md');
    const timestamp = format(new Date(), 'yyyy-MM-dd HH:mm:ss');

    let report = `# ドキュメント品質チェックレポート

**生成日時**: ${timestamp}
**エラー数**: ${this.errors.length}
**警告数**: ${this.warnings.length}

## 📊 検証結果

### ✅ 成功項目
${this.validationResults.map(result => `- ${result}`).join('\n')}

`;

    if (this.errors.length > 0) {
      report += `### ❌ エラー
${this.errors.map(error => `- ${error}`).join('\n')}

`;
    }

    if (this.warnings.length > 0) {
      report += `### ⚠️ 警告
${this.warnings.map(warning => `- ${warning}`).join('\n')}

`;
    }

    report += `## 📈 品質指標

- **ドキュメント数**: ${this.getAllMarkdownFiles().length}
- **エラー率**: ${((this.errors.length / this.getAllMarkdownFiles().length) * 100).toFixed(1)}%
- **警告率**: ${((this.warnings.length / this.getAllMarkdownFiles().length) * 100).toFixed(1)}%

## 🔧 推奨アクション

${this.errors.length > 0 ? '- エラーの修正を優先してください' : '- エラーはありません'}
${this.warnings.length > 0 ? '- 警告の確認と改善を検討してください' : '- 警告はありません'}
- 定期的な品質チェックの継続を推奨します
`;

    // ログディレクトリを作成
    const logDir = dirname(reportPath);
    if (!existsSync(logDir)) {
      const { execSync } = require('child_process');
      execSync(`mkdir -p "${logDir}"`);
    }

    writeFileSync(reportPath, report);
    console.log(`📋 レポートを生成しました: ${reportPath}`);

    // コンソール出力
    console.log('\n📊 検証結果サマリー:');
    console.log(`✅ 成功: ${this.validationResults.length}項目`);
    console.log(`❌ エラー: ${this.errors.length}項目`);
    console.log(`⚠️ 警告: ${this.warnings.length}項目`);
  }
}

// メイン実行
if (import.meta.url === `file://${process.argv[1]}`) {
  const validator = new DocValidator();
  validator.validateAllDocs().catch(console.error);
}
