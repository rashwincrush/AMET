import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

// Force dynamic to avoid static generation issues
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';


// Get all achievements for the current user
export async function GET(request: NextRequest) {
  const supabase = createRouteHandlerClient({ cookies });
  
  try {
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Check if we're getting achievements for a specific user
    const url = new URL(request.url);
    const userId = url.searchParams.get('userId');
    const approved = url.searchParams.get('approved');
    
    let query = supabase
      .from('achievements')
      .select('*')
      .order('created_at', { ascending: false });
    
    // If userId is provided, get achievements for that user
    if (userId) {
      query = query.eq('user_id', userId);
    } else {
      // Otherwise, get achievements for the current user
      query = query.eq('user_id', user.id);
    }
    
    // Filter by approval status if specified
    if (approved === 'true') {
      query = query.eq('is_approved', true);
    } else if (approved === 'false') {
      query = query.eq('is_approved', false);
    }
    
    const { data, error } = await query;
    
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    return NextResponse.json({ achievements: data });
  } catch (error: any) {
    console.error('Error getting achievements:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// Create a new achievement
export async function POST(request: NextRequest) {
  const supabase = createRouteHandlerClient({ cookies });
  
  try {
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const { title, description, date, url, image_url } = await request.json();
    
    // Validate required fields
    if (!title) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }
    
    if (!description) {
      return NextResponse.json({ error: 'Description is required' }, { status: 400 });
    }
    
    // Check if user is admin or moderator to auto-approve
    const { data: userRoles, error: rolesError } = await supabase
      .from('user_roles')
      .select('roles!inner(name)')
      .eq('user_id', user.id);
    
    if (rolesError) {
      return NextResponse.json({ error: rolesError.message }, { status: 500 });
    }
    
    const roles = userRoles.map((ur: any) => ur.roles.name);
    const isAdminOrModerator = roles.some((role: string) => ['super_admin', 'admin', 'moderator'].includes(role));
    
    // Create the achievement
    const { data, error } = await supabase
      .from('achievements')
      .insert({
        user_id: user.id,
        title,
        description,
        date,
        url,
        image_url,
        is_approved: isAdminOrModerator // Auto-approve for admins and moderators
      })
      .select();
    
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    return NextResponse.json({ achievement: data[0] });
  } catch (error: any) {
    console.error('Error creating achievement:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
