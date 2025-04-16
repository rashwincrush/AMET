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

// Safely check if we're on the server side
const isServer = typeof window === 'undefined';

// Create a real or mock Supabase client depending on environment
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const useMockData = process.env.USE_MOCK_DATA === 'true';

let supabaseClient;

// In server environments or build environments, always use mock
if (isServer) {
  console.log('Running in server environment - using mock Supabase client');
  supabaseClient = createMockClient();
} else if (!supabaseUrl || !supabaseKey || useMockData) {
  console.log('Using mock Supabase client for development');
  supabaseClient = createMockClient();
} else {
  try {
    // Create the real client
    console.log('Using real Supabase client with URL:', supabaseUrl);
    supabaseClient = createClient(supabaseUrl, supabaseKey);
  } catch (error) {
    console.error('Error creating Supabase client:', error);
    supabaseClient = createMockClient();
  }
}

// Create a supabase object to export
const supabase = supabaseClient;

// Export both as named export and default export
export { supabase };
export default supabase;