#!/usr/bin/env node

import { existsSync, readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('🚀 ドキュメント自動更新システムのテストを開始します...');

// プロジェクトルートの確認
const projectRoot = join(__dirname, '../../');
const docsDir = join(projectRoot, 'docs');
const packageJsonPath = join(projectRoot, 'package.json');

console.log('📁 プロジェクトルート:', projectRoot);
console.log('📚 ドキュメントディレクトリ:', docsDir);
console.log('📦 package.json:', packageJsonPath);

// ファイルの存在確認
console.log('✅ docs/README.md 存在:', existsSync(join(docsDir, 'README.md')));
console.log('✅ docs/ROADMAP.md 存在:', existsSync(join(docsDir, 'ROADMAP.md')));
console.log('✅ package.json 存在:', existsSync(packageJsonPath));

// package.jsonの読み取り
try {
  const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));
  console.log('📦 プロジェクト名:', packageJson.name);
  console.log('📦 バージョン:', packageJson.version);
  console.log('📦 依存関係数:', Object.keys(packageJson.dependencies || {}).length);
} catch (error) {
  console.error('❌ package.json読み取りエラー:', error);
}

// README.mdの最終更新日を確認
try {
  const readmePath = join(docsDir, 'README.md');
  const readmeContent = readFileSync(readmePath, 'utf-8');
  const updateMatch = readmeContent.match(/\*\*📅 最終更新\*\*: (.+)/);
  if (updateMatch) {
    console.log('📅 現在の最終更新日:', updateMatch[1]);
  } else {
    console.log('⚠️ 最終更新日が見つかりません');
  }
} catch (error) {
  console.error('❌ README.md読み取りエラー:', error);
}

console.log('✅ テストが完了しました');
