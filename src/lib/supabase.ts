import { createClient } from '@supabase/supabase-js';

// Get environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Check for environment variables and provide fallback
if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Creating mock Supabase client as fallback - missing environment variables');
}

// Create a custom fetch implementation that logs detailed errors in development
const customFetch = (...args: Parameters<typeof fetch>) => {
  return fetch(...args).then(async (response) => {
    if (!response.ok && process.env.NODE_ENV !== 'production') {
      const errorText = await response.text();
      console.error('Supabase API error:', {
        status: response.status,
        statusText: response.statusText,
        url: response.url,
        errorText,
      });
    }
    return response;
  });
};

// Initialize Supabase client with improved configuration
export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '', {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    flowType: 'implicit'
  },
  global: {
    headers: {
      'apikey': supabaseAnonKey || '',
    },
    fetch: customFetch,
  },
});

// Initialize admin Supabase client for server-side operations
export const supabaseServer = createClient(supabaseUrl || '', supabaseServiceRoleKey || supabaseAnonKey || '', {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
  global: {
    headers: {
      'apikey': supabaseServiceRoleKey || supabaseAnonKey || '',
    },
    fetch: customFetch,
  },
});

// No development logs in production

// Helper function to check if a user exists
export async function checkUserExists(email: string) {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, email')
      .eq('email', email)
      .single();

    if (error) throw error;
    return !!data;
  } catch (error) {
    console.error('Error checking if user exists:', error);
    return false;
  }
}

// Authentication helper function
export async function signInWithEmail(email: string, password: string) {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error signing in:', error);
    throw error;
  }
}

// Function to fetch user roles
export async function fetchUserRoles(userId: string) {
  try {
    const { data, error } = await supabase
      .from('user_roles')
      .select('role_id, roles(name, permissions)')
      .eq('user_id', userId);

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching user roles:', error);
    return [];
  }
}