import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

// This function creates a Supabase client for use in Server Components and API routes
export function createClient() {
  const cookieStore = cookies();
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    console.warn('Supabase URL or key is missing. Using mock client.');
    return createMockClient();
  }
  
  return createServerClient(
    supabaseUrl,
    supabaseKey,
    {
      cookies: {
        get(name) {
          return cookieStore.get(name)?.value;
        },
        set(name, value, options) {
          try {
            cookieStore.set({ name, value, ...options });
          } catch (error) {
            // Handle cookie setting errors in an edge runtime
            console.error('Error setting cookie:', error);
          }
        },
        remove(name, options) {
          try {
            cookieStore.set({ name, value: '', ...options });
          } catch (error) {
            console.error('Error removing cookie:', error);
          }
        },
      },
    }
  );
}

// Create a mock client for when environment variables aren't available
function createMockClient() {
  console.warn('Using mock Supabase server client');
  return {
    auth: {
      getSession: async () => ({ data: { session: null }, error: null }),
      getUser: async () => ({ data: { user: null }, error: null }),
    },
    from: (table) => ({
      select: (columns = '*') => ({
        eq: (column, value) => ({
          order: (column, { ascending } = {}) => Promise.resolve({ data: [], error: null }),
          limit: (count) => Promise.resolve({ data: [], error: null }),
          single: () => Promise.resolve({ data: null, error: null }),
        }),
        limit: (count) => Promise.resolve({ data: [], error: null }),
        order: () => Promise.resolve({ data: [], error: null }),
        filter: () => Promise.resolve({ data: [], error: null }),
      }),
      insert: (data) => Promise.resolve({ data: null, error: null }),
      update: (data) => Promise.resolve({ data: null, error: null }),
      delete: () => Promise.resolve({ data: null, error: null }),
    }),
    storage: {
      from: (bucket) => ({
        upload: () => Promise.resolve({ data: { path: '' }, error: null }),
        getPublicUrl: () => ({ data: { publicUrl: '' } }),
      }),
    },
  };
}

export default createClient; 