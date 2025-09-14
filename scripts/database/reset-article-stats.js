#!/usr/bin/env node

/**
 * 記事統計リセットスクリプト
 * - 既存のテストデータをクリア
 * - 新しいソーシャル機能テーブルを作成
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Supabase設定（環境変数から取得）
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ 環境変数が設定されていません:');
  console.error('   VITE_SUPABASE_URL');
  console.error('   SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function resetArticleStats() {
  console.log('🚀 記事統計リセット開始...');

  try {
    // 1. マイグレーションファイルを読み込み
    const migrationPath = join(__dirname, '../database/article_social_features_migration.sql');
    const migrationSQL = readFileSync(migrationPath, 'utf8');

    console.log('📄 マイグレーションファイルを実行中...');
    
    // 2. マイグレーションを実行
    const { error: migrationError } = await supabase.rpc('exec_sql', {
      sql: migrationSQL
    });

    if (migrationError) {
      // rpc関数が存在しない場合は、直接SQLを実行
      console.log('⚠️  rpc関数が見つからないため、直接SQL実行を試行...');
      
      // SQLを分割して実行
      const statements = migrationSQL
        .split(';')
        .map(stmt => stmt.trim())
        .filter(stmt => stmt.length > 0);

      for (const statement of statements) {
        if (statement.includes('--') && !statement.includes('CREATE') && !statement.includes('ALTER')) {
          continue; // コメント行をスキップ
        }
        
        try {
          const { error } = await supabase.rpc('exec', { sql: statement + ';' });
          if (error) {
            console.warn(`⚠️  SQL実行警告: ${error.message}`);
          }
        } catch (err) {
          console.warn(`⚠️  SQL実行エラー: ${err.message}`);
        }
      }
    }

    // 3. 既存のテストデータをクリア（存在する場合）
    console.log('🧹 既存データをクリア中...');
    
    const { error: clearLikesError } = await supabase
      .from('learning_content_likes')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // 全削除

    const { error: clearCommentsError } = await supabase
      .from('learning_content_comments')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // 全削除

    if (clearLikesError) {
      console.warn('⚠️  いいねデータクリア警告:', clearLikesError.message);
    }

    if (clearCommentsError) {
      console.warn('⚠️  コメントデータクリア警告:', clearCommentsError.message);
    }

    // 4. 統計確認
    console.log('📊 現在の統計を確認中...');
    
    const { data: likesCount, error: likesCountError } = await supabase
      .from('learning_content_likes')
      .select('*', { count: 'exact', head: true });

    const { data: commentsCount, error: commentsCountError } = await supabase
      .from('learning_content_comments')
      .select('*', { count: 'exact', head: true });

    if (!likesCountError && !commentsCountError) {
      console.log(`✅ リセット完了!`);
      console.log(`   いいね数: ${likesCount?.length || 0}`);
      console.log(`   コメント数: ${commentsCount?.length || 0}`);
    }

    console.log('🎉 記事統計リセットが完了しました！');
    
  } catch (error) {
    console.error('❌ リセット中にエラーが発生しました:', error);
    process.exit(1);
  }
}

// スクリプト実行
resetArticleStats(); 