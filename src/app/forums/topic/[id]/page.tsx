'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { formatDistanceToNow } from 'date-fns';

interface Post {
  id: string;
  content: string;
  created_at: string;
  author_id: string;
  author: {
    id: string;
    first_name: string;
    last_name: string;
    avatar_url: string;
  };
}

interface Topic {
  id: string;
  title: string;
  created_at: string;
  category_id: string;
  author_id: string;
  author: {
    id: string;
    first_name: string;
    last_name: string;
    avatar_url: string;
  };
}

export default function TopicPage() {
  const params = useParams();
  const topicId = params?.id as string;
  const { user } = useAuth();
  
  const [topic, setTopic] = useState<Topic | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [newPostContent, setNewPostContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    async function fetchTopicAndPosts() {
      try {
        setLoading(true);
        
        // Fetch topic
        const { data: topicData, error: topicError } = await supabase
          .from('forum_topics')
          .select(`
            *,
            author:author_id (id, first_name, last_name, avatar_url)
          `)
          .eq('id', topicId)
          .single();
        
        if (topicError) throw topicError;
        
        // Fetch posts
        const { data: postsData, error: postsError } = await supabase
          .from('forum_posts')
          .select(`
            *,
            author:author_id (id, first_name, last_name, avatar_url)
          `)
          .eq('topic_id', topicId)
          .order('created_at', { ascending: true });
        
        if (postsError) throw postsError;
        
        setTopic(topicData as Topic);
        setPosts(postsData as Post[]);
      } catch (err: any) {
        console.error('Error fetching topic data:', err);
        setError(err.message || 'Failed to load topic');
      } finally {
        setLoading(false);
      }
    }
    
    if (topicId) {
      fetchTopicAndPosts();
    }
  }, [topicId]);
  
  const handleSubmitPost = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      setError('You must be logged in to post');
      return;
    }
    
    if (!newPostContent.trim()) {
      setError('Post content cannot be empty');
      return;
    }
    
    try {
      setSubmitting(true);
      setError(null);
      
      const { data, error: postError } = await supabase
        .from('forum_posts')
        .insert([
          {
            topic_id: topicId,
            author_id: user.id,
            content: newPostContent
          }
        ])
        .select(`
          *,
          author:author_id (id, first_name, last_name, avatar_url)
        `)
        .single();
      
      if (postError) throw postError;
      
      setPosts([...posts, data as Post]);
      setNewPostContent('');
    } catch (err: any) {
      console.error('Error posting reply:', err);
      setError(err.message || 'Failed to post reply');
    } finally {
      setSubmitting(false);
    }
  };
  
  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  if (error && !topic) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      </div>
    );
  }
  
  if (!topic) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <p className="text-gray-500">Topic not found</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">{topic.title}</h1>
        <div className="flex items-center text-sm text-gray-500">
          <span>Started by {topic.author.first_name} {topic.author.last_name}</span>
          <span className="mx-2">•</span>
          <span>{formatDistanceToNow(new Date(topic.created_at), { addSuffix: true })}</span>
        </div>
      </div>
      
      <div className="space-y-6 mb-8">
        {posts.map(post => (
          <div key={post.id} className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-start space-x-4">
              <Avatar className="h-10 w-10">
                <AvatarImage src={post.author.avatar_url || ''} alt={`${post.author.first_name} ${post.author.last_name}`} />
                <AvatarFallback>{post.author.first_name[0]}{post.author.last_name[0]}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex justify-between items-center mb-2">
                  <div>
                    <span className="font-medium">{post.author.first_name} {post.author.last_name}</span>
                    <span className="text-sm text-gray-500 ml-2">
                      {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
                    </span>
                  </div>
                </div>
                <div className="prose max-w-none">
                  {post.content}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {user ? (
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium mb-4">Post a Reply</h3>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}
          <form onSubmit={handleSubmitPost}>
            <div className="mb-4">
              <textarea
                className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={5}
                placeholder="Write your reply here..."
                value={newPostContent}
                onChange={(e) => setNewPostContent(e.target.value)}
                required
              ></textarea>
            </div>
            <Button type="submit" disabled={submitting}>
              {submitting ? 'Posting...' : 'Post Reply'}
            </Button>
          </form>
        </div>
      ) : (
        <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 text-center">
          <p className="mb-4">You need to be logged in to post a reply.</p>
          <Link href="/auth/login">
            <Button type="button">
              Log In
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}