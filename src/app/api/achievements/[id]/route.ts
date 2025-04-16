import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

// Get a specific achievement
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const supabase = createRouteHandlerClient({ cookies });
  
  try {
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const { id } = params;
    
    // Get the achievement
    const { data, error } = await supabase
      .from('achievements')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    // Check if the user has permission to view this achievement
    // Admins, moderators, and the owner can view any achievement
    // Others can only view approved achievements
    if (data.user_id !== user.id && !data.is_approved) {
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
    }
    
    return NextResponse.json({ achievement: data });
  } catch (error: any) {
    console.error('Error getting achievement:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// Update an achievement
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  const supabase = createRouteHandlerClient({ cookies });
  
  try {
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const { id } = params;
    const { title, description, date, url, image_url, is_approved } = await request.json();
    
    // Validate required fields
    if (!title) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }
    
    if (!description) {
      return NextResponse.json({ error: 'Description is required' }, { status: 400 });
    }
    
    // Get the current achievement
    const { data: existingAchievement, error: getError } = await supabase
      .from('achievements')
      .select('*')
      .eq('id', id)
      .single();
    
    if (getError) {
      return NextResponse.json({ error: getError.message }, { status: 500 });
    }
    
    // Check if user has permission to update this achievement
    if (existingAchievement.user_id !== user.id) {
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
    }
    
    // Prepare update data
    const updateData: any = {
      title,
      description,
      date,
      url,
      image_url
    };
    
    // Only admins and moderators can update approval status
    if (is_approved !== undefined) {
      const { data: userRoles, error: rolesError } = await supabase
        .from('user_roles')
        .select('roles!inner(name)')
        .eq('user_id', user.id);
      
      if (rolesError) {
        return NextResponse.json({ error: rolesError.message }, { status: 500 });
      }
      
      const roles = userRoles.map((ur: any) => ur.roles.name);
      const isAdminOrModerator = roles.some((role: string) => ['super_admin', 'admin', 'moderator'].includes(role));
      
      if (isAdminOrModerator) {
        updateData.is_approved = is_approved;
      }
    }
    
    // Update the achievement
    const { data, error } = await supabase
      .from('achievements')
      .update(updateData)
      .eq('id', id)
      .select();
    
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    return NextResponse.json({ achievement: data[0] });
  } catch (error: any) {
    console.error('Error updating achievement:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// Delete an achievement
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  const supabase = createRouteHandlerClient({ cookies });
  
  try {
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const { id } = params;
    
    // Get the current achievement
    const { data: existingAchievement, error: getError } = await supabase
      .from('achievements')
      .select('*')
      .eq('id', id)
      .single();
    
    if (getError) {
      return NextResponse.json({ error: getError.message }, { status: 500 });
    }
    
    // Check if user has permission to delete this achievement
    if (existingAchievement.user_id !== user.id) {
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
    }
    
    // Delete the achievement
    const { error } = await supabase
      .from('achievements')
      .delete()
      .eq('id', id);
    
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting achievement:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
