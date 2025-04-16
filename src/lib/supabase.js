'use client';

import { createClient } from '@supabase/supabase-js';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

// Initialize the Supabase client with the environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const useMockData = process.env.USE_MOCK_DATA === 'true';

// Create either a mock client or a real client based on environment variables
const createMockClient = () => {
  console.warn('Using mock Supabase client');
  return {
    auth: {
      getSession: async () => ({ data: { session: null }, error: null }),
      getUser: async () => ({ data: { user: null }, error: null }),
      onAuthStateChange: () => ({ data: null, error: null, unsubscribe: () => {} }),
      signOut: async () => ({ error: null }),
    },
    from: () => ({
      select: () => ({ data: [], error: null }),
      insert: () => ({ data: null, error: null }),
      update: () => ({ data: null, error: null }),
      delete: () => ({ data: null, error: null }),
    }),
    storage: {
      from: () => ({
        upload: async () => ({ data: null, error: null }),
        getPublicUrl: () => ({ data: { publicUrl: '' }, error: null }),
      }),
    },
  };
};

// For server components
const getSupabaseClient = () => {
  // Return mock client if environment variables are not available
  if (!supabaseUrl || !supabaseAnonKey || useMockData) {
    return createMockClient();
  }
  
  // Otherwise, return a real client
  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: { persistSession: false }
  });
};

// For client components (to be used in components that need auth)
const getClientSupabase = () => {
  if (typeof window === 'undefined') {
    console.warn('Attempted to create client component Supabase client in a server context');
    return createMockClient();
  }
  
  try {
    return createClientComponentClient();
  } catch (error) {
    console.error('Error creating client component Supabase client:', error);
    return createMockClient();
  }
};

// Create instances
export const supabase = getSupabaseClient();
export const supabaseClient = getClientSupabase();

export default supabase;