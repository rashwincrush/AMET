'use client';

import { useEffect, useRef } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { savePreviousUrl } from '@/lib/navigation';

/**
 * Component that tracks navigation and saves the previous URL
 * This should be included in the root layout to track all navigation
 */
export default function NavigationTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const prevPathRef = useRef<string | null>(null);

  useEffect(() => {
    // Don't track auth pages
    if (pathname && !pathname.startsWith('/auth/')) {
      // Save the previous path when navigating away from it
      if (prevPathRef.current && prevPathRef.current !== pathname) {
        savePreviousUrl();
      }
      prevPathRef.current = pathname;
    }
  }, [pathname, searchParams]);

  // This component doesn't render anything
  return null;
}
