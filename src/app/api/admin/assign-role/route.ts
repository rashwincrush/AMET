import { NextRequest, NextResponse } from 'next/server';
import { assignAdminRole } from '@/lib/admin/assignAdminRole';
import { supabase } from '@/lib/supabase';

// Force dynamic to avoid static generation issues
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';


/**
 * API endpoint to assign admin role to a user
 * Requires the caller to be an admin
 */
export async function POST(request: NextRequest) {
  try {
    // Get the current user's session
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized - You must be logged in' },
        { status: 401 }
      );
    }

    // Check if the current user is an admin
    const { data: adminCheck } = await supabase
      .from('user_roles')
      .select('roles!inner(name)')
      .eq('profile_id', session.user.id)
      .eq('roles.name', 'admin')
      .single();

    if (!adminCheck) {
      return NextResponse.json(
        { error: 'Forbidden - Admin privileges required' },
        { status: 403 }
      );
    }

    // Parse the request body
    const body = await request.json();
    const { userId } = body;

    if (!userId) {
      return NextResponse.json(
        { error: 'Bad Request - User ID is required' },
        { status: 400 }
      );
    }

    // Assign admin role to the specified user
    const result = await assignAdminRole(userId);

    if (!result.success) {
      return NextResponse.json(
        { error: result.message },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: result.message
    });
  } catch (error) {
    console.error('Error in assign-role API:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}