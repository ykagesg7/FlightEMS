import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../../stores/authStore';
import supabase from '../../utils/supabase';
import { useTheme } from '../../contexts/ThemeContext';

interface LearningContentInteractionProps {
  contentId: string;
}

interface Like {
  id: string;
  user_id: string;
  created_at: string;
}

interface Comment {
  id: string;
  user_id: string;
  content: string;
  created_at: string;
  updated_at: string;
  profiles?: {
    username: string;
    full_name: string;
  };
}

const LearningContentInteraction: React.FC<LearningContentInteractionProps> = ({ contentId }) => {
  const user = useAuthStore(state => state.user);
  const { theme } = useTheme();
  const [likes, setLikes] = useState<Like[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isLiked, setIsLiked] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // いいね・コメントデータを取得
  const fetchData = async () => {
    try {
      setIsLoading(true);
      console.log('fetchData開始', { contentId });

      // いいねを取得
      const { data: likesData, error: likesError } = await supabase
        .from('learning_content_likes')
        .select('*')
        .eq('content_id', contentId);

      if (likesError) {
        console.error('いいね取得エラー:', likesError);
        throw likesError;
      }
      console.log('いいね取得成功:', likesData);

      // コメントを取得
      const { data: commentsData, error: commentsError } = await supabase
        .from('learning_content_comments')
        .select('*')
        .eq('content_id', contentId)
        .order('created_at', { ascending: true });

      if (commentsError) {
        console.error('コメント取得エラー:', commentsError);
        throw commentsError;
      }
      console.log('コメント取得成功:', commentsData);

      // プロフィール情報を別途取得
      const commentsWithProfiles = [];
      if (commentsData && commentsData.length > 0) {
        for (const comment of commentsData) {
          const { data: profileData } = await supabase
            .from('profiles')
            .select('username, full_name')
            .eq('id', comment.user_id)
            .single();
          
          commentsWithProfiles.push({
            ...comment,
            profiles: profileData
          });
        }
      }

      setLikes(likesData || []);
      setComments(commentsWithProfiles || []);

      // ユーザーがいいねしているかチェック
      if (user) {
        setIsLiked(likesData?.some(like => like.user_id === user.id) || false);
      }
    } catch (error) {
      console.error('データの取得に失敗しました:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    console.log('LearningContentInteraction useEffect triggered', { 
      contentId, 
      user: user ? { id: user.id, email: user.email } : null 
    });
    fetchData();
  }, [contentId, user]);

  // いいねの切り替え
  const toggleLike = async () => {
    if (!user) {
      console.log('ユーザーがログインしていません');
      return;
    }

    console.log('いいねボタンがクリックされました', { contentId, userId: user.id, isLiked });

    try {
      if (isLiked) {
        // いいねを削除
        console.log('いいねを削除中...', { contentId, userId: user.id });
        const { error } = await supabase
          .from('learning_content_likes')
          .delete()
          .eq('content_id', contentId)
          .eq('user_id', user.id);

        if (error) {
          console.error('いいね削除エラー:', error);
          throw error;
        }

        console.log('いいね削除成功');
        setLikes(prev => prev.filter(like => like.user_id !== user.id));
        setIsLiked(false);
      } else {
        // いいねを追加
        console.log('いいねを追加中...', { contentId, userId: user.id });
        const { data, error } = await supabase
          .from('learning_content_likes')
          .insert({
            content_id: contentId,
            user_id: user.id
          })
          .select('*')
          .single();

        if (error) {
          console.error('いいね追加エラー:', error);
          throw error;
        }

        console.log('いいね追加成功:', data);
        setLikes(prev => [...prev, data]);
        setIsLiked(true);
      }
    } catch (error) {
      console.error('いいねの更新に失敗しました:', error);
      alert(`いいねの更新に失敗しました: ${error instanceof Error ? error.message : String(error)}`);
    }
  };

  // コメントを投稿
  const submitComment = async () => {
    if (!user || !newComment.trim()) {
      console.log('コメント投稿条件が満たされていません', { user: !!user, comment: newComment.trim() });
      return;
    }

    try {
      setIsSubmitting(true);
      console.log('コメント投稿中...', { contentId, userId: user.id, content: newComment.trim() });

      const { data, error } = await supabase
        .from('learning_content_comments')
        .insert({
          content_id: contentId,
          user_id: user.id,
          content: newComment.trim()
        })
        .select('*')
        .single();

      if (error) {
        console.error('コメント投稿エラー:', error);
        throw error;
      }

      console.log('コメント投稿成功:', data);

      // プロフィール情報を取得
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('username, full_name')
        .eq('id', user.id)
        .single();

      if (profileError) {
        console.error('プロフィール取得エラー:', profileError);
      }

      const commentWithProfile = {
        ...data,
        profiles: profileData
      };

      setComments(prev => [...prev, commentWithProfile]);
      setNewComment('');
    } catch (error) {
      console.error('コメントの投稿に失敗しました:', error);
      alert(`コメントの投稿に失敗しました: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-4">
        <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className={`mt-8 p-6 rounded-lg border ${
      theme === 'dark' 
        ? 'bg-gray-800 border-gray-700' 
        : 'bg-gray-50 border-gray-200'
    }`}>
      {/* いいねセクション */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={toggleLike}
          disabled={!user}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
            isLiked
              ? 'bg-red-500 text-white hover:bg-red-600'
              : theme === 'dark'
                ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          } ${!user ? 'opacity-50 cursor-not-allowed' : ''}`}
          title={!user ? 'ログインが必要です' : isLiked ? 'いいねを取り消す' : 'いいねする'}
        >
          <span className="text-lg">{isLiked ? '❤️' : '🤍'}</span>
          <span>{likes.length}</span>
        </button>
        
        {/* デバッグ情報（開発時のみ表示） */}
        {process.env.NODE_ENV === 'development' && (
          <div className="text-xs text-gray-500">
            Debug: User={user ? 'logged in' : 'not logged in'}, Likes={likes.length}, IsLiked={isLiked}
          </div>
        )}
        
        {!user && (
          <span className={`text-sm ${
            theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
          }`}>
            ログインしていいね・コメントしよう！
          </span>
        )}
      </div>

      {/* コメント投稿フォーム */}
      {user && (
        <div className="mb-6">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="コメントを入力してください..."
            className={`w-full p-3 rounded-lg border resize-none ${
              theme === 'dark'
                ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
            } focus:ring-2 focus:ring-indigo-500 focus:border-transparent`}
            rows={3}
          />
          <div className="flex justify-end mt-2">
            <button
              onClick={submitComment}
              disabled={!newComment.trim() || isSubmitting}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                !newComment.trim() || isSubmitting
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-indigo-500 text-white hover:bg-indigo-600'
              }`}
              title={!newComment.trim() ? 'コメントを入力してください' : isSubmitting ? '投稿中...' : 'コメントを投稿'}
            >
              {isSubmitting ? '投稿中...' : 'コメント投稿'}
            </button>
            
            {/* デバッグ情報（開発時のみ表示） */}
            {process.env.NODE_ENV === 'development' && (
              <div className="text-xs text-gray-500 ml-2 self-center">
                Debug: Comment="{newComment.trim()}", Submitting={isSubmitting}
              </div>
            )}
          </div>
        </div>
      )}

      {/* コメント一覧 */}
      <div>
        <h3 className={`text-lg font-semibold mb-4 ${
          theme === 'dark' ? 'text-white' : 'text-gray-900'
        }`}>
          コメント ({comments.length})
        </h3>
        
        {comments.length === 0 ? (
          <p className={`text-center py-4 ${
            theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
          }`}>
            まだコメントがありません。最初のコメントを投稿してみましょう！
          </p>
        ) : (
          <div className="space-y-4">
            {comments.map((comment) => (
              <div
                key={comment.id}
                className={`p-4 rounded-lg ${
                  theme === 'dark' ? 'bg-gray-700' : 'bg-white'
                } border ${
                  theme === 'dark' ? 'border-gray-600' : 'border-gray-200'
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className={`font-medium ${
                    theme === 'dark' ? 'text-white' : 'text-gray-900'
                  }`}>
                    {comment.profiles?.full_name || comment.profiles?.username || 'ユーザー'}
                  </span>
                  <span className={`text-sm ${
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                  }`}>
                    {new Date(comment.created_at).toLocaleDateString('ja-JP', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </div>
                <p className={`${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                } whitespace-pre-wrap`}>
                  {comment.content}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default LearningContentInteraction; 