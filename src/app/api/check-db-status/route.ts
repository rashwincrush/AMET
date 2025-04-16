import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  try {
    // Check if roles exist
    const { data: roles, error: rolesError } = await supabase
      .from('roles')
      .select('id')
      .limit(1);

    if (rolesError) {
      return NextResponse.json({
        success: false,
        error: 'Error checking database status'
      }, { status: 500 });
    }

    // Check if admin user exists
    const { data: adminUser, error: adminError } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', 'admin@example.com')
      .limit(1)
      .single();

    if (adminError && adminError.code !== 'PGRST116') {
      return NextResponse.json({
        success: false,
        error: 'Error checking admin user'
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      databaseInitialized: roles && roles.length > 0,
      adminUserExists: adminUser ? true : false
    });
  } catch (error) {
    console.error('Error checking database status:', error);
    return NextResponse.json({
      success: false,
      error: 'Database check failed'
    }, { status: 500 });
  }
}
