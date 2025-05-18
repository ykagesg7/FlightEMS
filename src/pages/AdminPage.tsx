import { useState } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { useAuthStore } from '../stores/authStore';
import { useProgress } from '../contexts/ProgressContext';
import { useNavigate } from 'react-router-dom';
import supabase from '../utils/supabase';

function AdminPage() {
  const { theme } = useTheme();
  const user = useAuthStore(state => state.user);
  const profile = useAuthStore(state => state.profile);
  const { loadLearningContents } = useProgress();
  const navigate = useNavigate();
  
  const [syncStatus, setSyncStatus] = useState<{
    loading: boolean;
    success?: boolean;
    message?: string;
    count?: number;
  }>({
    loading: false
  });
  
  // 管理者権限チェック - 権限がない場合はリダイレクト
  if (!user || !profile || !['teacher', 'admin'].includes((profile.roll || '').toLowerCase())) {
    return (
      <div className={`${
        theme === 'dark' 
          ? 'bg-gray-900 text-red-400' 
          : 'bg-gradient-to-br from-indigo-100 to-purple-100 text-red-600'
      } min-h-screen p-4 flex justify-center items-center`}>
        <div className="max-w-md p-4 rounded-lg shadow-lg bg-opacity-80 bg-white">
          <h2 className="text-xl font-bold mb-2">アクセス権限がありません</h2>
          <p>このページは管理者専用です。</p>
          <button 
            onClick={() => navigate('/')}
            className={`mt-4 px-4 py-2 rounded ${
              theme === 'dark' 
                ? 'bg-indigo-600 text-white hover:bg-indigo-700' 
                : 'bg-indigo-500 text-white hover:bg-indigo-600'
            }`}
          >
            ホームに戻る
          </button>
        </div>
      </div>
    );
  }
  
  // コンテンツを手動でデータベースに追加する関数
  const addContentManually = async () => {
    setSyncStatus({ loading: true, message: 'コンテンツを確認中...' });
    
    try {
      // まず既存のメンタリティーコンテンツを確認
      const { data: existingContents, error: fetchError } = await (supabase.from as any)('learning_contents')
        .select('id')
        .eq('category', 'メンタリティー');
      
      if (fetchError) {
        throw fetchError;
      }
      
      // すでに存在するコンテンツIDのリスト
      const existingIds = existingContents?.map((item: { id: string }) => item.id) || [];
      console.log('既存のメンタリティーコンテンツ:', existingIds);
      
      // メンタリティー関連のコンテンツを追加
      const mentalityContents = [
        {
          id: '0.2_Mentality',
          title: '【悩みと考える】たったこれだけの違いで、人生って結構変わる話。',
          category: 'メンタリティー',
          description: '「悩む」と「考える」の違いを理解し、前向きな思考法を身につける',
          order_index: 2,
          content_type: 'text',
          updated_at: new Date().toISOString()
        },
        {
          id: '0.2.2_Mentality2',
          title: 'トム兄貴も応援中やで！ 戦闘機乗りの卵、エンジン全開や！',
          category: 'メンタリティー',
          description: '戦闘機パイロットを目指す人へのモチベーションメッセージ',
          order_index: 3,
          content_type: 'text',
          updated_at: new Date().toISOString()
        },
        {
          id: '0.3.1_UnconsciousSuccess',
          title: '"考えるな、行動しろ！"…だけじゃない？道真が読み解く『７つの習慣』その１',
          category: 'メンタリティー',
          description: '菅原道真が語る主体性の重要性と行動の秘訣',
          order_index: 4,
          content_type: 'text',
          updated_at: new Date().toISOString()
        },
        {
          id: '0.3.2_EndWithFuture',
          title: '終わりを思い描くことから始める～清正公の熊本よかとこラジオ～',
          category: 'メンタリティー',
          description: '加藤清正が語る目標設定と未来志向の重要性',
          order_index: 5,
          content_type: 'text',
          updated_at: new Date().toISOString()
        },
        {
          id: '0.3.3_PrioritizingMostImportant',
          title: '【緊急指令】最優先で「第３の習慣」をマスターせよ！',
          category: 'メンタリティー',
          description: '「第３の習慣：最優先事項を優先する」の解説と実践方法',
          order_index: 6,
          content_type: 'text',
          updated_at: new Date().toISOString()
        },
        {
          id: '0.4_ConcreteAbstract',
          title: '記憶のモヤモヤ、ワシがバッサリ斬ったるわ！',
          category: 'メンタリティー',
          description: '具体と抽象の思考法を用いた効果的な学習方法',
          order_index: 7,
          content_type: 'text',
          updated_at: new Date().toISOString()
        }
      ];
      
      // 存在しないコンテンツのみをフィルタリング
      const contentsToAdd = mentalityContents.filter(
        content => !existingIds.includes(content.id)
      );
      
      if (contentsToAdd.length === 0) {
        setSyncStatus({
          loading: false,
          success: true,
          message: `すべてのメンタリティーコンテンツはすでに追加されています`,
          count: 0
        });
        return;
      }
      
      setSyncStatus({ loading: true, message: `${contentsToAdd.length}件のコンテンツを追加中...` });
      
      // Supabaseに一括でデータを登録
      const { error } = await (supabase.from as any)('learning_contents')
        .upsert(contentsToAdd, {
          onConflict: 'id'
        });
      
      if (error) {
        throw error;
      }
      
      setSyncStatus({
        loading: false,
        success: true,
        message: `新しいメンタリティーコンテンツを追加しました`,
        count: contentsToAdd.length
      });
      
      // 成功したらコンテンツリストを更新
      await loadLearningContents();
      
    } catch (error) {
      console.error('コンテンツ追加エラー:', error);
      setSyncStatus({
        loading: false,
        success: false,
        message: error instanceof Error ? error.message : String(error)
      });
    }
  };
  
  return (
    <div className={`${
      theme === 'dark' 
        ? 'bg-gray-900' 
        : 'bg-gradient-to-br from-indigo-100 to-purple-100'
    } min-h-screen p-4`}>
      <div className="container mx-auto max-w-4xl">
        <h1 className={`text-3xl font-bold mb-6 ${
          theme === 'dark' ? 'text-white' : 'text-gray-800'
        }`}>
          管理者ページ
        </h1>
        
        <div className={`p-6 rounded-lg shadow-md mb-6 ${
          theme === 'dark' ? 'bg-gray-800 text-gray-200' : 'bg-white text-gray-800'
        }`}>
          <h2 className="text-xl font-semibold mb-4">コンテンツ管理</h2>
          
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-2">コンテンツをSupabaseに追加</h3>
            <p className="mb-4 text-sm">
              ブラウザ環境ではファイルシステムに直接アクセスできないため、MDXファイルを自動的に同期することはできません。<br />
              代わりに、メンタリティー関連の6つのコンテンツを手動でデータベースに追加します。
            </p>
            
            <button
              onClick={addContentManually}
              disabled={syncStatus.loading}
              className={`px-4 py-2 rounded font-semibold ${
                syncStatus.loading
                  ? 'bg-gray-500 cursor-not-allowed'
                  : theme === 'dark'
                    ? 'bg-indigo-600 hover:bg-indigo-700'
                    : 'bg-indigo-500 hover:bg-indigo-600'
              } text-white transition-colors`}
            >
              {syncStatus.loading ? '追加中...' : 'メンタリティーコンテンツを追加'}
            </button>
            
            {/* 同期状態の表示 */}
            {syncStatus.message && (
              <div className={`mt-4 p-3 rounded ${
                syncStatus.success
                  ? theme === 'dark' ? 'bg-green-800' : 'bg-green-100 text-green-800'
                  : theme === 'dark' ? 'bg-red-800' : 'bg-red-100 text-red-800'
              }`}>
                <p>{syncStatus.message}</p>
                {syncStatus.success && syncStatus.count !== undefined && (
                  <p className="mt-2">
                    {syncStatus.count}件のコンテンツが追加されました
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
        
        <div className={`p-6 rounded-lg shadow-md ${
          theme === 'dark' ? 'bg-gray-800 text-gray-200' : 'bg-white text-gray-800'
        }`}>
          <h2 className="text-xl font-semibold mb-4">ユーザー管理</h2>
          <p className="text-sm">
            この機能は準備中です。
          </p>
        </div>
      </div>
    </div>
  );
}

export default AdminPage; 