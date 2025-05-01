'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';
import SocialLogin from '@/components/auth/SocialLogin';
import { getPreviousUrl } from '@/lib/navigation';

export default function Login() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [redirectUrl, setRedirectUrl] = useState('');
  
  // Get redirect URL from query parameters or localStorage
  useEffect(() => {
    // First check if there's a callbackUrl in the query parameters
    const callbackUrl = searchParams?.get('callbackUrl') || null;
    if (callbackUrl) {
      setRedirectUrl(callbackUrl);
    } else {
      // Otherwise use the previously saved URL
      setRedirectUrl(getPreviousUrl('/'));
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email || !password) {
      setError('Please enter both email and password');
      return;
    }

    try {
      setLoading(true);
      console.log('Attempting to sign in with:', email);
      
      let data, error;
      
      // Try different authentication methods to ensure compatibility
      try {
        // First try the newer method (signInWithPassword)
        if (typeof supabase.auth.signInWithPassword === 'function') {
          console.log('Using signInWithPassword method');
          ({ data, error } = await supabase.auth.signInWithPassword({
            email,
            password
          }));
        }
        // Fall back to the older method (signIn)
        else if (typeof supabase.auth.signIn === 'function') {
          console.log('Using signIn method');
          ({ data, error } = await supabase.auth.signIn({
            email,
            password
          }));
        } 
        else {
          throw new Error('No compatible authentication method available');
        }
      } catch (authError) {
        console.error('Authentication method error:', authError);
        // Last resort: try direct method invocation as a workaround
        try {
          const anyClient = supabase.auth as any;
          if (anyClient.signIn) {
            console.log('Using any cast signIn method');
            ({ data, error } = await anyClient.signIn({
              email,
              password
            }));
          } else if (anyClient.signInWithPassword) {
            console.log('Using any cast signInWithPassword method');
            ({ data, error } = await anyClient.signInWithPassword({
              email,
              password
            }));
          } else {
            throw new Error('No authentication methods found');
          }
        } catch (finalError) {
          console.error('Final authentication attempt failed:', finalError);
          throw finalError;
        }
      }
      
      if (error) {
        console.error('Supabase auth error:', error);
        throw error;
      }
      
      console.log('Login successful, redirecting to:', redirectUrl);
      
      // Always redirect to the dashboard page after successful login
      // Use setTimeout to ensure the auth state is updated before redirecting
      setTimeout(() => {
        router.push('/dashboard');
      }, 500);
      
    } catch (err: any) {
      console.error('Login error:', err);
      setError(err.message || 'Failed to sign in');
    } finally {
      setLoading(false);
    }
  };
  


  return (
    <div className="flex min-h-screen flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
            Sign in to your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Or{' '}
            <Link href="/auth/signup" className="font-medium text-blue-600 hover:text-blue-500">
              create a new account
            </Link>
          </p>
        </div>
        
        {error && (
          <div className="bg-red-50 border-l-4 border-red-400 p-4">
            <div className="flex">
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="-space-y-px rounded-md shadow-sm">
            <div>
              <label htmlFor="email-address" className="sr-only">
                Email address
              </label>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="relative block w-full rounded-t-md border-0 py-1.5 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:z-10 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6 px-3"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="relative block w-full rounded-b-md border-0 py-1.5 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:z-10 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6 px-3"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="text-sm">
              <Link href="/auth/forgot-password" className="font-medium text-blue-600 hover:text-blue-500">
                Forgot your password?
              </Link>
            </div>
          </div>

          <div className="mt-6">
            <Button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md text-lg font-bold"
              disabled={loading}
            >
              {loading ? 'Signing in...' : 'SIGN IN'}
            </Button>
          </div>
          
          <div className="mt-6">
            <SocialLogin 
              redirectTo="/api/auth/callback"
              onSuccess={() => {
                // Will be handled by the callback route
              }}
              onError={(error) => {
                setError(error);
              }}
            />
          </div>
          

        </form>
      </div>
    </div>
  );
}