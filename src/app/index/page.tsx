'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

// This is just a wrapper to handle the /index route that Vercel is looking for
// It preserves the same redirect behavior as the root page
export default function IndexPage() {
  const router = useRouter();
  
  useEffect(() => {
    // Immediate redirect to /home, same as the root page
    window.location.href = '/home';
  }, []);
  
  // Return minimal UI to avoid any flash before redirect
  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <p>Redirecting to AMET Alumni Portal...</p>
    </div>
  );
}
