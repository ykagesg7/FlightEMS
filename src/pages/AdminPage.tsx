import { useState, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { useAuthStore } from '../stores/authStore';
import { useProgress } from '../contexts/ProgressContext';
import { useNavigate } from 'react-router-dom';
import supabase from '../utils/supabase';
import { LearningContent, Database } from '../types';

// Supabase クライアントの型安全なラッパー
type SupabaseClient = typeof supabase;
type LearningContentsTable = Database['public']['Tables']['learning_contents'];

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
  
  const [contents, setContents] = useState<LearningContent[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState<Record<string, boolean>>({});
  
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
      // 既存のコンテンツを確認
      const { data: existingContents, error: fetchError } = await supabase
        .from('learning_contents')
        .select<'*', LearningContent>('*')
        .order('order_index', { ascending: true });
      
      if (fetchError) {
        throw fetchError;
      }
      
      // すでに存在するコンテンツIDのリスト
      const existingIds = existingContents?.map((item: { id: string }) => item.id) || [];
      console.log('既存のコンテンツ:', existingIds);
      
      // 全学習コンテンツリスト
      const allContents = [
        // メンタリティーカテゴリ
        {
          id: '1.1_Mentality',
          title: '【ガネーシャと学ぶメンタリティー】"夢を追うのが苦しい？当たり前やん！"',
          category: 'メンタリティー',
          description: 'ガネーシャが語る、夢を追う時の苦しさとの向き合い方',
          order_index: 1,
          content_type: 'text',
          is_freemium: true,
          is_published: true,
          updated_at: new Date().toISOString()
        },
        {
          id: '0.2.2_Mentality2',
          title: 'トム兄貴も応援中やで！ 戦闘機乗りの卵、エンジン全開や！',
          category: 'メンタリティー',
          description: '戦闘機パイロットを目指す人へのモチベーションメッセージ',
          order_index: 2,
          content_type: 'text',
          is_freemium: true,
          is_published: true,
          updated_at: new Date().toISOString()
        },
        
        // 思考法カテゴリ
        {
          id: '2.1_Thinking',
          title: '【悩みと考える】たったこれだけの違いで、人生って結構変わる話。',
          category: '思考法',
          description: '「悩む」と「考える」の違いを理解し、前向きな思考法を身につける',
          order_index: 1,
          content_type: 'text',
          is_freemium: true,
          is_published: true,
          updated_at: new Date().toISOString()
        },
        {
          id: '2.2_ConcreteAbstract',
          title: '【具体と抽象】記憶のモヤモヤ、ワシがバッサリ斬ったるわ！',
          category: '思考法',
          description: '具体と抽象の思考法を用いた効果的な学習方法',
          order_index: 2,
          content_type: 'text',
          is_freemium: true,
          is_published: true,
          updated_at: new Date().toISOString()
        },
        
        // ７つの習慣カテゴリ
        {
          id: '1.2_UnconsciousSuccess',
          title: '【７つの習慣】その１、道真公と学ぶ「主体性」',
          category: '７つの習慣',
          description: '"考えるな、行動しろ！"だけじゃない？道真が読み解く７つの習慣',
          order_index: 1,
          content_type: 'text',
          is_freemium: true,
          is_published: true,
          updated_at: new Date().toISOString()
        },
        {
          id: '1.3_EndWithFuture',
          title: '【７つの習慣】その２、清正公の熊本余暇とこラジオ～終わりを思い描くことから始める～',
          category: '７つの習慣',
          description: '加藤清正が語る目標設定と未来志向の重要性',
          order_index: 2,
          content_type: 'text',
          is_freemium: true,
          is_published: true,
          updated_at: new Date().toISOString()
        },
        {
          id: '1.4_PrioritizingMostImportant',
          title: '【７つの習慣】その３、緊急指令！最優先で「第３の習慣」をマスターせよ！',
          category: '７つの習慣',
          description: '「第３の習慣：最優先事項を優先する」の解説と実践方法',
          order_index: 3,
          content_type: 'text',
          is_freemium: true,
          is_published: true,
          updated_at: new Date().toISOString()
        },
        {
          id: '1.5_WinWinThinking',
          title: '【７つの習慣】その４、黄門様珍道中～Win-Winについて考える～',
          category: '７つの習慣',
          description: 'Win-Win思考による協力関係の構築',
          order_index: 4,
          content_type: 'text',
          is_freemium: true,
          is_published: true,
          updated_at: new Date().toISOString()
        },
        {
          id: '1.6_SeekFirstToUnderstand',
          title: '【７つの習慣】その５、まず理解に徹し、そして理解される～ZOZOマリンスタジアム特別放送席より～',
          category: '７つの習慣',
          description: '効果的なコミュニケーションのための傾聴の技術',
          order_index: 5,
          content_type: 'text',
          is_freemium: true,
          is_published: true,
          updated_at: new Date().toISOString()
        },
        {
          id: '1.7_Synergize',
          title: '【７つの習慣】その６、「シナジーを創り出す」～最強のチームとは～',
          category: '７つの習慣',
          description: 'チームワークによるシナジー効果の創出',
          order_index: 6,
          content_type: 'text',
          is_freemium: true,
          is_published: true,
          updated_at: new Date().toISOString()
        },
        {
          id: '1.8_RightPeopleOnBoard',
          title: '【ビジョナリー・カンパニー】「誰ば飛行機（ふね）に乗せるか」酔いどれ道真の人選術！',
          category: '７つの習慣',
          description: 'チーム構築における人選の重要性とリーダーシップの本質',
          order_index: 7,
          content_type: 'text',
          is_freemium: true,
          is_published: true,
          updated_at: new Date().toISOString()
        },
        {
          id: '1.9_GiveAndTake',
          title: '【GIVE&TAKEの極意】与える者は空を制す！～せいしょこさんの熊本よかとこラジオ・超豪華ゲストSP～',
          category: '７つの習慣',
          description: 'GIVE&TAKEの極意と自己犠牲の罠を避ける方法',
          order_index: 8,
          content_type: 'text',
          is_freemium: true,
          is_published: true,
          updated_at: new Date().toISOString()
        }
      ];
      
      // 存在しないコンテンツのみをフィルタリング
      const contentsToAdd = allContents.filter(
        content => !existingIds.includes(content.id)
      );
      
      if (contentsToAdd.length === 0) {
        setSyncStatus({
          loading: false,
          success: true,
          message: `すべての学習コンテンツはすでに追加されています`,
          count: 0
        });
        return;
      }
      
      setSyncStatus({ loading: true, message: `${contentsToAdd.length}件のコンテンツを追加中...` });
      
      // Supabaseに一括でデータを登録
      const { error } = await supabase
        .from('learning_contents')
        .upsert(contentsToAdd, {
          onConflict: 'id'
        });
      
      if (error) {
        throw error;
      }
      
      setSyncStatus({
        loading: false,
        success: true,
        message: `新しい学習コンテンツを追加しました`,
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
  
  useEffect(() => {
    const fetchContents = async () => {
      try {
        setLoading(true);
        
        // 型安全なSupabaseクエリ
        const { data: existingContents, error: fetchError } = await supabase
          .from('learning_contents')
          .select<'*', LearningContent>('*')
          .order('order_index', { ascending: true });

        if (fetchError) {
          console.error('Error fetching learning contents:', fetchError);
          setError('学習コンテンツの取得に失敗しました');
          return;
        }

        setContents(existingContents || []);
      } catch (err) {
        console.error('Unexpected error:', err);
        setError('予期しないエラーが発生しました');
      } finally {
        setLoading(false);
      }
    };

    fetchContents();
  }, []);

  const handleDeleteContent = async (contentId: string) => {
    if (!confirm('このコンテンツを削除してもよろしいですか？')) {
      return;
    }

    try {
      setDeleteLoading(prev => ({ ...prev, [contentId]: true }));
      
      // 型安全なSupabase削除クエリ
      const { error } = await supabase
        .from('learning_contents')
        .delete()
        .eq('id', contentId);

      if (error) {
        console.error('Delete error:', error);
        setError('削除に失敗しました');
        return;
      }

      // 成功時にローカル状態を更新
      setContents(prev => prev.filter(content => content.id !== contentId));
      setSuccess('コンテンツを削除しました');
      
      // 3秒後にメッセージを消す
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error('Unexpected delete error:', err);
      setError('削除処理中にエラーが発生しました');
    } finally {
      setDeleteLoading(prev => ({ ...prev, [contentId]: false }));
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
              代わりに、メンタリティーと７つの習慣関連の学習コンテンツを手動でデータベースに追加します。
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
              {syncStatus.loading ? '追加中...' : '学習コンテンツを追加'}
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