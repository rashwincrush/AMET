import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { hasPermission } from '@/lib/roles';

export async function GET(request: NextRequest) {
  const supabase = createRouteHandlerClient({ cookies });
  
  try {
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Skip the check if we're using a mock client or no permissions needed
    if (typeof hasPermission === 'function') {
      // Cast userRoles to any to avoid type issues for now
      const hasAccess = await hasPermission(user.id, 'manage_users');
      if (!hasAccess) {
        return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
      }
    }
    
    // Get query parameters for filtering
    const url = new URL(request.url);
    const graduationYear = url.searchParams.get('graduation_year');
    const isMentor = url.searchParams.get('is_mentor');
    const role = url.searchParams.get('role');
    
    // Build the query
    let query = supabase.from('profiles').select('*');
    
    // Apply filters if provided
    if (graduationYear) {
      query = query.eq('graduation_year', graduationYear);
    }
    
    if (isMentor) {
      query = query.eq('is_mentor', isMentor === 'true');
    }
    
    // Execute the query
    const { data: profiles, error } = await query;
    
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    // If role filter is provided, filter the results after fetching
    let filteredProfiles = profiles;
    if (role) {
      // Get all users with the specified role
      const { data: roleUsers } = await supabase
        .from('user_roles')
        .select('profile_id, roles!inner(name)')
        .eq('roles.name', role);
      
      const profileIdsWithRole = roleUsers?.map(ru => ru.profile_id) || [];
      
      // Filter profiles to only those with the role
      filteredProfiles = profiles.filter(profile => 
        profileIdsWithRole.includes(profile.id)
      );
    }
    
    // Log the export activity
    await supabase.from('activity_logs').insert({
      user_id: user.id,
      activity_type: 'user_export',
      details: {
        filters: { graduationYear, isMentor, role },
        count: filteredProfiles.length
      }
    });
    
    return NextResponse.json(filteredProfiles);
  } catch (error: any) {
    console.error('Export error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
