'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';

type SocialLoginProps = {
  redirectTo?: string;
  onSuccess?: () => void;
  onError?: (error: string) => void;
};

export default function SocialLogin({ 
  redirectTo = '/',
  onSuccess,
  onError 
}: SocialLoginProps) {
  const [loading, setLoading] = useState<{[key: string]: boolean}>({});

  const handleSocialLogin = async (provider: 'google' | 'linkedin') => {
    try {
      setLoading({ ...loading, [provider]: true });
      
      console.log(`Attempting to sign in with ${provider}`);
      console.log(`Redirect URL: ${window.location.origin}${redirectTo}`);
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}${redirectTo}`,
          scopes: provider === 'linkedin' ? 'r_liteprofile r_emailaddress' : 'email profile',
        },
      });
      
      if (error) {
        console.error(`${provider} OAuth error:`, error);
        onError?.(error.message);
        throw error;
      }
      
      console.log(`${provider} OAuth initiated successfully:`, data);
      // The redirect will happen automatically, but we'll call onSuccess just in case
      onSuccess?.();
    } catch (err: any) {
      console.error(`Error signing in with ${provider}:`, err);
      onError?.(err.message || `Failed to sign in with ${provider}`);
    } finally {
      setLoading({ ...loading, [provider]: false });
    }
  };

  return (
    <div className="space-y-3">
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-white text-gray-500">Or continue with</span>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={() => handleSocialLogin('google')}
          disabled={loading['google']}
          className="w-full"
        >
          {loading['google'] ? (
            <span className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full"></span>
          ) : (
            <svg className="h-5 w-5" aria-hidden="true" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z" />
            </svg>
          )}
        </Button>

        <Button
          type="button"
          variant="outline"
          onClick={() => handleSocialLogin('linkedin')}
          disabled={loading['linkedin']}
          className="w-full"
        >
          {loading['linkedin'] ? (
            <span className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full"></span>
          ) : (
            <svg className="h-5 w-5" aria-hidden="true" fill="currentColor" viewBox="0 0 24 24">
              <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
            </svg>
          )}
        </Button>
      </div>
    </div>
  );
}