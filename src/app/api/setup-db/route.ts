import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  try {
    // First try to select from the profiles table to see if the columns exist
    const { error: checkError } = await supabase
      .from('profiles')
      .select('two_factor_enabled, two_factor_secret')
      .limit(1);
    
    // If there's an error about missing columns, we need to add them
    if (checkError && checkError.message.includes('does not exist')) {
      console.log('Columns missing, attempting to add them directly...');
      
      // Execute raw SQL to add the columns
      // Note: This requires appropriate permissions in Supabase
      const { error: alterError } = await supabase.rpc('exec_sql', {
        query: `
          ALTER TABLE profiles 
          ADD COLUMN IF NOT EXISTS two_factor_enabled BOOLEAN DEFAULT FALSE;
          ALTER TABLE profiles 
          ADD COLUMN IF NOT EXISTS two_factor_secret TEXT;
        `
      });
      
      if (alterError) {
        console.error('Error adding columns:', alterError);
        return NextResponse.json({
          success: false,
          error: alterError.message,
          message: 'Please add two_factor_enabled (boolean) and two_factor_secret (text) columns to your profiles table manually in the Supabase dashboard.'
        }, { status: 500 });
      }
      
      return NextResponse.json({
        success: true,
        message: 'Added two_factor_enabled and two_factor_secret columns to profiles table'
      });
    }
    
    // If we got here, either the columns already exist or we added them successfully
    return NextResponse.json({
      success: true,
      message: 'Database is properly configured for 2FA'
    });
  } catch (error) {
    console.error('Error in setup-db:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      message: 'Please add two_factor_enabled (boolean) and two_factor_secret (text) columns to your profiles table manually in the Supabase dashboard.'
    }, { status: 500 });
  }
}
