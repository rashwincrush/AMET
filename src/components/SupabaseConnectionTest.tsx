'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export default function SupabaseConnectionTest() {
  const [status, setStatus] = useState<'loading' | 'connected' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [redirectUrl, setRedirectUrl] = useState<string>('');
  const [supabaseUrl, setSupabaseUrl] = useState<string>('');

  useEffect(() => {
    async function testConnection() {
      try {
        // Simple query to test connection
        const { data, error } = await supabase.from('roles').select('*').limit(1);
        
        if (error) throw error;
        
        setStatus('connected');
      } catch (err: any) {
        console.error('Supabase connection error:', err);
        setStatus('error');
        setErrorMessage(err.message || 'Failed to connect to Supabase');
      }
    }

    testConnection();
    
    // Display the current URL that would be used for redirects
    setRedirectUrl(window.location.origin);
    
    // Get the Supabase URL from environment variable or use the default
    const envSupabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'Not configured';
    setSupabaseUrl(envSupabaseUrl);
  }, []);

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h3 className="text-lg font-medium mb-2">Supabase Connection Status</h3>
      {status === 'loading' && <p className="text-gray-600">Testing connection...</p>}
      {status === 'connected' && (
        <p className="text-green-600">✅ Connected to Supabase successfully!</p>
      )}
      {status === 'error' && (
        <div>
          <p className="text-red-600">❌ Failed to connect to Supabase</p>
          {errorMessage && <p className="text-sm text-red-500">{errorMessage}</p>}
        </div>
      )}
      
      <div className="mt-4 border-t pt-4">
        <h4 className="text-md font-medium mb-2">Redirect URL Configuration</h4>
        <p className="text-sm text-gray-700">Current origin: <span className="font-mono">{redirectUrl}</span></p>
        <p className="text-sm text-gray-700 mt-2">Supabase URL: <span className="font-mono">{supabaseUrl}</span></p>
        <p className="text-sm text-gray-700 mt-2">
          Make sure <strong>{redirectUrl}</strong> is added to the allowed redirect URLs in your Supabase project settings.
        </p>
        <p className="text-sm text-gray-700 mt-2">
          In Supabase dashboard: <span className="font-medium">Authentication → URL Configuration → Redirect URLs</span>
        </p>
        <p className="text-sm text-gray-700 mt-2">
          Also ensure the <strong>Site URL</strong> is set to <strong>{redirectUrl}</strong> in the same settings page.
        </p>
      </div>
    </div>
  );
}