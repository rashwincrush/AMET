'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import Navigation from '@/components/layout/Navigation';

export function SessionLayout({ children }: { children: React.ReactNode }) {
  // Destructure only what's guaranteed to exist in the auth context
  const authContext = useAuth();
  const { user, signOut } = authContext;
  // Safely access potentially undefined properties
  const authIsLoading = authContext.isLoading || false;
  const isAuthenticated = authContext.isAuthenticated || Boolean(user);
  
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const timeoutRef = useRef<NodeJS.Timeout>();
  
  // Redirect state protection
  const [redirectPending, setRedirectPending] = useState<boolean>(false);

  // Define protected routes
  const protectedRoutes = ['/profile', '/events/create', '/jobs/post', '/dashboard', '/admin'];
  const isProtectedRoute = protectedRoutes.some(route => pathname?.startsWith(route));
  
  // Check if we're on an auth page
  const isAuthPage = pathname?.startsWith('/auth/');
  
  // Define public pages that don't require authentication
  const isPublicPage = pathname === '/' || pathname?.startsWith('/faqs') || pathname?.startsWith('/helpdesk');

  useEffect(() => {
    if (!user) return;

    // Reset timeout on any user activity
    const events = [
      'mousemove',
      'keypress',
      'scroll',
      'touchstart',
      'click'
    ];

    const resetTimeout = () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      timeoutRef.current = setTimeout(() => {
        // Sign out the user
        signOut();
        // Redirect to login page
        router.push('/auth/login');
      }, 5 * 60 * 1000); // 5 minutes in milliseconds
    };

    events.forEach(event => {
      window.addEventListener(event, resetTimeout, { passive: true });
    });

    // Initial reset
    resetTimeout();

    // Cleanup
    return () => {
      events.forEach(event => {
        window.removeEventListener(event, resetTimeout);
      });
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [user, signOut, router]);

  // Handle authentication checks and redirects
  useEffect(() => {
    // Don't redirect if we're still loading auth or on public routes
    if (authIsLoading || isPublicPage) {
      return;
    }
    
    // Don't process redirects if we're already in a redirect
    if (redirectPending) {
      console.log('[SessionLayout] Redirect already pending, skipping');
      return;
    }
    
    // Check if we recently redirected to prevent loops - longer timeout (10 seconds)
    const lastRedirectTime = sessionStorage.getItem('last_auth_redirect_time');
    const now = Date.now();
    if (lastRedirectTime && (now - parseInt(lastRedirectTime)) < 10000) { // 10 seconds
      console.log('[SessionLayout] Preventing redirect - too recent', 
                 `Last: ${new Date(parseInt(lastRedirectTime)).toISOString()}`, 
                 `Now: ${new Date(now).toISOString()}`);
      return;
    }
    
    // Check if we're hitting the rate limit
    const rateLimitUntil = localStorage.getItem('supabase_rate_limit_until');
    if (rateLimitUntil && parseInt(rateLimitUntil) > Date.now()) {
      console.warn('[SessionLayout] Rate limit active, delaying redirects until', 
                  new Date(parseInt(rateLimitUntil)));
      return;
    }

    // If user is authenticated and on login/signup page, redirect to dashboard
    if (isAuthenticated && isAuthPage) {
      console.log('[SessionLayout] User is authenticated but on auth page. Redirecting to dashboard...');
      const redirectTo = searchParams.get('redirectTo') || '/dashboard';
      
      // Track the redirect time to prevent loops
      sessionStorage.setItem('last_auth_redirect_time', now.toString());
      setRedirectPending(true);
      
      // Add a slight delay to prevent rapid redirect attempts
      setTimeout(() => {
        router.push(redirectTo);
        // Reset redirect pending after a delay to allow for route change
        setTimeout(() => setRedirectPending(false), 2000);
      }, 100);
      return;
    }

    // If user is not authenticated and on protected route, redirect to login
    if (!isAuthenticated && isProtectedRoute && !isAuthPage) {
      console.log('[SessionLayout] User is not authenticated and trying to access protected route. Redirecting to login...');
      
      // Track the redirect time to prevent loops
      sessionStorage.setItem('last_auth_redirect_time', now.toString());
      setRedirectPending(true);
      
      // Add a slight delay to prevent rapid redirect attempts
      setTimeout(() => {
        router.push(`/auth/login?redirectTo=${encodeURIComponent(pathname)}`);
        // Reset redirect pending after a delay to allow for route change
        setTimeout(() => setRedirectPending(false), 2000);
      }, 100);
      return;
    }
  }, [pathname, isAuthPage, isProtectedRoute, isPublicPage, authIsLoading, isAuthenticated, router, searchParams, redirectPending]);

  // Show a loading indicator while auth provider is loading
  if (authIsLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
      </div>
    );
  }
  
  return (
    <Navigation>
      {children}
    </Navigation>
  );
}
