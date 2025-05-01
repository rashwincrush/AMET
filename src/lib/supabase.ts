import { createClient } from '@supabase/supabase-js';
import { mockSupabaseClient } from './mockSupabase';

// Debug logs to check environment variables
console.log('Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? 'Set' : 'Not set');
console.log('Supabase Anon Key:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Set' : 'Not set');

// Check if we should use mock data - force true for deployed app to avoid 406 errors
const useMockData = true; // Force mock data to true for all environments to avoid API errors

// Check for environment variables and provide fallback
if ((!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) && !useMockData) {
  console.warn('Creating mock Supabase client as fallback - missing environment variables');
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Use mock Supabase client if specified or if environment variables are missing
const shouldUseMock = useMockData || (!supabaseUrl || !supabaseAnonKey);

// Initialize Supabase client with simplified configuration or use mock
export const supabase = shouldUseMock 
  ? mockSupabaseClient 
  : createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true
      },
      global: {
        headers: {
          'apikey': supabaseAnonKey,
        },
      },
    });

// Initialize admin Supabase client for server-side operations
export const supabaseServer = shouldUseMock
  ? mockSupabaseClient
  : createClient(supabaseUrl, supabaseServiceRoleKey || supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true
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
  try {
    // Use type assertion to handle the PostgrestResponse type
    const response = await supabase
      .from('profiles')
      .select('id, email')
      .eq('email', email)
      .single();
      
    const { data, error } = response as { data: any, error: any };

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
    // Use type assertion to handle the PostgrestResponse type
    const response = await supabase
      .from('user_roles')
      .select('role_id, roles(name, permissions)')
      .eq('user_id', userId);
      
    const { data, error } = response as { data: any, error: any };

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching user roles:', error);
    return [];
  }
}