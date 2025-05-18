// 特定のSupabaseプロジェクトの詳細情報を取得するスクリプト
import fetch from 'node-fetch';

const SUPABASE_ACCESS_TOKEN = 'sbp_3eccca9502ad743c092834f055476d76fe3bf29b';
const API_URL = 'https://api.supabase.com';
const PROJECT_ID = 'fstynltdfdetpyvbrswr'; // FlightAcademyプロジェクトのID

async function getProjectDetails() {
  try {
    console.log(`プロジェクトID: ${PROJECT_ID} の詳細情報を取得中...`);
    
    // プロジェクト詳細を取得
    const projectResponse = await fetch(`${API_URL}/v1/projects/${PROJECT_ID}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${SUPABASE_ACCESS_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!projectResponse.ok) {
      console.error('プロジェクト詳細取得エラー:', await projectResponse.text());
      return;
    }
    
    const projectDetails = await projectResponse.json();
    console.log('プロジェクト詳細:');
    console.log(JSON.stringify(projectDetails, null, 2));
    
    // データベースのテーブル一覧を取得
    console.log('\nデータベーステーブル情報を取得中...');
    
    const tablesResponse = await fetch(`${API_URL}/v1/projects/${PROJECT_ID}/api-info`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${SUPABASE_ACCESS_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!tablesResponse.ok) {
      console.error('テーブル情報取得エラー:', await tablesResponse.text());
      return;
    }
    
    const tablesInfo = await tablesResponse.json();
    console.log('API/テーブル情報:');
    console.log(JSON.stringify(tablesInfo, null, 2));
    
  } catch (err) {
    console.error('例外が発生しました:', err);
  }
}

getProjectDetails(); 