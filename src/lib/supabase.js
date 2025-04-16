'use client';

import { createClient } from '@supabase/supabase-js';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

// Initialize the Supabase client with the environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const useMockData = process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true';

// Create either a mock client or a real client based on environment variables
const createMockClient = () => {
  console.warn('Using mock Supabase client - this should not happen in production');
  return {
    auth: {
      getSession: async () => ({ data: { session: null }, error: null }),
      getUser: async () => ({ data: { user: null }, error: null }),
      onAuthStateChange: () => ({ data: null, error: null, unsubscribe: () => {} }),
      signOut: async () => ({ error: null }),
    },
    from: (table) => ({
      select: (columns = '*') => ({
        eq: (column, value) => ({
          order: (column, { ascending = false }) => Promise.resolve({ data: [], error: null }),
          limit: (count) => Promise.resolve({ data: [], error: null }),
          single: () => Promise.resolve({ data: null, error: null }),
        }),
        limit: (count) => Promise.resolve({ data: [], error: null }),
        order: () => Promise.resolve({ data: [], error: null }),
        filter: () => Promise.resolve({ data: [], error: null }),
        ilike: () => Promise.resolve({ data: [], error: null }),
        gte: () => Promise.resolve({ data: [], error: null }),
        lte: () => Promise.resolve({ data: [], error: null }),
        in: () => Promise.resolve({ data: [], error: null }),
        match: () => Promise.resolve({ data: [], error: null }),
      }),
      insert: (data) => Promise.resolve({ data: null, error: null }),
      update: (data) => Promise.resolve({ data: null, error: null }),
      delete: () => Promise.resolve({ data: null, error: null }),
      upsert: (data) => Promise.resolve({ data: null, error: null }),
    }),
    storage: {
      from: (bucket) => ({
        upload: (path, file) => Promise.resolve({ data: { path }, error: null }),
        getPublicUrl: (path) => ({ data: { publicUrl: `https://example.com/${path}` } }),
      }),
    },
    rpc: (fn, params) => Promise.resolve({ data: null, error: null }),
  };
};

// For client components (to be used in components that need auth)
const getClientSupabase = () => {
  if (typeof window === 'undefined') {
    console.warn('Attempted to create client component Supabase client in a server context');
    return createMockClient();
  }
  
  try {
    // In production, always try to use the real client first
    if (supabaseUrl && supabaseAnonKey && !useMockData) {
      return createClient(supabaseUrl, supabaseAnonKey, {
        auth: { 
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true
        }
      });
    }
    
    // Otherwise, fallback to the auth helpers client
    return createClientComponentClient();
  } catch (error) {
    console.error('Error creating client component Supabase client:', error);
    // Only use mock in development or if explicitly enabled
    if (process.env.NODE_ENV !== 'production' || useMockData) {
      return createMockClient();
    }
    // In production with errors, try one more approach with basic client
    try {
      return createClient(supabaseUrl || '', supabaseAnonKey || '');
    } catch (innerError) {
      console.error('Critical error creating Supabase client:', innerError);
      throw new Error('Failed to initialize Supabase client in production');
    }
  }
};

// Create a client-side instance
export const supabase = getClientSupabase();

// Export the convenience function for specific cases
export const getSupabaseClient = () => getClientSupabase();

// Default export for backwards compatibility
export default supabase;