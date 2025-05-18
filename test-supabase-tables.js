// Supabaseプロジェクトのテーブル一覧を取得するスクリプト
import { createClient } from '@supabase/supabase-js';

// FlightAcademyプロジェクトの接続情報
const SUPABASE_URL = 'https://fstynltdfdetpyvbrswr.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZzdHlubHRkZmRldHB5dmJyc3dyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjM1MzI1ODcsImV4cCI6MjAzOTEwODU4N30.vzbj7_IjPZPBhJPUHvYLTONpOySASM8npaZIvwUXVG8';

// Supabaseクライアントを初期化
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function getTablesList() {
  try {
    console.log('データベースのテーブル一覧を取得中...');
    
    // このSQLは自動的にPostgresのスキーマからテーブル一覧を取得する
    const { data, error } = await supabase
      .rpc('get_schema_info')
      .select('*');
    
    if (error) {
      console.error('get_schema_info関数が見つからない場合は、別の方法を試します:', error);
      
      // 別の方法: カスタムSQLクエリを実行してテーブル一覧を取得
      const { data: tables, error: sqlError } = await supabase
        .from('information_schema.tables')
        .select('table_schema, table_name')
        .eq('table_schema', 'public')
        .order('table_name');
      
      if (sqlError) {
        console.error('SQL実行エラー:', sqlError);
        
        // もう一つの代替手段: アプリデータをクエリしてみる
        console.log('アプリケーションデータを直接クエリしてみます...');
        
        // 使用可能なテーブルを調べる（仮のテーブル名）
        const possibleTables = ['users', 'profiles', 'airlines', 'airports', 'flights', 'aircraft'];
        
        for (const table of possibleTables) {
          console.log(`テーブル "${table}" のクエリを試行中...`);
          const { data: tableData, error: tableError } = await supabase
            .from(table)
            .select('*')
            .limit(1);
          
          if (!tableError) {
            console.log(`テーブル "${table}" が存在し、アクセス可能です。サンプルデータ:`, tableData);
          } else {
            console.log(`テーブル "${table}" へのアクセスエラー:`, tableError.message);
          }
        }
      } else {
        console.log('テーブル一覧:', tables);
      }
    } else {
      console.log('スキーマ情報:', data);
    }
  } catch (err) {
    console.error('例外が発生しました:', err);
  }
}

getTablesList(); 