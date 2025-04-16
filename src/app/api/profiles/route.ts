import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// Force dynamic to avoid static generation issues
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';


// GET /api/profiles - Get all profiles or filter by query params
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = supabase.from('profiles').select('*');
    
    // Apply filters if provided in query params
    if (searchParams.has('graduation_year')) {
      query.eq('graduation_year', searchParams.get('graduation_year'));
    }
    
    if (searchParams.has('major')) {
      query.ilike('major', `%${searchParams.get('major')}%`);
    }
    
    if (searchParams.has('location')) {
      query.ilike('location', `%${searchParams.get('location')}%`);
    }
    
    if (searchParams.has('is_mentor')) {
      query.eq('is_mentor', searchParams.get('is_mentor') === 'true');
    }
    
    // Add search functionality
    if (searchParams.has('search')) {
      const searchTerm = searchParams.get('search');
      query.or(`full_name.ilike.%${searchTerm}%,current_company.ilike.%${searchTerm}%,current_position.ilike.%${searchTerm}%`);
    }
    
    const { data, error } = await query;
    
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    return NextResponse.json({ profiles: data });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST /api/profiles - Create or update a profile
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...profileData } = body;
    
    if (!id) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }
    
    // Update the profile with the provided data
    const { data, error } = await supabase
      .from('profiles')
      .upsert({
        id,
        ...profileData,
        updated_at: new Date().toISOString()
      })
      .select()
      .single();
    
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    return NextResponse.json({ profile: data });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}