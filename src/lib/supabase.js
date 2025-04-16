import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { createBrowserClient } from '@supabase/ssr';

// Create a mock Supabase client for development or when environment variables are missing
const createMockClient = () => {
  console.log('Using mock Supabase client for development');
  return {
    from: (table) => ({
      select: () => ({
        eq: () => ({
          order: () => Promise.resolve({ data: [], error: null }),
          limit: () => Promise.resolve({ data: [], error: null }),
          single: () => Promise.resolve({ data: null, error: null }),
          maybeSingle: () => Promise.resolve({ data: null, error: null }),
          range: () => Promise.resolve({ data: [], error: null }),
          match: () => Promise.resolve({ data: [], error: null }),
          in: () => Promise.resolve({ data: [], error: null }),
          contains: () => Promise.resolve({ data: [], error: null }),
          textSearch: () => Promise.resolve({ data: [], error: null }),
          filter: () => Promise.resolve({ data: [], error: null }),
          or: () => ({
            order: () => Promise.resolve({ data: [], error: null }),
            limit: () => Promise.resolve({ data: [], error: null }),
            single: () => Promise.resolve({ data: null, error: null }),
            maybeSingle: () => Promise.resolve({ data: null, error: null }),
          }),
          and: () => Promise.resolve({ data: [], error: null }),
          not: () => Promise.resolve({ data: [], error: null }),
          is: () => Promise.resolve({ data: [], error: null }),
          neq: () => Promise.resolve({ data: [], error: null }),
          gt: () => Promise.resolve({ data: [], error: null }),
          gte: () => ({
            order: () => Promise.resolve({ data: [], error: null }),
            limit: () => Promise.resolve({ data: [], error: null }),
          }),
          lt: () => Promise.resolve({ data: [], error: null }),
          lte: () => Promise.resolve({ data: [], error: null }),
        }),
        or: () => ({
          order: () => Promise.resolve({ data: [], error: null }),
          limit: () => Promise.resolve({ data: [], error: null }),
          single: () => Promise.resolve({ data: null, error: null }),
          maybeSingle: () => Promise.resolve({ data: null, error: null }),
        }),
        order: () => Promise.resolve({ data: [], error: null }),
        limit: () => Promise.resolve({ data: [], error: null }),
        single: () => Promise.resolve({ data: null, error: null }),
        maybeSingle: () => Promise.resolve({ data: null, error: null }),
      }),
      insert: () => Promise.resolve({ data: null, error: null }),
      update: () => Promise.resolve({ data: null, error: null }),
      delete: () => Promise.resolve({ data: null, error: null }),
      upsert: () => Promise.resolve({ data: null, error: null }),
    }),
    auth: {
      getUser: () => Promise.resolve({ data: { user: null }, error: null }),
      getSession: () => Promise.resolve({ data: { session: null }, error: null }),
      signUp: () => Promise.resolve({ data: { user: null }, error: null }),
      signInWithPassword: () => Promise.resolve({ 
        data: { 
          user: { 
            id: 'mock-user-id', 
            email: 'mock@example.com',
            user_metadata: { full_name: 'Mock User' }
          } 
        }, 
        error: null 
      }),
      signInWithOAuth: () => Promise.resolve({ data: { user: null }, error: null }),
      signOut: () => Promise.resolve({ error: null }),
      updateUser: () => Promise.resolve({ data: { user: null }, error: null }),
      onAuthStateChange: (callback) => {
        // Call the callback immediately with a signed-out state
        callback('SIGNED_OUT', null);
        return { data: { subscription: { unsubscribe: () => {} } } };
      },
    },
    storage: {
      from: () => ({
        upload: () => Promise.resolve({ data: { path: 'mock-path' }, error: null }),
        getPublicUrl: () => ({ data: { publicUrl: '/mock-image.jpg' } }),
        remove: () => Promise.resolve({ error: null }),
      }),
    },
  };
};

// Get environment variables with fallbacks
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://gvbtfolcizkzihforqte.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const useMockData = process.env.USE_MOCK_DATA === 'true';

let supabase;

// Determine whether to use mock or real client
if (!supabaseUrl || !supabaseKey || useMockData) {
  console.log('Using mock Supabase client for development');
  supabase = createMockClient();
} else {
  console.log('Using real Supabase client with URL:', supabaseUrl);
  // Use the standard client for better compatibility
  supabase = createSupabaseClient(supabaseUrl, supabaseKey, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
    }
  });
}

export { supabase };