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

// BOM除去関数
function removeBOM(filePath) {
  try {
    const buffer = fs.readFileSync(filePath);
    const content = buffer.toString('utf8').replace(/^\uFEFF/, '');
    fs.writeFileSync(filePath, content, { encoding: 'utf8' });
    return true;
  } catch (error) {
    console.error(`Error processing file ${filePath}:`, error.message);
    return false;
  }
}

// ファイルを再帰的に検索してBOM除去
function fixFilesWithBOM(dir) {
  const fixedFiles = [];
  const failedFiles = [];

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
            if (removeBOM(fullPath)) {
              fixedFiles.push(fullPath);
            } else {
              failedFiles.push(fullPath);
            }
          }
        }
      }
    } catch (error) {
      console.error(`Error accessing directory ${currentDir}:`, error.message);
    }
  }

  walk(dir);
  return { fixedFiles, failedFiles };
}

// メイン処理
function main() {
  console.log('🔧 Fixing BOM in files...\n');

  const allFixedFiles = [];
  const allFailedFiles = [];

  for (const dir of targetDirs) {
    if (fs.existsSync(dir)) {
      const { fixedFiles, failedFiles } = fixFilesWithBOM(dir);
      allFixedFiles.push(...fixedFiles);
      allFailedFiles.push(...failedFiles);
    }
  }

  if (allFixedFiles.length === 0 && allFailedFiles.length === 0) {
    console.log('✅ No files with BOM found!');
  } else {
    if (allFixedFiles.length > 0) {
      console.log(`✅ Successfully fixed ${allFixedFiles.length} file(s):\n`);
      allFixedFiles.forEach(file => {
        console.log(`  - ${file}`);
      });
    }

    if (allFailedFiles.length > 0) {
      console.log(`\n❌ Failed to fix ${allFailedFiles.length} file(s):\n`);
      allFailedFiles.forEach(file => {
        console.log(`  - ${file}`);
      });
    }
  }

  console.log('\n💡 Run "npm run lint:encoding" to verify all BOM issues are resolved.');
}

main();
