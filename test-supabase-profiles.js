// profilesテーブルの詳細情報を取得するスクリプト
import { createClient } from '@supabase/supabase-js';

// FlightAcademyプロジェクトの接続情報
const SUPABASE_URL = 'https://fstynltdfdetpyvbrswr.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZzdHlubHRkZmRldHB5dmJyc3dyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjM1MzI1ODcsImV4cCI6MjAzOTEwODU4N30.vzbj7_IjPZPBhJPUHvYLTONpOySASM8npaZIvwUXVG8';

// Supabaseクライアントを初期化
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function getProfilesData() {
  try {
    console.log('profilesテーブルのカラム情報を取得します...');
    
    // テーブル構造を確認するためのクエリ
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .limit(10);
    
    if (error) {
      console.error('プロファイルデータ取得エラー:', error);
      return;
    }
    
    if (data && data.length > 0) {
      console.log('profilesテーブルのカラム:');
      const columns = Object.keys(data[0]);
      columns.forEach(column => {
        console.log(`- ${column}: ${typeof data[0][column]}`);
      });
      
      console.log('\nprofilesテーブルのサンプルデータ:');
      console.log(JSON.stringify(data, null, 2));
      
      // 件数を確認
      const { count, error: countError } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });
        
      if (!countError) {
        console.log(`\ntotal records: ${count}`);
      }
    } else {
      console.log('データが見つかりませんでした。');
    }
  } catch (err) {
    console.error('例外が発生しました:', err);
  }
}

getProfilesData(); 