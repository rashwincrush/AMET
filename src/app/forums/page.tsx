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
  icon?: string;
  topics_count: number;
  posts_count: number;
  created_at: string;
  last_post_at?: string;
  last_poster?: {
    first_name?: string;
    last_name?: string;
  };
};

export default function ForumsPage() {
  const router = useRouter();
  const { user } = useAuth();
  
  const [categories, setCategories] = useState<ForumCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    async function loadCategories() {
      try {
        setLoading(true);
        setError(null);
        
        // Get all forum categories with counts
        const { data, error } = await supabase
          .from('forum_categories')
          .select(`
            *,
            topics_count:forum_topics(count),
            posts_count:forum_posts(count),
            last_post:forum_posts(created_at, author:user_id(first_name, last_name))
          `)
          .order('name', { ascending: true });
          
        if (error) throw error;
        
        if (data) {
          // Process the data to get the counts and last post info
          const processedData = data.map(category => {
            const lastPost = category.last_post && category.last_post.length > 0 
              ? category.last_post.sort((a: any, b: any) => 
                  new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
                )[0]
              : null;
              
            return {
              id: category.id,
              name: category.name,
              description: category.description,
              icon: category.icon,
              topics_count: category.topics_count,
              posts_count: category.posts_count,
              created_at: category.created_at,
              last_post_at: lastPost?.created_at,
              last_poster: lastPost?.author
            };
          });
          
          setCategories(processedData);
        }
      } catch (err: any) {
        console.error('Error loading forum categories:', err);
        setError(err.message || 'Failed to load forum categories');
      } finally {
        setLoading(false);
      }
    }
    
    loadCategories();
  }, []);
  
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Never';
    
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };
  
  return (
    <ProtectedRoute>
      <div className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
        <div className="md:flex md:items-center md:justify-between mb-6">
          <div className="flex-1 min-w-0">
            <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
              Alumni Forums
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Connect with fellow alumni, share experiences, and discuss topics of interest.
            </p>
          </div>
          <div className="mt-4 flex md:mt-0 md:ml-4">
            <Link href="/forums/new-topic">
              <Button>
                Start New Topic
              </Button>
            </Link>
          </div>
        </div>
        
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : error ? (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        ) : categories.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No forum categories</h3>
            <p className="mt-1 text-sm text-gray-500">
              No forum categories have been created yet.
            </p>
          </div>
        ) : (
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <ul className="divide-y divide-gray-200">
              {categories.map((category) => (
                <li key={category.id}>
                  <Link href={`/forums/category/${category.id}`}>
                    <div className="block hover:bg-gray-50">
                      <div className="px-4 py-4 sm:px-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            {category.icon ? (
                              <div className="flex-shrink-0 h-10 w-10 flex items-center justify-center rounded-md bg-blue-100 text-blue-600">
                                <span className="text-xl">{category.icon}</span>
                              </div>
                            ) : (
                              <div className="flex-shrink-0 h-10 w-10 flex items-center justify-center rounded-md bg-blue-100 text-blue-600">
                                <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
                                </svg>
                              </div>
                            )}
                            <div className="ml-4">
                              <div className="text-sm font-medium text-blue-600">
                                {category.name}
                              </div>
                              <div className="text-sm text-gray-500">
                                {category.description}
                              </div>
                            </div>
                          </div>
                          <div className="ml-6 flex-shrink-0 flex flex-col items-end">
                            <div className="flex space-x-4 text-sm text-gray-500">
                              <div>
                                <span className="font-medium">{category.topics_count}</span> topics
                              </div>
                              <div>
                                <span className="font-medium">{category.posts_count}</span> posts
                              </div>
                            </div>
                            <div className="text-sm text-gray-500 mt-1">
                              {category.last_post_at ? (
                                <span>
                                  Last post on {formatDate(category.last_post_at)} by {category.last_poster?.first_name} {category.last_poster?.last_name}
                                </span>
                              ) : (
                                <span>No posts yet</span>
                              )}
                            </div>
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
      </div>
    </ProtectedRoute>
  );
}