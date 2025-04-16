'use client';

import { useEffect, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import Navigation from '@/components/layout/Navigation';

export function SessionLayout({ children }: { children: React.ReactNode }) {
  const { user, signOut } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const timeoutRef = useRef<NodeJS.Timeout>();

  // Define protected routes
  const protectedRoutes = ['/profile', '/events/create', '/jobs/post', '/dashboard', '/admin'];
  const isProtectedRoute = protectedRoutes.some(route => pathname?.startsWith(route));

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

  // Only redirect to login if accessing protected routes without authentication
  useEffect(() => {
    if (!user && isProtectedRoute) {
      router.push('/auth/login');
    }
  }, [user, router, isProtectedRoute]);

  return (
    <Navigation>
      {children}
    </Navigation>
  );
}
