import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const supabase = createRouteHandlerClient({ cookies });
  
  try {
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Get graduation years
    const { data: graduationYears, error: graduationYearsError } = await supabase
      .from('profiles')
      .select('graduation_year')
      .not('graduation_year', 'is', null)
      .order('graduation_year', { ascending: false });
    
    if (graduationYearsError) {
      return NextResponse.json({ error: graduationYearsError.message }, { status: 500 });
    }
    
    // Get majors
    const { data: majors, error: majorsError } = await supabase
      .from('profiles')
      .select('major')
      .not('major', 'is', null);
    
    if (majorsError) {
      return NextResponse.json({ error: majorsError.message }, { status: 500 });
    }
    
    // Get locations
    const { data: locations, error: locationsError } = await supabase
      .from('profiles')
      .select('location')
      .not('location', 'is', null);
    
    if (locationsError) {
      return NextResponse.json({ error: locationsError.message }, { status: 500 });
    }
    
    // Get roles
    const { data: roles, error: rolesError } = await supabase
      .from('roles')
      .select('name')
      .order('name');
    
    if (rolesError) {
      return NextResponse.json({ error: rolesError.message }, { status: 500 });
    }
    
    // Process and deduplicate the data
    const uniqueGraduationYears = [...new Set(graduationYears.map(item => item.graduation_year))]
      .filter(Boolean)
      .sort((a, b) => b - a);
    
    const uniqueMajors = [...new Set(majors.map(item => item.major))]
      .filter(Boolean)
      .sort();
    
    const uniqueLocations = [...new Set(locations.map(item => item.location))]
      .filter(Boolean)
      .sort();
    
    const roleOptions = roles.map(role => ({
      value: role.name,
      label: role.name.charAt(0).toUpperCase() + role.name.slice(1).replace('_', ' ')
    }));
    
    // Return the filter options
    return NextResponse.json({
      graduationYears: uniqueGraduationYears,
      majors: uniqueMajors,
      locations: uniqueLocations,
      roles: roleOptions
    });
  } catch (error: any) {
    console.error('Error getting filter options:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
