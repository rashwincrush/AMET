'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function HandleOAuthPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    async function handleOAuthSignIn() {
      try {
        if (!searchParams) {
          setError('No search parameters available');
          return;
        }
        
        const code = searchParams.get('code');
        
        if (!code) {
          setError('No authentication code provided');
          return;
        }
        
        // Exchange the code for a session
        const { error: sessionError } = await supabase.auth.exchangeCodeForSession(code);
        
        if (sessionError) {
          throw sessionError;
        }
        
        // Get current user
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        
        if (userError || !user) {
          throw userError || new Error('Failed to get user information');
        }
        
        // Check if the user has completed role setup
        const { data, error: profileError } = await supabase
          .from('profiles')
          .select('role_setup_complete, is_mentor, is_mentee')
          .eq('id', user.id)
          .single();
          
        if (profileError) {
          throw profileError;
        }
        
        // Redirect based on role setup status
        if (data?.role_setup_complete) {
          // Role already set up, go to profile or dashboard
          router.push('/profile');
        } else {
          // Need to select role
          router.push('/auth/role-selection');
        }
      } catch (err: any) {
        console.error('Error handling OAuth sign in:', err);
        setError(err.message || 'An error occurred during authentication');
      }
    }
    
    handleOAuthSignIn();
  }, [searchParams, router]);
  
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="w-full max-w-md p-8 space-y-4 bg-white rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-center">Completing Sign In</h1>
        
        {error ? (
          <div className="bg-red-50 border-l-4 border-red-400 p-4">
            <div className="flex">
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
                <button 
                  onClick={() => router.push('/auth/login')}
                  className="mt-2 text-sm font-medium text-red-700 hover:text-red-600"
                >
                  Return to login
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            <p className="mt-4 text-gray-600">Please wait while we complete your sign in...</p>
          </div>
        )}
      </div>
    </div>
  );
} 