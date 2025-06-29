import { useNavigate } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import { useAuthStore } from '../stores/authStore';

function AdminPage() {
  const { theme } = useTheme();
  const user = useAuthStore(state => state.user);
  const profile = useAuthStore(state => state.profile);
  const navigate = useNavigate();

  // 管理者権限チェック - 権限がない場合はリダイレクト
  if (!user || !profile || !['teacher', 'admin'].includes((profile.roll || '').toLowerCase())) {
    return (
      <div className={`${theme === 'dark'
          ? 'bg-gray-900 text-red-400'
          : 'bg-gradient-to-br from-indigo-100 to-purple-100 text-red-600'
        } min-h-screen p-4 flex justify-center items-center`}>
        <div className="max-w-md p-4 rounded-lg shadow-lg bg-opacity-80 bg-white">
          <h2 className="text-xl font-bold mb-2">アクセス権限がありません</h2>
          <p>このページは管理者専用です。</p>
          <button
            onClick={() => navigate('/')}
            className={`mt-4 px-4 py-2 rounded ${theme === 'dark'
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

  return (
    <div className={`${theme === 'dark'
        ? 'bg-gray-900'
        : 'bg-gradient-to-br from-indigo-100 to-purple-100'
      } min-h-screen p-4`}>
      <div className="container mx-auto max-w-4xl">
        <h1 className={`text-3xl font-bold mb-6 ${theme === 'dark' ? 'text-white' : 'text-gray-800'
          }`}>
          管理者ページ
        </h1>

        {/* 管理者情報 */}
        <div className={`p-6 rounded-lg shadow-md mb-6 ${theme === 'dark' ? 'bg-gray-800 text-gray-200' : 'bg-white text-gray-800'
          }`}>
          <h2 className="text-xl font-semibold mb-4">管理者情報</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <span className="font-medium">ユーザー名:</span>
              <span className="ml-2">{profile.username || 'N/A'}</span>
            </div>
            <div>
              <span className="font-medium">フルネーム:</span>
              <span className="ml-2">{profile.full_name || 'N/A'}</span>
            </div>
            <div>
              <span className="font-medium">ロール:</span>
              <span className="ml-2 capitalize">{profile.roll || 'N/A'}</span>
            </div>
            <div>
              <span className="font-medium">メールアドレス:</span>
              <span className="ml-2">{profile.email || 'N/A'}</span>
            </div>
          </div>
        </div>

        {/* システム管理 */}
        <div className={`p-6 rounded-lg shadow-md mb-6 ${theme === 'dark' ? 'bg-gray-800 text-gray-200' : 'bg-white text-gray-800'
          }`}>
          <h2 className="text-xl font-semibold mb-4">システム管理</h2>
          <div className="space-y-4">
            <div className={`p-4 rounded-md ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'
              }`}>
              <h3 className="font-semibold mb-2">コンテンツ管理</h3>
              <p className="text-sm mb-3">
                学習コンテンツの管理は、SupabaseMCPを使用して直接データベースを操作できます。
                これにより、より柔軟で効率的なコンテンツ管理が可能です。
              </p>
              <div className="flex flex-wrap gap-2 text-sm">
                <span className={`px-2 py-1 rounded ${theme === 'dark' ? 'bg-green-800 text-green-200' : 'bg-green-100 text-green-800'
                  }`}>
                  SupabaseMCP対応
                </span>
                <span className={`px-2 py-1 rounded ${theme === 'dark' ? 'bg-blue-800 text-blue-200' : 'bg-blue-100 text-blue-800'
                  }`}>
                  リアルタイム更新
                </span>
                <span className={`px-2 py-1 rounded ${theme === 'dark' ? 'bg-purple-800 text-purple-200' : 'bg-purple-100 text-purple-800'
                  }`}>
                  SQL直接実行
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ユーザー管理 */}
        <div className={`p-6 rounded-lg shadow-md mb-6 ${theme === 'dark' ? 'bg-gray-800 text-gray-200' : 'bg-white text-gray-800'
          }`}>
          <h2 className="text-xl font-semibold mb-4">ユーザー管理</h2>
          <div className={`p-4 rounded-md ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'
            }`}>
            <p className="text-sm mb-2">
              ユーザー管理機能は準備中です。
            </p>
            <p className="text-xs text-gray-500">
              SupabaseMCPでprofilesテーブルを直接操作することで、
              ユーザー情報の管理が可能です。
            </p>
          </div>
        </div>

        {/* 統計情報 */}
        <div className={`p-6 rounded-lg shadow-md ${theme === 'dark' ? 'bg-gray-800 text-gray-200' : 'bg-white text-gray-800'
          }`}>
          <h2 className="text-xl font-semibold mb-4">システム統計</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className={`p-4 rounded-md text-center ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'
              }`}>
              <div className="text-2xl font-bold text-blue-500">30+</div>
              <div className="text-sm">学習コンテンツ</div>
            </div>
            <div className={`p-4 rounded-md text-center ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'
              }`}>
              <div className="text-2xl font-bold text-green-500">451</div>
              <div className="text-sm">CPL試験問題</div>
            </div>
            <div className={`p-4 rounded-md text-center ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'
              }`}>
              <div className="text-2xl font-bold text-purple-500">9+</div>
              <div className="text-sm">登録ユーザー</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminPage;
