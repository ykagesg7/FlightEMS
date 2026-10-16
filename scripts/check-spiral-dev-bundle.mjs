#!/usr/bin/env node
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

const DIST_DIR = join(process.cwd(), 'dist');
const MARKERS = [
  'spiral-dev-mini-quiz-sample',
  'SPIRAL-DEV-MiniQuizSample',
  'SPIRAL-DEV-MINI',
  '螺旋 LMS ミニテスト（開発サンプル）',
  'dev/spiral-lms',
  '今日の1単元',
  '整備点検一覧',
  '螺旋マトリックス LMS（開発）',
  '3D 螺旋ビュー',
  'ドラッグで回転 · スクロールでズーム',
  '@react-three/fiber',
  'SpiralLms3dCanvas',
];

function walkFiles(dir, acc = []) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    const stat = statSync(full);
    if (stat.isDirectory()) {
      walkFiles(full, acc);
    } else if (/\.(js|css|html|json|map)$/i.test(entry)) {
      acc.push(full);
    }
  }
  return acc;
}

function main() {
  let files;
  try {
    files = walkFiles(DIST_DIR);
  } catch {
    console.error('dist/ not found; run npm run build first');
    process.exit(1);
  }

  const hits = [];
  for (const file of files) {
    const text = readFileSync(file, 'utf8');
    for (const marker of MARKERS) {
      if (text.includes(marker)) {
        hits.push({ file, marker });
      }
    }
  }

  if (hits.length > 0) {
    console.error('Spiral dev sample markers found in production build output:');
    for (const hit of hits) {
      console.error(`- ${hit.marker} in ${hit.file}`);
    }
    process.exit(1);
  }

  console.log('OK: spiral dev sample not present in dist/');
}

main();
