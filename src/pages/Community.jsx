import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabaseClient';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ThumbsUp, MessageSquare } from 'lucide-react';
import { Editor } from '@tinymce/tinymce-react';

const POSTS_PER_PAGE = 10;

export default function Community() {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [newPost, setNewPost] = useState({ title: '', content: '' });
  const [newComment, setNewComment] = useState('');
  const [commentingOn, setCommentingOn] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);
  const editorRef = useRef(null);

  useEffect(() => {
    fetchPosts();
  }, [currentPage]);

  const fetchPosts = async () => {
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
      setPosts(data);
    } catch (error) {
      console.error('Error fetching posts:', error);
    }
  };

  const createPost = async () => {
    if (editorRef.current) {
      try {
        const content = editorRef.current.getContent();
        const { data, error } = await supabase
          .from('posts')
          .insert([{ ...newPost, content, user_id: user.id }])
          .select();
        if (error) throw error;
        setPosts([data[0], ...posts]);
        setNewPost({ title: '', content: '' });
        editorRef.current.setContent('');
      } catch (error) {
        console.error('Error creating post:', error);
      }
    }
  };

  const createComment = async (postId) => {
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
          return { ...post, comments: [...post.comments, data[0]] };
        }
        return post;
      });
      setPosts(updatedPosts);
      setNewComment('');
      setCommentingOn(null);
    } catch (error) {
      console.error('Error creating comment:', error);
    }
  };

  const toggleLike = async (postId) => {
    try {
      const likedPost = posts.find(post => post.id === postId);
      const isLiked = likedPost.likes.some(like => like.user_id === user.id);
      
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
            ? post.likes.filter(like => like.user_id !== user.id)
            : [...post.likes, { user_id: user.id }];
          return { ...post, likes: updatedLikes };
        }
        return post;
      });
      setPosts(updatedPosts);
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  const deletePost = async (postId) => {
    try {
      const { error } = await supabase
        .from('posts')
        .delete()
        .eq('id', postId)
        .eq('user_id', user.id);
      if (error) throw error;
      setPosts(posts.filter(post => post.id !== postId));
    } catch (error) {
      console.error('Error deleting post:', error);
    }
  };

  const deleteComment = async (commentId) => {
    try {
      const { error } = await supabase
        .from('comments')
        .delete()
        .eq('id', commentId)
        .eq('user_id', user.id);
      if (error) throw error;
      const updatedPosts = posts.map(post => ({
        ...post,
        comments: post.comments.filter(comment => comment.id !== commentId)
      }));
      setPosts(updatedPosts);
    } catch (error) {
      console.error('Error deleting comment:', error);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Community</h1>
      
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>新しいDiscussionをはじめましょう</CardTitle>
        </CardHeader>
        <CardContent>
          <Input
            placeholder="Title"
            value={newPost.title}
            onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
            className="mb-4"
          />
          <Editor
            onInit={(evt, editor) => editorRef.current = editor}
            initialValue=""
            init={{
              height: 300,
              menubar: false,
              plugins: [
                'advlist autolink lists link image charmap print preview anchor',
                'searchreplace visualblocks code fullscreen',
                'insertdatetime media table paste code help wordcount'
              ],
              toolbar: 'undo redo | formatselect | ' +
              'bold italic backcolor | alignleft aligncenter ' +
              'alignright alignjustify | bullist numlist outdent indent | ' +
              'removeformat | help',
              content_style: 'body { font-family:Helvetica,Arial,sans-serif; font-size:14px }'
            }}
            className="mb-4"
            tinymceScriptSrc={'/tinymce/tinymce.min.js'} // TinyMCEのスクリプトへのパス
          />
          <Button onClick={createPost}>Post</Button>
        </CardContent>
      </Card>

      <h2 className="text-2xl font-semibold mb-4">Recent Discussions</h2>

      {posts.map((post) => (
        <Card key={post.id} className="mb-4">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Avatar className="mr-2">
                  <AvatarImage src={post.profiles?.avatar_url} />
                  <AvatarFallback>{post.profiles?.username?.charAt(0) || 'U'}</AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle>{post.title}</CardTitle>
                  <p className="text-sm text-gray-500">by {post.profiles?.username || 'Unknown User'}</p>
                </div>
              </div>
              {user && post.user_id === user.id && (
                <Button variant="destructive" size="sm" onClick={() => deletePost(post.id)}>Delete</Button>
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
                  <ThumbsUp className={`mr-2 h-4 w-4 ${post.likes.some(like => like.user_id === user.id) ? 'text-blue-500' : ''}`} />
                  {post.likes.length}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setCommentingOn(commentingOn === post.id ? null : post.id)}
                >
                  <MessageSquare className="mr-2 h-4 w-4" />
                  {post.comments.length}
                </Button>
              </div>
              <span className="text-sm text-gray-500">{new Date(post.created_at).toLocaleString()}</span>
            </CardFooter>
          </CardContent>
          <CardContent>
            <h4 className="font-semibold mb-2">Comments:</h4>
            {post.comments && post.comments.map((comment) => (
              <div key={comment.id} className="mb-2 pl-4 border-l-2 border-gray-200">
                <div className="flex items-center justify-between">
                  <p>
                    <span className="font-semibold">{comment.profiles?.username || 'Unknown User'}: </span>
                    {comment.content}
                  </p>
                  {user && comment.user_id === user.id && (
                    <Button variant="ghost" size="sm" onClick={() => deleteComment(comment.id)}>Delete</Button>
                  )}
                </div>
              </div>
            ))}
            {commentingOn === post.id && (
              <div className="mt-4">
                <Textarea
                  placeholder="Write a comment..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className="mb-2"
                />
                <Button onClick={() => createComment(post.id)} className="mr-2">Submit</Button>
                <Button variant="outline" onClick={() => setCommentingOn(null)}>Cancel</Button>
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
          Previous Page
        </Button>
        <Button
          onClick={() => setCurrentPage(prev => prev + 1)}
          disabled={posts.length < POSTS_PER_PAGE}
        >
          Next Page
        </Button>
      </div>
    </div>
  );
}