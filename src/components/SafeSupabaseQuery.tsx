'use client';

import { useState, useEffect, ReactNode } from 'react';
import { Loader2 } from 'lucide-react';
import ErrorBoundary from './ErrorBoundary';

interface SafeSupabaseQueryProps {
  queryKey: string;
  queryFn: () => Promise<any>;
  loadingComponent?: ReactNode;
  errorComponent?: ReactNode;
  children: (data: any) => ReactNode;
  onSuccess?: (data: any) => void;
  onError?: (error: any) => void;
  enabled?: boolean;
}

export default function SafeSupabaseQuery({
  queryKey,
  queryFn,
  loadingComponent,
  errorComponent,
  children,
  onSuccess,
  onError,
  enabled = true,
}: SafeSupabaseQueryProps) {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<any>(null);

  useEffect(() => {
    let isMounted = true;
    const fetchData = async () => {
      if (!enabled) {
        setIsLoading(false);
        return;
      }
      
      try {
        setIsLoading(true);
        console.log(`[SafeSupabaseQuery] Starting query: ${queryKey}`);
        const result = await queryFn();
        
        if (isMounted) {
          console.log(`[SafeSupabaseQuery] Query successful: ${queryKey}`, result);
          setData(result);
          setIsLoading(false);
          onSuccess?.(result);
        }
      } catch (err) {
        if (isMounted) {
          console.error(`[SafeSupabaseQuery] Query error: ${queryKey}`, err);
          setError(err);
          setIsLoading(false);
          onError?.(err);
        }
      }
    };

    fetchData();
    
    return () => {
      isMounted = false;
    };
  }, [queryKey, queryFn, enabled, onSuccess, onError]);

  if (isLoading) {
    return loadingComponent || (
      <div className="flex items-center justify-center p-4">
        <Loader2 className="h-5 w-5 animate-spin text-primary" />
        <span className="ml-2 text-sm text-muted-foreground">Loading {queryKey}...</span>
      </div>
    );
  }

  if (error) {
    return errorComponent || (
      <div className="p-4 text-sm text-muted-foreground bg-muted/20 rounded-md">
        <p>Failed to load {queryKey}</p>
        <p className="text-xs opacity-70 mt-1">The dashboard will continue loading other components</p>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      {children(data)}
    </ErrorBoundary>
  );
}
