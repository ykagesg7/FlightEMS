// Supabase管理機能のテスト用スクリプト
import fetch from 'node-fetch';

const SUPABASE_ACCESS_TOKEN = 'sbp_3eccca9502ad743c092834f055476d76fe3bf29b';
const API_URL = 'https://api.supabase.com';

async function testSupabaseManagementAPI() {
  try {
    console.log('Supabase Management APIへの接続テスト...');
    
    // 組織一覧を取得
    const orgResponse = await fetch(`${API_URL}/v1/organizations`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${SUPABASE_ACCESS_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!orgResponse.ok) {
      console.error('組織一覧取得エラー:', await orgResponse.text());
      return;
    }
    
    const organizations = await orgResponse.json();
    console.log('組織一覧:');
    console.log(JSON.stringify(organizations, null, 2));
    
    if (organizations && organizations.length > 0) {
      // 最初の組織のプロジェクト一覧を取得
      const orgId = organizations[0].id;
      console.log(`\n組織ID: ${orgId} のプロジェクト一覧を取得中...`);
      
      const projectsResponse = await fetch(`${API_URL}/v1/projects?organization_id=${orgId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${SUPABASE_ACCESS_TOKEN}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!projectsResponse.ok) {
        console.error('プロジェクト一覧取得エラー:', await projectsResponse.text());
        return;
      }
      
      const projects = await projectsResponse.json();
      console.log('プロジェクト一覧:');
      console.log(JSON.stringify(projects, null, 2));
    }
    
  } catch (err) {
    console.error('例外が発生しました:', err);
  }
}

testSupabaseManagementAPI(); 