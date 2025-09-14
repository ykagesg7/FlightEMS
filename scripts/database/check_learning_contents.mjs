import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// 環境変数を手動で読み込み
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '../..');

// .env.localファイルを探して読み込み
let supabaseUrl, supabaseKey;

try {
  const envPath = path.join(projectRoot, '.env.local');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf-8');
    const envLines = envContent.split('\n');

    envLines.forEach(line => {
      if (line.startsWith('VITE_SUPABASE_URL=')) {
        supabaseUrl = line.split('=')[1];
      } else if (line.startsWith('VITE_SUPABASE_ANON_KEY=')) {
        supabaseKey = line.split('=')[1];
      }
    });
  }
} catch (error) {
  console.error('環境変数ファイルの読み込みエラー:', error);
}

// フォールバック: プロセス環境変数から取得
if (!supabaseUrl) supabaseUrl = process.env.VITE_SUPABASE_URL;
if (!supabaseKey) supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Supabase環境変数が設定されていません。');
  console.error('必要な環境変数: VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY');
  process.exit(1);
}

console.log('✅ Supabase設定を確認しました');
console.log(`URL: ${supabaseUrl.substring(0, 30)}...`);
console.log(`Key: ${supabaseKey.substring(0, 30)}...`);

const supabase = createClient(supabaseUrl, supabaseKey);

// learning_contentsテーブルの内容を確認
async function checkLearningContents() {
  try {
    console.log('\n=== learning_contentsテーブルの内容を確認中 ===');

    const { data, error } = await supabase
      .from('learning_contents')
      .select('*')
      .order('order_index');

    if (error) {
      console.error('❌ テーブル確認エラー:', error);
      return false;
    }

    console.log(`\n📊 テーブル内容 (${data.length}件):`);
    data.forEach((item, index) => {
      console.log(`${index + 1}. [${item.id}] ${item.title}`);
      console.log(`   カテゴリ: ${item.category}`);
      console.log(`   順序: ${item.order_index}`);
      console.log(`   公開: ${item.is_published ? 'はい' : 'いいえ'}`);
      console.log('');
    });

    // 新しい記事が存在するかチェック
    const newArticleExists = data.some(item => item.id === '4.1_FormationFlightTurningRejoin');
    if (newArticleExists) {
      console.log('✅ 新しい記事「【操縦法】編隊飛行その１、旋回リジョインをマスターせよ！」が見つかりました！');
    } else {
      console.log('⚠️ 新しい記事「【操縦法】編隊飛行その１、旋回リジョインをマスターせよ！」は見つかりませんでした。');
    }

    return true;
  } catch (err) {
    console.error('❌ 予期しないエラー:', err);
    return false;
  }
}

// 新しい記事を追加
async function addNewArticle() {
  try {
    console.log('\n=== 新しい記事を追加中 ===');

    const newArticle = {
      id: '4.1_FormationFlightTurningRejoin',
      title: '【操縦法】編隊飛行その１、旋回リジョインをマスターせよ！',
      category: '操縦法',
      description: '編隊飛行の高等訓練科目「旋回リジョイン」の完全攻略ガイド。アスペクト・アングル、POM、追跡曲線、HCAの四つの基本概念から、三段階の実践フェーズまでを詳細解説。',
      order_index: 10,
      parent_id: null,
      content_type: 'article',
      is_published: true,
      is_freemium: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    // 既存の記事をチェック
    const { data: existingData, error: checkError } = await supabase
      .from('learning_contents')
      .select('id')
      .eq('id', newArticle.id)
      .single();

    if (checkError && checkError.code !== 'PGRST116') {
      console.error('❌ 既存記事確認エラー:', checkError);
      return false;
    }

    if (existingData) {
      console.log('✅ 記事は既に存在します:', newArticle.id);
      return true;
    }

    // 新しい記事を挿入
    const { error: insertError } = await supabase
      .from('learning_contents')
      .insert([newArticle]);

    if (insertError) {
      console.error('❌ 記事追加エラー:', insertError);
      return false;
    }

    console.log('✅ 記事を正常に追加しました:', newArticle.id);
    return true;
  } catch (err) {
    console.error('❌ 予期しないエラー:', err);
    return false;
  }
}

// メイン実行
async function main() {
  console.log('🚀 Supabaseデータベースチェック開始\n');

  // 1. 現在のテーブル内容を確認
  const checkResult = await checkLearningContents();
  if (!checkResult) {
    console.error('❌ テーブル確認に失敗しました。');
    return;
  }

  // 2. 新しい記事を追加（存在しない場合のみ）
  const addResult = await addNewArticle();
  if (!addResult) {
    console.error('❌ 記事追加に失敗しました。');
    return;
  }

  // 3. 更新後のテーブル内容を再確認
  console.log('\n=== 更新後のテーブル内容 ===');
  await checkLearningContents();

  console.log('\n✅ 処理が完了しました。');
}

main().catch(console.error);
