import { supabase } from './supabase';

// Use regular supabase client instead of admin for build
const supabaseClient = supabase;

export async function populateDatabase() {
  console.log('This is a mock function for production build');
  return { success: true };
}
