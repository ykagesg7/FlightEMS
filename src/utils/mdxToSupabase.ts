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
import {
  extractTitleFromMDX,
  extractDescriptionFromMDX,
  guessCategoryFromFilename,
  guessOrderIndexFromFilename,
} from './mdxContentParsing';

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