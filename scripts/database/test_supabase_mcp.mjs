import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// 環境変数を手動で読み込み
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '../..');

// .env.localファイルを読み込み
let supabaseAccessToken;

try {
  const envPath = path.join(projectRoot, '.env.local');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf-8');
    const envLines = envContent.split('\n');

    envLines.forEach(line => {
      if (line.startsWith('SUPABASE_ACCESS_TOKEN=')) {
        supabaseAccessToken = line.split('=')[1];
      }
    });
  }
} catch (error) {
  console.error('環境変数ファイルの読み込みエラー:', error);
}

console.log('🚀 SupabaseMCP設定テスト開始\n');

// 環境変数の確認
console.log('=== 環境変数チェック ===');
console.log(`SUPABASE_ACCESS_TOKEN: ${supabaseAccessToken ? '✅ 設定済み' : '❌ 未設定'}`);

if (supabaseAccessToken && supabaseAccessToken !== 'your_personal_access_token_here') {
  console.log(`トークン（先頭20文字）: ${supabaseAccessToken.substring(0, 20)}...`);
  console.log('✅ SupabaseMCPの設定が完了しています！');

  console.log('\n=== 次のステップ ===');
  console.log('1. Cursorを再起動してMCP設定を読み込み直してください');
  console.log('2. 以下のSupabaseMCPコマンドが使用可能になります：');
  console.log('   - mcp_my_supabase_project_list_projects');
  console.log('   - mcp_my_supabase_project_get_project');
  console.log('   - mcp_my_supabase_project_execute_sql');
  console.log('   - mcp_my_supabase_project_apply_migration');
  console.log('   - その他多数のSupabaseMCPコマンド');

  console.log('\n=== 記事をデータベースに追加する方法 ===');
  console.log('設定完了後、以下のSQLを実行して記事をデータベースに追加できます：');
  console.log(`
INSERT INTO learning_contents (
  id, title, category, description, order_index,
  parent_id, content_type, is_published, is_freemium,
  created_at, updated_at
) VALUES (
  '4.1_FormationFlightTurningRejoin',
  '【操縦法】編隊飛行その１、旋回リジョインをマスターせよ！',
  '操縦法',
  '編隊飛行の高等訓練科目「旋回リジョイン」の完全攻略ガイド。アスペクト・アングル、POM、追跡曲線、HCAの四つの基本概念から、三段階の実践フェーズまでを詳細解説。',
  10,
  null,
  'article',
  true,
  false,
  now(),
  now()
);`);

} else {
  console.log('❌ Supabaseアクセストークンが設定されていません');
  console.log('\n=== トークン設定手順 ===');
  console.log('1. https://supabase.com/dashboard/account/tokens にアクセス');
  console.log('2. 「Generate new token」をクリック');
  console.log('3. トークン名を入力（例：FlightAcademy_MCP）');
  console.log('4. 生成されたトークンをコピー');
  console.log('5. .env.localファイルのSUPABASE_ACCESS_TOKENに設定');
}

console.log('\n✅ テスト完了');
