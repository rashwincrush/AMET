import { createClient } from '@supabase/supabase-js';

// Ensure environment variables are set
if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  console.error('Missing required Supabase environment variables');
  throw new Error('Missing required Supabase environment variables');
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Initialize Supabase client with proper configuration
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    storageKey: 'supabase.auth.token',
    storage: {
      getItem: (key: string): string | null => {
        try {
          if (typeof window !== 'undefined') {
            const localValue = localStorage.getItem(key);
            if (localValue) return localValue;
            
            const cookies = document.cookie.split(';');
            for (const cookie of cookies) {
              const [cookieName, cookieValue] = cookie.split('=');
              if (cookieName.trim() === key) {
                return cookieValue;
              }
            }
          }
          return null;
        } catch (error) {
          console.error('Error retrieving auth token:', error);
          return null;
        }
      },
      setItem: (key: string, value: string): void => {
        try {
          if (typeof window !== 'undefined') {
            localStorage.setItem(key, value);
            
            const secure = window.location.protocol === 'https:' ? '; Secure' : '';
            document.cookie = `${key}=${value}; path=/; max-age=31536000; SameSite=Lax${secure}`;
            
            if (key === 'supabase.auth.token') {
              try {
                const parsed = JSON.parse(value);
                if (parsed?.access_token) {
                  document.cookie = `access_token=${parsed.access_token}; path=/; max-age=31536000; SameSite=Lax${secure}`;
                }
              } catch (error) {
                console.error('Error parsing auth token:', error);
              }
            }
          }
        } catch (error) {
          console.error('Error setting auth token:', error);
        }
      },
      removeItem: (key: string): void => {
        try {
          if (typeof window !== 'undefined') {
            localStorage.removeItem(key);
            document.cookie = `${key}=; path=/; max-age=0`;
            
            if (key === 'supabase.auth.token') {
              document.cookie = `access_token=; path=/; max-age=0`;
            }
          }
        } catch (error) {
          console.error('Error removing auth token:', error);
        }
      }
    },
    flowType: 'pkce',
  },
  global: {
    headers: {
      'apikey': supabaseAnonKey,
    },
  },
});

// Initialize admin Supabase client for storage management
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey || supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    storageKey: 'supabase.auth.token',
    storage: {
      getItem: (key: string): string | null => {
        try {
          if (typeof window !== 'undefined') {
            const localValue = localStorage.getItem(key);
            if (localValue) return localValue;
            
            const cookies = document.cookie.split(';');
            for (const cookie of cookies) {
              const [cookieName, cookieValue] = cookie.split('=');
              if (cookieName.trim() === key) {
                return cookieValue;
              }
            }
          }
          return null;
        } catch (error) {
          console.error('Error retrieving auth token:', error);
          return null;
        }
      },
      setItem: (key: string, value: string): void => {
        try {
          if (typeof window !== 'undefined') {
            localStorage.setItem(key, value);
            
            const secure = window.location.protocol === 'https:' ? '; Secure' : '';
            document.cookie = `${key}=${value}; path=/; max-age=31536000; SameSite=Lax${secure}`;
            
            if (key === 'supabase.auth.token') {
              try {
                const parsed = JSON.parse(value);
                if (parsed?.access_token) {
                  document.cookie = `access_token=${parsed.access_token}; path=/; max-age=31536000; SameSite=Lax${secure}`;
                }
              } catch (error) {
                console.error('Error parsing auth token:', error);
              }
            }
          }
        } catch (error) {
          console.error('Error setting auth token:', error);
        }
      },
      removeItem: (key: string): void => {
        try {
          if (typeof window !== 'undefined') {
            localStorage.removeItem(key);
            document.cookie = `${key}=; path=/; max-age=0`;
            
            if (key === 'supabase.auth.token') {
              document.cookie = `access_token=; path=/; max-age=0`;
            }
          }
        } catch (error) {
          console.error('Error removing auth token:', error);
        }
      }
    },
    flowType: 'pkce',
  },
  global: {
    headers: {
      'apikey': supabaseServiceRoleKey || supabaseAnonKey,
    },
  },
});

// Log the Supabase URL to verify it's correct (only in development)
if (process.env.NODE_ENV === 'development') {
  console.log('Supabase URL:', supabaseUrl);
}

// Helper function to check if a user exists
export async function checkUserExists(email: string) {
  const { data: { users }, error } = await supabase.auth.admin.listUsers({
    email: email,
  });

  if (error) throw error;
  return users.length > 0;
}

// Function to fetch user roles
export async function fetchUserRoles(email: string) {
  const { data: { users }, error } = await supabase.auth.admin.listUsers({
    email: email,
  });

  if (error) throw error;
  if (users.length === 0) return null;

  const user = users[0];
  const { data: roles, error: rolesError } = await supabase
    .from('roles')
    .select('id, name, description, permissions')
    .eq('id', user.id)
    .single();

  if (rolesError) throw rolesError;
  return roles;
}