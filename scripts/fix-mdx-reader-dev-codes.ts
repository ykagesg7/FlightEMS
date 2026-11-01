import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { collectArticleMetas } from '../vite/articlesMeta';
import {
  buildArticleCatalog,
  findReaderVisibleDevCodes,
  sanitizeMdxSource,
} from '../src/utils/mdxReaderVisibleDevCodes';

const contentRoot = join(process.cwd(), 'src/content');

function listMdxFiles(): string[] {
  const dirs = ['articles', 'lessons'] as const;
  const paths: string[] = [];
  for (const dir of dirs) {
    const folder = join(contentRoot, dir);
    let names: string[];
    try {
      names = readdirSync(folder);
    } catch {
      continue;
    }
    for (const name of names) {
      if (name.endsWith('.mdx')) {
        paths.push(join(folder, name));
      }
    }
  }
  return paths;
}

const catalog = buildArticleCatalog(collectArticleMetas());
const paths = listMdxFiles();

let filesChanged = 0;
let linkParenStripped = 0;
let bareReplaced = 0;
const unresolved = new Map<string, Set<string>>();

for (const filePath of paths) {
  const source = readFileSync(filePath, 'utf8');
  const beforeCodes = findReaderVisibleDevCodes(source);
  if (beforeCodes.length === 0) continue;

  const { body: next, unresolvedCodes } = sanitizeMdxSource(source, catalog);
  if (next === source) continue;

  for (const code of unresolvedCodes) {
    if (!unresolved.has(code)) unresolved.set(code, new Set());
    unresolved.get(code)?.add(filePath);
  }

  const afterCodes = findReaderVisibleDevCodes(next);
  writeFileSync(filePath, next, 'utf8');
  filesChanged += 1;
  linkParenStripped += beforeCodes.length;
  bareReplaced += beforeCodes.length - afterCodes.length;
}

console.log(JSON.stringify({ filesChanged, remainingUnresolved: [...unresolved.entries()].map(([code, files]) => ({ code, files: [...files] })) }, null, 2));
