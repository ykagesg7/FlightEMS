#!/usr/bin/env node

import fs from 'fs';
import path from 'path';

// 対象ディレクトリとファイル拡張子
const targetDirs = ['src', 'public', 'docs'];
const targetExtensions = new Set(['.ts', '.tsx', '.js', '.jsx', '.md', '.mdx', '.json', '.css', '.html']);

// BOM検出関数
function hasBOM(filePath) {
  try {
    const buffer = fs.readFileSync(filePath);
    return buffer.length >= 3 &&
      buffer[0] === 0xEF &&
      buffer[1] === 0xBB &&
      buffer[2] === 0xBF;
  } catch (error) {
    console.error(`Error reading file ${filePath}:`, error.message);
    return false;
  }
}

// ファイルを再帰的に検索
function findFilesWithBOM(dir) {
  const filesWithBOM = [];

  function walk(currentDir) {
    try {
      const items = fs.readdirSync(currentDir);

      for (const item of items) {
        const fullPath = path.join(currentDir, item);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory()) {
          walk(fullPath);
        } else if (targetExtensions.has(path.extname(item))) {
          if (hasBOM(fullPath)) {
            filesWithBOM.push(fullPath);
          }
        }
      }
    } catch (error) {
      console.error(`Error accessing directory ${currentDir}:`, error.message);
    }
  }

  walk(dir);
  return filesWithBOM;
}

// メイン処理
function main() {
  console.log('🔍 Checking for BOM in files...\n');

  const allFilesWithBOM = [];

  for (const dir of targetDirs) {
    if (fs.existsSync(dir)) {
      const filesWithBOM = findFilesWithBOM(dir);
      allFilesWithBOM.push(...filesWithBOM);
    }
  }

  if (allFilesWithBOM.length === 0) {
    console.log('✅ No files with BOM found!');
    process.exit(0);
  } else {
    console.log(`❌ Found ${allFilesWithBOM.length} file(s) with BOM:\n`);
    allFilesWithBOM.forEach(file => {
      console.log(`  - ${file}`);
    });
    console.log('\n💡 Run "npm run fix:encoding" to automatically remove BOM from these files.');
    process.exit(1);
  }
}

main();
