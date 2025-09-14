#!/usr/bin/env node

import { execSync } from 'child_process';
import chokidar from 'chokidar';
import { existsSync, readFileSync, writeFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 監視対象のファイルパターン
const WATCH_PATTERNS = [
  'src/**/*.{ts,tsx,js,jsx}',
  'package.json',
  'vite.config.ts',
  'tsconfig*.json',
  'docs/**/*.md',
  'scripts/**/*.{js,ts}'
];

// 重要な変更を検出するキーワード
const IMPORTANT_KEYWORDS = [
  'Phase',
  'TODO',
  'FIXME',
  'HACK',
  'BREAKING',
  'FEATURE',
  'BUGFIX',
  'SECURITY',
  'PERFORMANCE'
];

// 変更ログファイル
const CHANGE_LOG_FILE = join(__dirname, '../logs/changes.log');

class ChangeWatcher {
  constructor() {
    this.changes = [];
    this.isWatching = false;
  }

  start() {
    console.log('🚀 ドキュメント自動更新システムを開始します...');
    console.log('📁 監視対象:', WATCH_PATTERNS.join(', '));

    const watcher = chokidar.watch(WATCH_PATTERNS, {
      ignored: /(node_modules|\.git|dist|build)/,
      persistent: true,
      ignoreInitial: true
    });

    watcher
      .on('add', (path) => this.handleChange('add', path))
      .on('change', (path) => this.handleChange('change', path))
      .on('unlink', (path) => this.handleChange('delete', path))
      .on('error', (error) => console.error('監視エラー:', error));

    this.isWatching = true;
    console.log('✅ ファイル監視を開始しました');
  }

  async handleChange(type, filePath) {
    const timestamp = new Date().toISOString();
    const relativePath = filePath.replace(process.cwd(), '');

    console.log(`📝 ${type.toUpperCase()}: ${relativePath}`);

    // 重要な変更かどうかを判定
    const isImportant = await this.checkIfImportant(filePath, type);

    const change = {
      timestamp,
      type,
      file: relativePath,
      isImportant,
      gitStatus: this.getGitStatus(filePath)
    };

    this.changes.push(change);
    this.logChange(change);

    // 重要な変更の場合は自動更新を実行
    if (isImportant) {
      console.log('🔔 重要な変更を検出しました。ドキュメント更新を実行します...');
      await this.triggerDocUpdate(change);
    }
  }

  async checkIfImportant(filePath, changeType) {
    try {
      // ファイルの内容を読み取り
      const content = readFileSync(filePath, 'utf-8');

      // キーワードチェック
      const hasImportantKeyword = IMPORTANT_KEYWORDS.some(keyword =>
        content.includes(keyword)
      );

      // 特定のファイルタイプのチェック
      const isConfigFile = filePath.includes('package.json') ||
        filePath.includes('vite.config') ||
        filePath.includes('tsconfig');

      // ドキュメントファイルの変更
      const isDocFile = filePath.includes('/docs/');

      return hasImportantKeyword || isConfigFile || isDocFile;
    } catch (error) {
      console.error('ファイル読み取りエラー:', error);
      return false;
    }
  }

  getGitStatus(filePath) {
    try {
      const status = execSync(`git status --porcelain "${filePath}"`, {
        encoding: 'utf-8'
      }).trim();
      return status;
    } catch (error) {
      return 'unknown';
    }
  }

  logChange(change) {
    const logEntry = `[${change.timestamp}] ${change.type.toUpperCase()} ${change.file} ${change.isImportant ? '(IMPORTANT)' : ''} ${change.gitStatus}\n`;

    // ログディレクトリを作成
    const logDir = dirname(CHANGE_LOG_FILE);
    if (!existsSync(logDir)) {
      execSync(`mkdir -p "${logDir}"`);
    }

    writeFileSync(CHANGE_LOG_FILE, logEntry, { flag: 'a' });
  }

  async triggerDocUpdate(change) {
    try {
      console.log('📚 ドキュメント更新を実行中...');

      // ドキュメント更新スクリプトを実行
      execSync('node update-docs.js', {
        cwd: __dirname,
        stdio: 'inherit'
      });

      console.log('✅ ドキュメント更新が完了しました');
    } catch (error) {
      console.error('❌ ドキュメント更新エラー:', error);
    }
  }

  stop() {
    this.isWatching = false;
    console.log('🛑 ファイル監視を停止しました');
  }
}

// メイン実行
if (import.meta.url === `file://${process.argv[1]}`) {
  const watcher = new ChangeWatcher();

  // シグナルハンドリング
  process.on('SIGINT', () => {
    console.log('\n🛑 監視を停止します...');
    watcher.stop();
    process.exit(0);
  });

  watcher.start();
}
