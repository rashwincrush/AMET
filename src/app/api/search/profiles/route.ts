import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

// Force dynamic to avoid static generation issues
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';


export async function GET(request: NextRequest) {
  const supabase = createRouteHandlerClient({ cookies });
  
  try {
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Get query parameters
    const url = new URL(request.url);
    const query = url.searchParams.get('query') || '';
    const graduationYears = url.searchParams.getAll('graduationYear');
    const majors = url.searchParams.getAll('major');
    const locations = url.searchParams.getAll('location');
    const roles = url.searchParams.getAll('role');
    const isMentor = url.searchParams.get('isMentor');
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '20');
    const sortBy = url.searchParams.get('sortBy') || 'last_name';
    const sortOrder = url.searchParams.get('sortOrder') || 'asc';
    
    // Build the query
    let dbQuery = supabase
      .from('profiles')
      .select('*, user_roles!inner(roles!inner(name))', { count: 'exact' });
    
    // Apply text search if query is provided
    if (query && query.trim() !== '') {
      dbQuery = dbQuery.textSearch(
        'search_vector',
        query.trim(),
        {
          config: 'english',
          type: 'websearch'
        }
      );
    }
    
    // Apply filters
    if (graduationYears.length > 0) {
      dbQuery = dbQuery.in('graduation_year', graduationYears);
    }
    
    if (majors.length > 0) {
      dbQuery = dbQuery.in('major', majors);
    }
    
    if (locations.length > 0) {
      dbQuery = dbQuery.in('location', locations);
    }
    
    if (isMentor !== null && isMentor !== undefined) {
      dbQuery = dbQuery.eq('is_mentor', isMentor === 'true');
    }
    
    // Apply pagination
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    dbQuery = dbQuery.range(from, to);
    
    // Apply sorting
    dbQuery = dbQuery.order(sortBy, { ascending: sortOrder === 'asc' });
    
    // Execute the query
    const { data, count, error } = await dbQuery;
    
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    // Filter by roles if specified
    let filteredData = data;
    if (roles.length > 0) {
      filteredData = data.filter(profile => {
        if (!profile.user_roles) return false;
        
        // Check if any of the user's roles match the requested roles
        return profile.user_roles.some((ur: any) => {
          return ur.roles && roles.includes(ur.roles.name);
        });
      });
    }
    
    // Format the response
    const formattedData = filteredData.map(profile => {
      // Extract roles from user_roles
      const userRoles = profile.user_roles
        ? profile.user_roles.map((ur: any) => ur.roles?.name).filter(Boolean)
        : [];
      
      // Remove user_roles from the profile object
      const { user_roles, ...profileData } = profile;
      
      // Return formatted profile with roles array
      return {
        ...profileData,
        roles: userRoles
      };
    });
    
    return NextResponse.json({
      data: formattedData,
      count,
      page,
      limit,
      totalPages: Math.ceil((count || 0) / limit)
    });
  } catch (error: any) {
    console.error('Error searching profiles:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
