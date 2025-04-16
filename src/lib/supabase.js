'use client';

import { createClient } from '@supabase/supabase-js';

// Create a mock Supabase client for environments where there is an issue with imports
const createMockClient = () => {
  console.log('Creating mock Supabase client as fallback');
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
    },
    storage: {
      from: (bucket) => ({
        upload: (path, file) => Promise.resolve({ data: { path }, error: null }),
        getPublicUrl: (path) => ({ data: { publicUrl: `https://example.com/${path}` } }),
      }),
    },
  };
};

// IMPORTANT: Detect if we're in a build or server environment
const isBuildOrServer = () => {
  return typeof window === 'undefined' || 
         process.env.NODE_ENV === 'production' || 
         process.env.NEXT_PUBLIC_VERCEL_ENV === 'production' ||
         process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true';
};

// Create a real or mock Supabase client depending on environment
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Initialize with mock client by default for safety
let supabaseClient = createMockClient();

// Only attempt to create a real client if we're in the browser
if (!isBuildOrServer()) {
  try {
    console.log('Creating real Supabase client with URL:', supabaseUrl);
    if (supabaseUrl && supabaseKey) {
      supabaseClient = createClient(supabaseUrl, supabaseKey);
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