'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';

export const useSessionTimeout = () => {
  const router = useRouter();
  const { signOut } = useAuth();
  const timeoutRef = useRef<NodeJS.Timeout>();

  const resetTimeout = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      // Sign out the user
      signOut();
      // Redirect to login page
      router.push('/login');
    }, 5 * 60 * 1000); // 5 minutes in milliseconds
  };

  useEffect(() => {
    // Reset timeout on any user activity
    const events = [
      'mousemove',
      'keypress',
      'scroll',
      'touchstart',
      'click'
    ];

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
  }, [router, signOut]);

  return { resetTimeout };
};
