/**
 * このユーティリティはNode.js環境でのみ使用できます。
 * ブラウザ環境では、path、fsモジュールが利用できないため、
 * Edge Function、バックエンドAPI、またはNode.jsスクリプトとして実行する必要があります。
 * 
 * ブラウザからこのファイルを直接importすると以下のエラーが発生します:
 * "Module "path" has been externalized for browser compatibility."
 */

import supabase from './supabase';
import path from 'path';
import fs from 'fs';

// カテゴリーマッピング（ファイル名の接頭辞からカテゴリを推測）
const CATEGORY_MAPPING: Record<string, string> = {
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

// MDXファイルからタイトルを抽出
function extractTitleFromMDX(content: string): string | null {
  // 最初の行が # で始まるタイトルと仮定
  const titleMatch = content.match(/^#\s+(.+)$/m);
  if (titleMatch && titleMatch[1]) {
    return titleMatch[1].trim();
  }
  
  // h1タグがある場合
  const h1Match = content.match(/<h1[^>]*>(.+?)<\/h1>/i);
  if (h1Match && h1Match[1]) {
    return h1Match[1].trim();
  }
  
  return null;
}

// MDXファイルから説明を抽出
function extractDescriptionFromMDX(content: string): string | null {
  // タイトルの次の段落をdescriptionと仮定
  const paragraphs = content.split(/\n\s*\n/);
  
  if (paragraphs.length > 1) {
    // 最初の段落がタイトルならスキップして次の段落を使用
    const firstPara = paragraphs[0].trim();
    if (firstPara.startsWith('#') || firstPara.startsWith('<h1')) {
      const secondPara = paragraphs[1].trim();
      // マークダウン記法や HTMLタグを除去
      return secondPara
        .replace(/#{1,6}\s+/g, '') // #見出しを除去
        .replace(/<[^>]+>/g, '')   // HTMLタグを除去
        .substring(0, 150);        // 最大150文字まで
    }
  }
  
  return null;
}

// ファイル名からカテゴリを推測
function guessCategoryFromFilename(filename: string): string {
  // 数字で始まるプレフィックスを抽出（0.2や0.3などの小数点を含むケースにも対応）
  const prefixMatch = filename.match(/^(\d+(\.\d+)?)/);
  
  if (prefixMatch && prefixMatch[1]) {
    const prefix = prefixMatch[1];
    return CATEGORY_MAPPING[prefix] || '一般';
  }
  
  // 従来の方法（フォールバック）
  const fallbackPrefix = filename.split('-')[0].split('_')[0].split('.')[0];
  return CATEGORY_MAPPING[fallbackPrefix] || '一般';
}

// ファイル名から順序インデックスを推測
function guessOrderIndexFromFilename(filename: string): number {
  const parts = filename.split(/[-_.]/);
  
  for (const part of parts) {
    // 数値のみの部分を見つける
    const numMatch = part.match(/^(\d+)$/);
    if (numMatch) {
      return parseInt(numMatch[1], 10);
    }
  }
  
  return 0; // デフォルト値
}

// MDXファイルをSupabaseに登録
export async function syncMDXToSupabase(directory: string): Promise<{success: boolean, message: string, count: number}> {
  try {
    const contentDir = path.resolve(directory);
    console.log(`MDXコンテンツ同期を開始します: ${contentDir}`);
    
    if (!fs.existsSync(contentDir)) {
      console.error(`指定されたディレクトリが見つかりません: ${contentDir}`);
      return {
        success: false,
        message: `指定されたディレクトリが見つかりません: ${contentDir}`,
        count: 0
      };
    }
    
    const files = fs.readdirSync(contentDir);
    const mdxFiles = files.filter(file => 
      file.endsWith('.mdx') || file.endsWith('.md')
    );
    
    console.log(`${mdxFiles.length}件のMDXファイルが見つかりました`);
    let successCount = 0;
    
    for (const file of mdxFiles) {
      const filepath = path.join(contentDir, file);
      const content = fs.readFileSync(filepath, 'utf-8');
      const filename = path.basename(file, path.extname(file));
      
      // メタデータの抽出
      const title = extractTitleFromMDX(content) || filename;
      const description = extractDescriptionFromMDX(content);
      const category = guessCategoryFromFilename(filename);
      const orderIndex = guessOrderIndexFromFilename(filename);
      
      console.log(`ファイル処理: ${filename}`, {
        title,
        category,
        orderIndex,
        description: description ? description.substring(0, 30) + '...' : null
      });
      
      // Supabaseにデータを登録
      const { data: _data, error } = await supabase
        .from('learning_contents')
        .upsert({
          id: filename,
          title,
          category,
          description,
          order_index: orderIndex,
          content_type: 'text',
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'id',
          returning: 'minimal'
        });
      
      if (error) {
        console.error(`ファイル ${file} の登録に失敗:`, error);
      } else {
        console.log(`ファイル ${file} の登録に成功`);
        successCount++;
      }
    }
    
    console.log(`同期完了: ${successCount}/${mdxFiles.length}ファイルを登録しました`);
    return {
      success: true,
      message: `${successCount}/${mdxFiles.length}ファイルを正常に登録しました`,
      count: successCount
    };
  } catch (err) {
    console.error('MDXファイルの同期中にエラーが発生しました:', err);
    return {
      success: false,
      message: `エラーが発生しました: ${err instanceof Error ? err.message : String(err)}`,
      count: 0
    };
  }
} 