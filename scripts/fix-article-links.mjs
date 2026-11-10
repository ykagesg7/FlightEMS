/**
 * Rewrite internal MDX links from legacy `/articles/<filename>` to canonical kebab paths.
 *
 * Usage: npm run fix:article-links
 */
import { fixArticleMdxLinks } from './lib/fixArticleMdxLinks.ts';

const result = fixArticleMdxLinks();
console.log(
  `Updated ${result.filesChanged} files (${result.totalReplacements} link target replacements)`,
);
for (const row of result.perFile.slice(0, 20)) {
  console.log(`  ${row.replacements}\t${row.rel}`);
}
if (result.perFile.length > 20) {
  console.log(`  … and ${result.perFile.length - 20} more files`);
}
