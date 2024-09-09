import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ThumbsUp, MessageCircle, ChevronDown, ChevronUp } from "lucide-react";
import { supabase } from '@/lib/supabaseClient';

export default function Community() {
  const [posts, setPosts] = useState([]);
  const [newPost, setNewPost] = useState({ title: '', content: '', tags: [] });
  const [comments, setComments] = useState({});
  const [newComments, setNewComments] = useState({});
  const [showComments, setShowComments] = useState({});
  const [sortOption, setSortOption] = useState('newest');
  const [availableTags, setAvailableTags] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchPosts();
    fetchTags();
    setupRealtimeSubscription();
  }, []);

  const fetchPosts = async () => {
    const { data, error } = await supabase
      .from('posts')
      .select('*, user:users(name), post_tags(tag_id, tags(name))')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching posts:', error);
    } else {
      setPosts(data);
    }
  };

  const fetchTags = async () => {
    const { data, error } = await supabase
      .from('tags')
      .select('*');

    if (error) {
      console.error('Error fetching tags:', error);
    } else {
      setAvailableTags(data);
    }
  };

  const setupRealtimeSubscription = () => {
    const postsChannel = supabase
      .channel('public:posts')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'posts' }, payload => {
        if (payload.eventType === 'INSERT') {
          setPosts(currentPosts => [payload.new, ...currentPosts]);
        } else if (payload.eventType === 'UPDATE') {
          setPosts(currentPosts => currentPosts.map(post => post.id === payload.new.id ? payload.new : post));
        } else if (payload.eventType === 'DELETE') {
          setPosts(currentPosts => currentPosts.filter(post => post.id !== payload.old.id));
        }
      })
      .subscribe();

    const commentsChannel = supabase
      .channel('public:comments')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'comments' }, payload => {
        if (payload.eventType === 'INSERT') {
          setComments(currentComments => ({
            ...currentComments,
            [payload.new.post_id]: [...(currentComments[payload.new.post_id] || []), payload.new]
          }));
        } else if (payload.eventType === 'UPDATE') {
          setComments(currentComments => ({
            ...currentComments,
            [payload.new.post_id]: currentComments[payload.new.post_id].map(comment => 
              comment.id === payload.new.id ? payload.new : comment
            )
          }));
        } else if (payload.eventType === 'DELETE') {
          setComments(currentComments => ({
            ...currentComments,
            [payload.old.post_id]: currentComments[payload.old.post_id].filter(comment => comment.id !== payload.old.id)
          }));
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(postsChannel);
      supabase.removeChannel(commentsChannel);
    };
  };

  const handleNewPost = async () => {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) {
      navigate('/login');
      return;
    }

    const { data, error } = await supabase
      .from('posts')
      .insert({
        title: newPost.title,
        content: newPost.content,
        user_id: userData.user.id
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating new post:', error);
    } else {
      // Add tags to the post
      if (newPost.tags.length > 0) {
        const { error: tagError } = await supabase
          .from('post_tags')
          .insert(newPost.tags.map(tagId => ({ post_id: data.id, tag_id: tagId })));

        if (tagError) {
          console.error('Error adding tags to post:', tagError);
        }
      }

      setNewPost({ title: '', content: '', tags: [] });
    }
  };

  const handleNewComment = async (postId) => {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) {
      navigate('/login');
      return;
    }

    const { data, error } = await supabase
      .from('comments')
      .insert({
        content: newComments[postId],
        post_id: postId,
        user_id: userData.user.id
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating new comment:', error);
    } else {
      setNewComments({ ...newComments, [postId]: '' });
    }
  };

  const handleLike = async (postId) => {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) {
      navigate('/login');
      return;
    }

    const { data, error } = await supabase
      .from('likes')
      .upsert({ user_id: userData.user.id, post_id: postId }, { onConflict: ['user_id', 'post_id'] })
      .select();

    if (error) {
      console.error('Error liking post:', error);
    }
  };

  const sortedPosts = useMemo(() => {
    switch (sortOption) {
      case 'oldest':
        return [...posts].sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
      case 'most_commented':
        return [...posts].sort((a, b) => b.comment_count - a.comment_count);
      case 'most_liked':
        return [...posts].sort((a, b) => b.like_count - a.like_count);
      default:
        return [...posts].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    }
  }, [posts, sortOption]);

  const filteredPosts = useMemo(() => {
    if (selectedTags.length === 0) return sortedPosts;
    return sortedPosts.filter(post => 
      post.post_tags.some(postTag => selectedTags.includes(postTag.tag_id))
    );
  }, [sortedPosts, selectedTags]);

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
          <Select
            multiple
            value={newPost.tags}
            onChange={(value) => setNewPost({ ...newPost, tags: value })}
          >
            <SelectTrigger className="w-full mb-4">
              <SelectValue placeholder="Select tags" />
            </SelectTrigger>
            <SelectContent>
              {availableTags.map((tag) => (
                <SelectItem key={tag.id} value={tag.id}>{tag.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={handleNewPost}>Post</Button>
        </CardContent>
      </Card>

      <div className="mb-4 flex justify-between items-center">
        <Select value={sortOption} onValueChange={setSortOption}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Newest</SelectItem>
            <SelectItem value="oldest">Oldest</SelectItem>
            <SelectItem value="most_commented">Most Commented</SelectItem>
            <SelectItem value="most_liked">Most Liked</SelectItem>
          </SelectContent>
        </Select>

        <Select
          multiple
          value={selectedTags}
          onChange={(value) => setSelectedTags(value)}
        >
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Filter by tags" />
          </SelectTrigger>
          <SelectContent>
            {availableTags.map((tag) => (
              <SelectItem key={tag.id} value={tag.id}>{tag.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {filteredPosts.map((post) => (
        <Card key={post.id} className="mb-4">
          <CardHeader>
            <div className="flex items-center">
              <Avatar className="mr-2">
                <AvatarImage src={`https://api.dicebear.com/6.x/initials/svg?seed=${post.user.name}`} />
                <AvatarFallback>{post.user.name[0]}</AvatarFallback>
              </Avatar>
              <div>
                <CardTitle>{post.title}</CardTitle>
                <p className="text-sm text-gray-500">by {post.user.name}</p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="mb-4">{post.content}</p>
            <div className="flex flex-wrap gap-2 mb-4">
              {post.post_tags.map(({ tags }) => (
                <Badge key={tags.id} variant="secondary">{tags.name}</Badge>
              ))}
            </div>
            <div className="flex items-center mb-4">
              <Button variant="outline" size="sm" onClick={() => handleLike(post.id)} className="mr-2">
                <ThumbsUp className="mr-1 h-4 w-4" /> {post.like_count}
              </Button>
              <Button variant="outline" size="sm" onClick={() => setShowComments(prev => ({ ...prev, [post.id]: !prev[post.id] }))} className="flex items-center">
                <MessageCircle className="mr-1 h-4 w-4" />
                {post.comment_count} comments
                {showComments[post.id] ? <ChevronUp className="ml-1 h-4 w-4" /> : <ChevronDown className="ml-1 h-4 w-4" />}
              </Button>
            </div>
            
            {showComments[post.id] && (
              <div className="mt-4">
                <h3 className="font-semibold mb-2">Comments</h3>
                {comments[post.id]?.map((comment) => (
                  <div key={comment.id} className="bg-gray-100 p-2 rounded mb-2">
                    <div className="flex items-center mb-2">
                      <Avatar className="mr-2 h-6 w-6">
                        <AvatarImage src={`https://api.dicebear.com/6.x/initials/svg?seed=${comment.user.name}`} />
                        <AvatarFallback>{comment.user.name[0]}</AvatarFallback>
                      </Avatar>
                      <p className="text-sm font-semibold">{comment.user.name}</p>
                    </div>
                    <p className="text-sm mb-2">{comment.content}</p>
                  </div>
                ))}
                <div className="mt-2">
                  <Input
                    placeholder="Add a comment..."
                    value={newComments[post.id] || ''}
                    onChange={(e) => setNewComments({ ...newComments, [post.id]: e.target.value })}
                    className="mb-2"
                  />
                  <Button size="sm" onClick={() => handleNewComment(post.id)}>Add Comment</Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}