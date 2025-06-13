import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://fstynltdfdetpyvbrswr.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZzdHlubHRkZmRldHB5dmJyc3dyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjM1MzI1ODcsImV4cCI6MjAzOTEwODU4N30.vzbj7_IjPZPBhJPUHvYLTONpOySASM8npaZIvwUXVG8';
const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
  try {
    console.log('Supabaseへの接続をテストしています...');
    
    // 公開スキーマのテーブルを一覧表示するシンプルなクエリ
    const { data, error } = await supabase.auth.getUser();
    
    if (error) {
      console.error('認証エラー:', error);
      return;
    }
    
    console.log('接続成功!');
    console.log('ユーザー情報:', data);
    
    // プロジェクト情報を取得
    const { data: project, error: projectError } = await supabase
      .from('_metadata')
      .select('*')
      .limit(1);
      
    if (projectError) {
      console.error('プロジェクト情報取得エラー:', projectError);
    } else {
      console.log('プロジェクト情報:', project);
    }
    
  } catch (err) {
    console.error('例外が発生しました:', err);
  }
}

testConnection(); 