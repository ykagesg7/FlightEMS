import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabaseClient';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ThumbsUp, MessageSquare } from 'lucide-react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { toast, Toaster } from 'react-hot-toast';

const POSTS_PER_PAGE = 10;

export default function Community() {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [newPost, setNewPost] = useState({ title: '', content: '' });
  const [newComment, setNewComment] = useState('');
  const [commentingOn, setCommentingOn] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchPosts();
  }, [currentPage]);

  const fetchPosts = async () => {
    setIsLoading(true);
    setError(null);
    try {
      let { data, error } = await supabase
        .from('posts')
        .select(`
          *,
          profiles:user_id (username, avatar_url),
          comments (
            id,
            content,
            created_at,
            user_id,
            profiles:user_id (username, avatar_url)
          ),
          likes (id, user_id)
        `)
        .order('created_at', { ascending: false })
        .range(currentPage * POSTS_PER_PAGE, (currentPage + 1) * POSTS_PER_PAGE - 1);

      if (error) throw error;
      setPosts(data || []);
    } catch (error) {
      console.error('Error fetching posts:', error);
      setError('投稿の取得中にエラーが発生しました。');
    } finally {
      setIsLoading(false);
    }
  };

  const createPost = async () => {
    if (!newPost.title.trim() || !newPost.content.trim()) {
      toast.error('タイトルと内容を入力してください。');
      return;
    }

    if (!window.confirm('投稿してもよろしいですか？')) {
      return;
    }

    try {
      const { data, error } = await supabase
        .from('posts')
        .insert([{ ...newPost, user_id: user.id }])
        .select(`
          *,
          profiles:user_id (username, avatar_url)
        `);
      if (error) throw error;
      setPosts([data[0], ...posts]);
      setNewPost({ title: '', content: '' });
      toast.success('投稿が作成されました。');
    } catch (error) {
      console.error('Error creating post:', error);
      toast.error('投稿の作成中にエラーが発生しました。');
    }
  };

  const createComment = async (postId) => {
    if (!newComment.trim()) {
      toast.error('コメント内容を入力してください。');
      return;
    }

    try {
      const { data, error } = await supabase
        .from('comments')
        .insert([{ content: newComment, user_id: user.id, post_id: postId }])
        .select(`
          id,
          content,
          created_at,
          user_id,
          profiles:user_id (username, avatar_url)
        `);
      if (error) throw error;
      const updatedPosts = posts.map(post => {
        if (post.id === postId) {
          return { ...post, comments: [...(post.comments || []), data[0]] };
        }
        return post;
      });
      setPosts(updatedPosts);
      setNewComment('');
      setCommentingOn(null);
      toast.success('コメントが投稿されました。');
    } catch (error) {
      console.error('Error creating comment:', error);
      toast.error('コメントの作成中にエラーが発生しました。');
    }
  };

  const toggleLike = async (postId) => {
    if (!user) {
      toast.error('いいねするにはログインが必要です。');
      return;
    }

    try {
      const likedPost = posts.find(post => post.id === postId);
      if (!likedPost) {
        console.error('Post not found');
        return;
      }

      const isLiked = likedPost.likes && Array.isArray(likedPost.likes) &&
                      likedPost.likes.some(like => like.user_id === user.id);
      
      if (isLiked) {
        await supabase
          .from('likes')
          .delete()
          .eq('post_id', postId)
          .eq('user_id', user.id);
      } else {
        await supabase
          .from('likes')
          .insert([{ post_id: postId, user_id: user.id }]);
      }

      const updatedPosts = posts.map(post => {
        if (post.id === postId) {
          const updatedLikes = isLiked
            ? (post.likes || []).filter(like => like.user_id !== user.id)
            : [...(post.likes || []), { user_id: user.id }];
          return { ...post, likes: updatedLikes };
        }
        return post;
      });
      setPosts(updatedPosts);
      toast.success(isLiked ? 'いいねを取り消しました。' : 'いいねしました。');
    } catch (error) {
      console.error('Error toggling like:', error);
      toast.error('いいねの更新中にエラーが発生しました。');
    }
  };

  const deletePost = async (postId) => {
    if (window.confirm('本当にこの投稿を削除しますか？')) {
      try {
        const { error } = await supabase
          .from('posts')
          .delete()
          .eq('id', postId)
          .eq('user_id', user.id);
        if (error) throw error;
        setPosts(posts.filter(post => post.id !== postId));
        toast.success('投稿が削除されました。');
      } catch (error) {
        console.error('Error deleting post:', error);
        toast.error('投稿の削除中にエラーが発生しました。');
      }
    }
  };

  const deleteComment = async (commentId) => {
    if (window.confirm('本当にこのコメントを削除しますか？')) {
      try {
        const { error } = await supabase
          .from('comments')
          .delete()
          .eq('id', commentId)
          .eq('user_id', user.id);
        if (error) throw error;
        const updatedPosts = posts.map(post => ({
          ...post,
          comments: (post.comments || []).filter(comment => comment.id !== commentId)
        }));
        setPosts(updatedPosts);
        toast.success('コメントが削除されました。');
      } catch (error) {
        console.error('Error deleting comment:', error);
        toast.error('コメントの削除中にエラーが発生しました。');
      }
    }
  };

  if (isLoading) {
    return <div>読み込み中...</div>;
  }

  if (error) {
    return <div>エラーが発生しました: {error}</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Toaster position="top-center" reverseOrder={false} />
      <h1 className="text-3xl font-bold mb-8">コミュニティ</h1>
      
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>新しいディスカッションを始めましょう</CardTitle>
        </CardHeader>
        <CardContent>
          <Input
            placeholder="タイトル"
            value={newPost.title}
            onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
            className="mb-4"
          />
          <ReactQuill
            value={newPost.content}
            onChange={(content) => setNewPost({ ...newPost, content })}
            className="mb-4"
          />
          <Button onClick={createPost}>投稿</Button>
        </CardContent>
      </Card>

      <h2 className="text-2xl font-semibold mb-4">最近のディスカッション</h2>

      {posts.map((post) => (
        <Card key={post.id} className="mb-4">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Avatar className="mr-2">
                  <AvatarImage src={post.profiles?.avatar_url} />
                  <AvatarFallback>{post.profiles?.username?.charAt(0).toUpperCase() || 'U'}</AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle>{post.title}</CardTitle>
                  <p className="text-sm text-gray-500">投稿者: {post.profiles?.username || '不明なユーザー'}</p>
                </div>
              </div>
              {user && post.user_id === user.id && (
                <Button variant="destructive" size="sm" onClick={() => deletePost(post.id)}>削除</Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div dangerouslySetInnerHTML={{ __html: post.content }} className="mb-4" />
            <CardFooter className="flex justify-between items-center pt-4 border-t">
              <div className="flex items-center space-x-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleLike(post.id)}
                >
                  <ThumbsUp className={`mr-2 h-4 w-4 ${post.likes && Array.isArray(post.likes) && post.likes.some(like => like.user_id === user?.id) ? 'text-blue-500' : ''}`} />
                  {post.likes ? post.likes.length : 0}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setCommentingOn(commentingOn === post.id ? null : post.id)}
                >
                  <MessageSquare className="mr-2 h-4 w-4" />
                  {post.comments ? post.comments.length : 0}
                </Button>
              </div>
              <span className="text-sm text-gray-500">{new Date(post.created_at).toLocaleString()}</span>
            </CardFooter>
          </CardContent>
          <CardContent>
            <h4 className="font-semibold mb-2">コメント:</h4>
            {post.comments && post.comments.map((comment) => (
              <div key={comment.id} className="mb-2 pl-4 border-l-2 border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-semibold">{comment.profiles?.username || '不明なユーザー'}: </span>
                    <div dangerouslySetInnerHTML={{ __html: comment.content }} />
                  </div>
                  {user && comment.user_id === user.id && (
                    <Button variant="ghost" size="sm" onClick={() => deleteComment(comment.id)}>削除</Button>
                  )}
                </div>
              </div>
            ))}
            {commentingOn === post.id && (
              <div className="mt-4">
                <ReactQuill
                  value={newComment}
                  onChange={setNewComment}
                  className="mb-2"
                />
                <Button onClick={() => createComment(post.id)} className="mr-2">送信</Button>
                <Button variant="outline" onClick={() => setCommentingOn(null)}>キャンセル</Button>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
      <div className="flex justify-between mt-4">
        <Button
          onClick={() => setCurrentPage(prev => Math.max(0, prev - 1))}
          disabled={currentPage === 0}
        >
          前のページ
        </Button>
        <Button
          onClick={() => setCurrentPage(prev => prev + 1)}
          disabled={posts.length < POSTS_PER_PAGE}
        >
          次のページ
        </Button>
      </div>
    </div>
  );
}