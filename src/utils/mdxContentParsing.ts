/**
 * MDX 本文・ファイル名からの純粋なメタ推測（Node/ブラウザどちらでも利用可）。
 * [`mdxToSupabase.ts`](./mdxToSupabase.ts) とテストで共有する。
 */

/** ファイル名接頭辞からカテゴリを推測するマッピング */
export const MDX_CATEGORY_MAPPING: Record<string, string> = {
  '0': '基礎',
  '0.2': 'メンタリティー',
  '0.3': 'メンタリティー',
  '0.4': 'メンタリティー',
  '1': '計器飛行原理',
  '2': '離着陸',
  '3': '基本操作',
  '4': '計器飛行',
  '5': 'タカン',
};

/** MDXファイルからタイトルを抽出 */
export function extractTitleFromMDX(content: string): string | null {
  const titleMatch = content.match(/^#\s+(.+)$/m);
  if (titleMatch && titleMatch[1]) {
    return titleMatch[1].trim();
  }

  const h1Match = content.match(/<h1[^>]*>(.+?)<\/h1>/i);
  if (h1Match && h1Match[1]) {
    return h1Match[1].trim();
  }

  return null;
}

/** MDXファイルから説明を抽出 */
export function extractDescriptionFromMDX(content: string): string | null {
  const paragraphs = content.split(/\n\s*\n/);

  if (paragraphs.length > 1) {
    const firstPara = paragraphs[0].trim();
    if (firstPara.startsWith('#') || firstPara.startsWith('<h1')) {
      const secondPara = paragraphs[1].trim();
      return secondPara
        .replace(/#{1,6}\s+/g, '')
        .replace(/<[^>]+>/g, '')
        .substring(0, 150);
    }
  }

  return null;
}

/** ファイル名からカテゴリを推測 */
export function guessCategoryFromFilename(filename: string): string {
  const prefixMatch = filename.match(/^(\d+(\.\d+)?)/);

  if (prefixMatch && prefixMatch[1]) {
    const prefix = prefixMatch[1];
    return MDX_CATEGORY_MAPPING[prefix] || '一般';
  }

  const fallbackPrefix = filename.split('-')[0].split('_')[0].split('.')[0];
  return MDX_CATEGORY_MAPPING[fallbackPrefix] || '一般';
}

/** ファイル名から順序インデックスを推測 */
export function guessOrderIndexFromFilename(filename: string): number {
  const parts = filename.split(/[-_.]/);

  for (const part of parts) {
    const numMatch = part.match(/^(\d+)$/);
    if (numMatch) {
      return parseInt(numMatch[1], 10);
    }
  }

  return 0;
}
