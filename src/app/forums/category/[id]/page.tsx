'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';
import ProtectedRoute from '@/components/auth/ProtectedRoute';

type ForumCategory = {
  id: string;
  name: string;
  description: string;
};

type ForumTopic = {
  id: string;
  title: string;
  category_id: string;
  created_by: string;
  created_at: string;
  is_pinned: boolean;
  is_locked: boolean;
  views_count: number;
  replies_count: number;
  last_post_at?: string;
  author?: {
    first_name?: string;
    last_name?: string;
    profile_image_url?: string;
  };
  last_poster?: {
    first_name?: string;
    last_name?: string;
  };
};

export default function CategoryPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { user } = useAuth();
  
  const [category, setCategory] = useState<ForumCategory | null>(null);
  const [topics, setTopics] = useState<ForumTopic[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    async function loadCategoryAndTopics() {
      if (!params.id) return;
      
      try {
        setLoading(true);
        setError(null);
        
        // Get category details
        const { data: categoryData, error: categoryError } = await supabase
          .from('forum_categories')
          .select('*')
          .eq('id', params.id)
          .single();
          
        if (categoryError) throw categoryError;
        
        if (categoryData) {
          setCategory(categoryData as ForumCategory);
          
          // Get topics in this category
          const { data: topicsData, error: topicsError } = await supabase
            .from('forum_topics')
            .select(`
              *,
              author:created_by(first_name, last_name, profile_image_url),
              replies_count:forum_posts(count),
              last_post:forum_posts(created_at, author:user_id(first_name, last_name))
            `)
            .eq('category_id', params.id)
            .order('is_pinned', { ascending: false })
            .order('created_at', { ascending: false });
            
          if (topicsError) throw topicsError;
          
          if (topicsData) {
            // Process the data to get the counts and last post info
            const processedTopics = topicsData.map(topic => {
              const lastPost = topic.last_post && topic.last_post.length > 0 
                ? topic.last_post.sort((a: any, b: any) => 
                    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
                  )[0]
                : null;
                
              return {
                id: topic.id,
                title: topic.title,
                category_id: topic.category_id,
                created_by: topic.created_by,
                created_at: topic.created_at,
                is_pinned: topic.is_pinned,
                is_locked: topic.is_locked,
                views_count: topic.views_count || 0,
                replies_count: topic.replies_count - 1, // Subtract 1 to exclude the original post
                last_post_at: lastPost?.created_at,
                author: topic.author,
                last_poster: lastPost?.author
              };
            });
            
            setTopics(processedTopics);
          }
        }
      } catch (err: any) {
        console.error('Error loading category and topics:', err);
        setError(err.message || 'Failed to load category and topics');
      } finally {
        setLoading(false);
      }
    }
    
    loadCategoryAndTopics();
  }, [params.id]);
  
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Never';
    
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };
  
  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) {
      return `${diffInSeconds} seconds ago`;
    }
    
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) {
      return `${diffInMinutes} minute${diffInMinutes === 1 ? '' : 's'} ago`;
    }
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) {
      return `${diffInHours} hour${diffInHours === 1 ? '' : 's'} ago`;
    }
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 30) {
      return `${diffInDays} day${diffInDays === 1 ? '' : 's'} ago`;
    }
    
    return formatDate(dateString);
  };
  
  return (
    <ProtectedRoute>
      <div className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <Link href="/forums" className="text-blue-600 hover:text-blue-800">
            &larr; Back to Forums
          </Link>
        </div>
        
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : error ? (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        ) : category ? (
          <>
            <div className="md:flex md:items-center md:justify-between mb-6">
              <div className="flex-1 min-w-0">
                <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
                  {category.name}
                </h2>
                <p className="mt-1 text-sm text-gray-500">
                  {category.description}
                </p>
              </div>
              <div className="mt-4 flex md:mt-0 md:ml-4">
                <Link href={`/forums/new-topic?category=${category.id}`}>
                  <Button>
                    New Topic
                  </Button>
                </Link>
              </div>
            </div>
            
            {topics.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-lg shadow">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">No topics</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Be the first to start a discussion in this category.
                </p>
                <div className="mt-6">
                  <Link href={`/forums/new-topic?category=${category.id}`}>
                    <Button>
                      Start New Topic
                    </Button>
                  </Link>
                </div>
              </div>
            ) : (
              <div className="bg-white shadow overflow-hidden sm:rounded-md">
                <ul className="divide-y divide-gray-200">
                  {topics.map((topic) => (
                    <li key={topic.id}>
                      <Link href={`/forums/topic/${topic.id}`}>
                        <div className="block hover:bg-gray-50">
                          <div className="px-4 py-4 sm:px-6">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-3">
                                {topic.author?.profile_image_url ? (
                                  <img 
                                    className="h-10 w-10 rounded-full"
                                    src={topic.author.profile_image_url}
                                    alt=""
                                  />
                                ) : (
                                  <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                                    <svg className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                  </div>
                                )}
                                <div>
                                  <div className="flex items-center">
                                    {topic.is_pinned && (
                                      <svg className="h-4 w-4 text-blue-500 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                                      </svg>
                                    )}
                                    {topic.is_locked && (
                                      <svg className="h-4 w-4 text-red-500 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                      </svg>
                                    )}
                                    <div className="text-sm font-medium text-blue-600">
                                      {topic.title}
                                    </div>
                                  </div>
                                  <div className="text-xs text-gray-500">
                                    Started by {topic.author?.first_name} {topic.author?.last_name} • {getTimeAgo(topic.created_at)}
                                  </div>
                                </div>
                              </div>
                              <div className="ml-6 flex-shrink-0 flex flex-col items-end">
                                <div className="flex space-x-4 text-sm text-gray-500">
                                  <div>
                                    <span className="font-medium">{topic.views_count}</span> views
                                  </div>
                                  <div>
                                    <span className="font-medium">{topic.replies_count}</span> replies
                                  </div>
                                </div>
                                {topic.last_post_at && topic.last_poster && (
                                  <div className="text-xs text-gray-500 mt-1">
                                    Last reply by {topic.last_poster.first_name} {topic.last_poster.last_name} • {getTimeAgo(topic.last_post_at)}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">Category not found</p>
            <Link href="/forums">
              <Button>Back to Forums</Button>
            </Link>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}