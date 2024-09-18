import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabaseClient';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const Community = () => {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [newPost, setNewPost] = useState({ title: '', content: '' });
  const [newComment, setNewComment] = useState('');
  const [commentingOn, setCommentingOn] = useState(null);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const { data, error } = await supabase
        .from('posts')
        .select(`
          *,
          profiles:user_id (username, avatar_url),
          comments:comments_post_id_fkey (
            id,
            content,
            created_at,
            user_id,
            profiles:user_id (username, avatar_url)
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPosts(data);
    } catch (error) {
      console.error('Error fetching posts:', error.message);
    }
  };

  const handleNewPost = async () => {
    try {
      const { data, error } = await supabase
        .from('posts')
        .insert([{ ...newPost, user_id: user.id }])
        .select();

      if (error) throw error;
      setNewPost({ title: '', content: '' });
      fetchPosts();
    } catch (error) {
      console.error('Error creating new post:', error.message);
    }
  };

  const handleNewComment = async (postId) => {
    try {
      const { data, error } = await supabase
        .from('comments')
        .insert([{ content: newComment, user_id: user.id, post_id: postId }])
        .select();

      if (error) throw error;
      setNewComment('');
      setCommentingOn(null);
      fetchPosts();
    } catch (error) {
      console.error('Error creating new comment:', error.message);
    }
  };

  const handleDeletePost = async (postId) => {
    try {
      const { error } = await supabase
        .from('posts')
        .delete()
        .eq('id', postId)
        .eq('user_id', user.id);

      if (error) throw error;
      fetchPosts();
    } catch (error) {
      console.error('Error deleting post:', error.message);
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      const { error } = await supabase
        .from('comments')
        .delete()
        .eq('id', commentId)
        .eq('user_id', user.id);

      if (error) throw error;
      fetchPosts();
    } catch (error) {
      console.error('Error deleting comment:', error.message);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Community Discussions</h1>
      
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Start a New Discussion</CardTitle>
        </CardHeader>
        <CardContent>
          <Input
            placeholder="Title"
            value={newPost.title}
            onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
            className="mb-4"
          />
          <Textarea
            placeholder="What's on your mind?"
            value={newPost.content}
            onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
            className="mb-4"
          />
          <Button onClick={handleNewPost}>Post</Button>
        </CardContent>
      </Card>

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
                <Button variant="destructive" size="sm" onClick={() => handleDeletePost(post.id)}>Delete</Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <p className="mb-4">{post.content}</p>
            <h4 className="font-semibold mb-2">Comments:</h4>
            {post.comments && post.comments.map((comment) => (
              <div key={comment.id} className="mb-2 pl-4 border-l-2 border-gray-200">
                <div className="flex items-center justify-between">
                  <p>
                    <span className="font-semibold">{comment.profiles.username}: </span>
                    {comment.content}
                  </p>
                  {user && comment.user_id === user.id && (
                    <Button variant="ghost" size="sm" onClick={() => handleDeleteComment(comment.id)}>Delete</Button>
                  )}
                </div>
              </div>
            ))}
            {commentingOn === post.id ? (
              <div className="mt-4">
                <Textarea
                  placeholder="Write a comment..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className="mb-2"
                />
                <Button onClick={() => handleNewComment(post.id)} className="mr-2">Submit</Button>
                <Button variant="outline" onClick={() => setCommentingOn(null)}>Cancel</Button>
              </div>
            ) : (
              <Button variant="outline" onClick={() => setCommentingOn(post.id)} className="mt-2">Add Comment</Button>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default Community;