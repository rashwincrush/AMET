'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { isLoading, isAuthenticated, refreshSession } = useAuth();
  const [isVerifying, setIsVerifying] = useState(true);

  useEffect(() => {
    // Only run this effect when the auth state is loaded
    if (!isLoading) {
      const verifyAuthentication = async () => {
        console.log('Verifying authentication in ProfileLayout');
        
        // If already authenticated according to context, we're good
        if (isAuthenticated) {
          console.log('User is authenticated via context in ProfileLayout');
          setIsVerifying(false);
          return;
        }
        
        // Try to refresh the session if not authenticated
        console.log('Attempting to refresh session in ProfileLayout');
        const refreshed = await refreshSession();
        
        if (refreshed) {
          console.log('Session refreshed successfully in ProfileLayout');
          setIsVerifying(false);
          return;
        }
        
        // If we get here, user is not authenticated
        console.log('User is not authenticated in ProfileLayout, redirecting to login');
        router.push('/auth/login');
      };
      
      verifyAuthentication();
    }
  }, [isLoading, isAuthenticated, refreshSession, router]);

  // Show loading state while verifying auth
  if (isLoading || isVerifying) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Only render children if authenticated
  return isAuthenticated ? <>{children}</> : null;
}
