import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// Force dynamic to avoid static generation issues
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';


export async function GET() {
  try {
    // Check if the two_factor_secret column exists
    const { data: columnExists, error: checkError } = await supabase
      .from('profiles')
      .select('two_factor_secret')
      .limit(1)
      .single();
    
    // If we get a specific error about the column not existing, add it
    if (checkError && checkError.message.includes('column "two_factor_secret" does not exist')) {
      // Add the two_factor_secret column to the profiles table
      // This is a raw SQL query that needs to be executed with appropriate permissions
      const { error: alterError } = await supabase.rpc('add_two_factor_columns', {});
      
      if (alterError) {
        return NextResponse.json({ success: false, error: alterError.message }, { status: 500 });
      }
      
      return NextResponse.json({ success: true, message: 'Added two_factor_secret column to profiles table' });
    } else if (checkError) {
      // Some other error occurred
      return NextResponse.json({ success: false, error: checkError.message }, { status: 500 });
    }
    
    // Column already exists
    return NextResponse.json({ success: true, message: 'two_factor_secret column already exists' });
  } catch (error) {
    console.error('Error in migrate-db:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
