import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

// Force dynamic to avoid static generation issues
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';


// Get all pending achievements for admin approval
export async function GET(request: NextRequest) {
  const supabase = createRouteHandlerClient({ cookies });
  
  try {
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Check if user is admin or moderator
    const { data: userRoles, error: rolesError } = await supabase
      .from('user_roles')
      .select('roles!inner(name)')
      .eq('user_id', user.id);
    
    if (rolesError) {
      return NextResponse.json({ error: rolesError.message }, { status: 500 });
    }
    
    const roles = userRoles.map((ur: any) => ur.roles.name);
    const isAdminOrModerator = roles.some((role: string) => ['super_admin', 'admin', 'moderator'].includes(role));
    
    if (!isAdminOrModerator) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }
    
    // Get pagination parameters
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '10');
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    
    // Get pending achievements with user information
    const { data, count, error } = await supabase
      .from('achievements')
      .select('*, profiles!inner(id, first_name, last_name, avatar_url)', { count: 'exact' })
      .eq('is_approved', false)
      .order('created_at', { ascending: false })
      .range(from, to);
    
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    return NextResponse.json({
      achievements: data,
      count,
      page,
      limit,
      totalPages: Math.ceil((count || 0) / limit)
    });
  } catch (error: any) {
    console.error('Error getting pending achievements:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// Bulk approve or reject achievements
export async function POST(request: NextRequest) {
  const supabase = createRouteHandlerClient({ cookies });
  
  try {
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Check if user is admin or moderator
    const { data: userRoles, error: rolesError } = await supabase
      .from('user_roles')
      .select('roles!inner(name)')
      .eq('user_id', user.id);
    
    if (rolesError) {
      return NextResponse.json({ error: rolesError.message }, { status: 500 });
    }
    
    const roles = userRoles.map((ur: any) => ur.roles.name);
    const isAdminOrModerator = roles.some((role: string) => ['super_admin', 'admin', 'moderator'].includes(role));
    
    if (!isAdminOrModerator) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }
    
    const { action, achievementIds } = await request.json();
    
    if (!action || !achievementIds || !Array.isArray(achievementIds) || achievementIds.length === 0) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }
    
    if (action !== 'approve' && action !== 'reject') {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
    
    // Update achievements
    const { error } = await supabase
      .from('achievements')
      .update({ is_approved: action === 'approve' })
      .in('id', achievementIds);
    
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    return NextResponse.json({
      success: true,
      action,
      count: achievementIds.length
    });
  } catch (error: any) {
    console.error('Error updating achievements:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
