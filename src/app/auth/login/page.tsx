'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';
import SocialLogin from '@/components/auth/SocialLogin';
import { getPreviousUrl } from '@/lib/navigation';

// Rate limiting constants
const RATE_LIMIT_DURATION = 60000; // 60 seconds in milliseconds (increased from 30s)
const RATE_LIMIT_KEY = 'auth_last_attempt';
const RATE_LIMIT_COUNTER_KEY = 'auth_attempt_count';
const MAX_ATTEMPTS = 3; // Maximum attempts before enforcing a longer cooldown
const EXTENDED_RATE_LIMIT_DURATION = 300000; // 5 minutes in milliseconds

export default function Login() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false); // Initialize to false, auth check handled by SessionLayout
  const [redirectUrl, setRedirectUrl] = useState('');
  
  // Authentication and redirect logic for already authenticated users is handled by SessionLayout.tsx
  
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

    // Client-side rate limiting logic
    const lastAttemptTime = localStorage.getItem(RATE_LIMIT_KEY);
    const currentTime = Date.now();
    let attemptCount = parseInt(localStorage.getItem(RATE_LIMIT_COUNTER_KEY) || '0', 10);

    if (lastAttemptTime) {
      const timeSinceLastAttempt = currentTime - parseInt(lastAttemptTime, 10);
      const cooldownDuration = attemptCount >= MAX_ATTEMPTS ? EXTENDED_RATE_LIMIT_DURATION : RATE_LIMIT_DURATION;
      if (timeSinceLastAttempt < cooldownDuration) {
        const secondsToWait = Math.ceil((cooldownDuration - timeSinceLastAttempt) / 1000);
        const minutesToWait = Math.floor(secondsToWait / 60);
        const remainingSeconds = secondsToWait % 60;
        let waitMessage = '';
        if (minutesToWait > 0) {
          waitMessage = `${minutesToWait} minute${minutesToWait > 1 ? 's' : ''} and ${remainingSeconds} second${remainingSeconds !== 1 ? 's' : ''}`;
        } else {
          waitMessage = `${secondsToWait} second${secondsToWait !== 1 ? 's' : ''}`;
        }
        setError(`Too many login attempts. Please wait ${waitMessage} before trying again.`);
        return;
      }
    }

    attemptCount++;
    localStorage.setItem(RATE_LIMIT_COUNTER_KEY, attemptCount.toString());
    localStorage.setItem(RATE_LIMIT_KEY, currentTime.toString());

    setLoading(true);
    const supabaseRateLimitKey = 'supabase_rate_limit_until';

    try {
      const localRateLimitUntil = localStorage.getItem(supabaseRateLimitKey);
      if (localRateLimitUntil && Date.now() < parseInt(localRateLimitUntil, 10)) {
        const waitTimeMs = parseInt(localRateLimitUntil, 10) - Date.now();
        const waitTimeSec = Math.ceil(waitTimeMs / 1000);
        setError(`Please wait ${waitTimeSec}s due to previous Supabase rate limits.`);
        return; // finally will set loading to false
      }

      console.log('[Login] Attempting Supabase sign-in...');
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        console.error('[Login] Supabase Sign-In Error:', JSON.stringify(signInError, null, 2));
        if (signInError.status === 429) {
          setError('Too many requests to Supabase. Please wait a few minutes and try again.');
          localStorage.setItem(supabaseRateLimitKey, (Date.now() + EXTENDED_RATE_LIMIT_DURATION).toString());
        } else if (signInError.message?.toLowerCase().includes('invalid login credentials')) {
          setError('Invalid email or password. Please try again.');
        } else if (signInError.message?.toLowerCase().includes('email not confirmed')) {
          setError('Please verify your email address before logging in.');
        } else {
          setError(signInError.message || 'An unexpected error occurred during sign in.');
        }
        return; // finally will set loading to false
      }

      if (data?.user) {
        console.log('[Login] Sign-in successful for user:', data.user.id);
        localStorage.removeItem(RATE_LIMIT_COUNTER_KEY);
        localStorage.removeItem(RATE_LIMIT_KEY);
        localStorage.removeItem(supabaseRateLimitKey);

        console.log('[Login] Redirecting to:', redirectUrl || '/dashboard');
        router.push(redirectUrl || '/dashboard'); // Using Next.js router for client-side navigation
      } else {
        setError('Sign in failed: No user data received and no specific error from Supabase.');
        console.error('[Login] Sign-in failed: No user data but no signInError. Data:', data);
      }
    } catch (err: any) {
      console.error('[Login] Outer Catch Error during sign in:', JSON.stringify(err, null, 2));
      // This catch block handles errors not caught by the Supabase client's error object (e.g., network issues)
      if (err.name === 'AuthApiError' && err.status === 429) {
         setError('Too many requests (Supabase API). Please wait a few minutes and try again.');
         localStorage.setItem(supabaseRateLimitKey, (Date.now() + EXTENDED_RATE_LIMIT_DURATION).toString());
      } else if (err.message?.toLowerCase().includes('failed to fetch')) {
        setError('Network error. Please check your internet connection and try again.');
        console.warn('[Login] "Failed to fetch" could indicate network, CORS, or Supabase service issues.');
      } else {
        setError(err.message || 'A critical error occurred during sign in. Please try again.');
      }
    } finally {
      setLoading(false);
      console.log('[Login] handleSubmit finished. Loading state is now false.');
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
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 mt-2 text-white font-semibold text-lg bg-blue-600 hover:bg-blue-700 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              {loading ? 'Signing in...' : 'SIGN IN'}
            </button>
          </div>
          
          {/* Social login options */}
          <div className="mt-6 social-login-container">
            <SocialLogin 
              redirectTo="/dashboard" 
              onError={(errorMsg) => setError(errorMsg)}
            />
          </div>
          

        </form>
      </div>
    </div>
  );
}