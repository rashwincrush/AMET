'use client';

import { createClient } from '@supabase/supabase-js';

// Create a lightweight mock client for server-side rendering
const createMockClient = () => {
  // Silent initialization for production
  return {
    from: (table) => ({
      select: (columns = '*') => ({
        eq: (column, value) => ({
          order: (column, { ascending } = {}) => Promise.resolve({ data: [], error: null }),
          limit: (count) => Promise.resolve({ data: [], error: null }),
          single: () => Promise.resolve({ data: null, error: null }),
        }),
        limit: (count) => Promise.resolve({ data: [], error: null }),
      }),
      insert: (data) => Promise.resolve({ data: null, error: null }),
      update: (data) => Promise.resolve({ data: null, error: null }),
      delete: () => Promise.resolve({ data: null, error: null }),
    }),
    auth: {
      getUser: () => Promise.resolve({ data: { user: null }, error: null }),
      getSession: () => Promise.resolve({ data: { session: null }, error: null }),
      onAuthStateChange: (callback) => {
        callback('SIGNED_OUT', null);
        return { data: { subscription: { unsubscribe: () => {} } } };
      },
      signOut: () => Promise.resolve({ error: null }),
      signInWithOAuth: (params) => {
        return Promise.resolve({ data: {}, error: null });
      },
      signInWith: (params) => {
        return Promise.resolve({ data: {}, error: null });
      },
      signInWithPassword: (params) => {
        return Promise.resolve({ data: {}, error: null });
      },
      signIn: (params) => {
        return Promise.resolve({ data: {}, error: null });
      },
    },
    storage: {
      from: (bucket) => ({
        upload: (path, file) => Promise.resolve({ data: { path }, error: null }),
        getPublicUrl: (path) => ({ data: { publicUrl: `https://example.com/${path}` } }),
      }),
    },
  };
};

// We only need to check if we're in a serverside context for hydration
const isServerSide = () => {
  return typeof window === 'undefined';
};

// Create a real or mock Supabase client depending on environment
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Create the supabase client
let supabaseClient;

// Initialize client depending on context
if (isServerSide()) {
  // Use mock client for server-side rendering to avoid hydration issues
  supabaseClient = createMockClient();
} else {
  try {
    // Initialize Supabase client for production
    if (supabaseUrl && supabaseKey) {
      supabaseClient = createClient(supabaseUrl, supabaseKey, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true
        },
        global: {
          headers: {
            'apikey': supabaseKey,
          },
        },
      });
      
      // Add compatibility methods for OAuth authentication
      if (!supabaseClient.auth.signInWithOAuth && supabaseClient.auth.signInWith) {
        // Add signInWithOAuth compatibility method
        supabaseClient.auth.signInWithOAuth = supabaseClient.auth.signInWith;
      }
      
      if (!supabaseClient.auth.signInWith && supabaseClient.auth.signInWithOAuth) {
        // Add signInWith compatibility method
        supabaseClient.auth.signInWith = supabaseClient.auth.signInWithOAuth;
      }
      
      // Add compatibility methods for password authentication
      if (!supabaseClient.auth.signInWithPassword && supabaseClient.auth.signIn) {
        // Add signInWithPassword compatibility method
        supabaseClient.auth.signInWithPassword = (params) => {
          return supabaseClient.auth.signIn(params);
        };
      }
      
      if (!supabaseClient.auth.signIn && supabaseClient.auth.signInWithPassword) {
        // Add signIn compatibility method
        supabaseClient.auth.signIn = (params) => {
          return supabaseClient.auth.signInWithPassword(params);
        };
      }
      
      // Enable all available authentication methods for compatibility
    }
  } catch (error) {
    console.error('Error creating Supabase client:', error);
  }
}

// Create a supabase object to export
const supabase = supabaseClient;

// Export both as named export and default export
export { supabase };
export default supabase;