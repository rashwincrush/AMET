// Create a mock Supabase client for environments where there is an issue with imports
const createMockClient = () => {
  console.log('Creating mock Supabase client as fallback');
  return {
    from: (table) => ({
      select: () => ({
        eq: () => ({
          order: () => Promise.resolve({ data: [], error: null }),
          limit: () => Promise.resolve({ data: [], error: null }),
          single: () => Promise.resolve({ data: null, error: null }),
        }),
        limit: () => Promise.resolve({ data: [], error: null }),
      }),
      insert: () => Promise.resolve({ data: null, error: null }),
      update: () => Promise.resolve({ data: null, error: null }),
      delete: () => Promise.resolve({ data: null, error: null }),
    }),
    auth: {
      getUser: () => Promise.resolve({ data: { user: null }, error: null }),
      getSession: () => Promise.resolve({ data: { session: null }, error: null }),
      onAuthStateChange: (callback) => {
        callback('SIGNED_OUT', null);
        return { data: { subscription: { unsubscribe: () => {} } } };
      },
    },
  };
};

// Create a real or mock Supabase client depending on environment
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const useMockData = process.env.USE_MOCK_DATA === 'true';

let supabase;

// In build environments, always use mock
if (process.env.NODE_ENV === 'production' && process.env.VERCEL) {
  console.log('Running in Vercel production build - using mock Supabase client');
  supabase = createMockClient();
} else if (!supabaseUrl || !supabaseKey || useMockData) {
  console.log('Using mock Supabase client for development');
  supabase = createMockClient();
} else {
  try {
    // Try to import the real client
    console.log('Using real Supabase client with URL:', supabaseUrl);
    const { createClient } = require('@supabase/supabase-js');
    supabase = createClient(supabaseUrl, supabaseKey);
  } catch (error) {
    console.error('Error creating Supabase client:', error);
    supabase = createMockClient();
  }
}

module.exports = { supabase };