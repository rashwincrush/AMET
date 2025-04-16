import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// GET /api/jobs - Get all job listings or filter by query params
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = supabase.from('jobs').select('*');
    
    // Apply filters if provided in query params
    if (searchParams.has('company')) {
      query.ilike('company', `%${searchParams.get('company')}%`);
    }
    
    if (searchParams.has('location')) {
      query.ilike('location', `%${searchParams.get('location')}%`);
    }
    
    if (searchParams.has('job_type')) {
      query.eq('job_type', searchParams.get('job_type'));
    }
    
    if (searchParams.has('experience_level')) {
      query.eq('experience_level', searchParams.get('experience_level'));
    }
    
    // Add search functionality
    if (searchParams.has('search')) {
      const searchTerm = searchParams.get('search');
      query.or(`title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%,company.ilike.%${searchTerm}%`);
    }
    
    // Only return active job listings by default
    if (!searchParams.has('include_inactive') || searchParams.get('include_inactive') !== 'true') {
      query.eq('is_active', true);
    }
    
    const { data, error } = await query;
    
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    return NextResponse.json({ jobs: data });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST /api/jobs - Create a new job listing
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate required fields
    const requiredFields = ['title', 'company', 'description', 'location', 'job_type'];
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json({ error: `Missing required field: ${field}` }, { status: 400 });
      }
    }
    
    // Add created_at timestamp
    const jobData = {
      ...body,
      created_at: new Date().toISOString(),
      is_active: true
    };
    
    const { data, error } = await supabase.from('jobs').insert(jobData).select();
    
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    return NextResponse.json({ job: data[0] }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PATCH /api/jobs - Update a job listing
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...updateData } = body;
    
    if (!id) {
      return NextResponse.json({ error: 'Missing job ID' }, { status: 400 });
    }
    
    const { data, error } = await supabase
      .from('jobs')
      .update(updateData)
      .eq('id', id)
      .select();
    
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    if (!data || data.length === 0) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }
    
    return NextResponse.json({ job: data[0] });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE /api/jobs - Delete a job listing
export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: 'Missing job ID' }, { status: 400 });
    }
    
    const { error } = await supabase.from('jobs').delete().eq('id', id);
    
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}