import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// GET /api/applications - Get all applications or filter by query params
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = supabase.from('job_applications').select('*');
    
    // Apply filters if provided in query params
    if (searchParams.has('job_id')) {
      query.eq('job_id', searchParams.get('job_id'));
    }
    
    if (searchParams.has('applicant_id')) {
      query.eq('applicant_id', searchParams.get('applicant_id'));
    }
    
    if (searchParams.has('status')) {
      query.eq('status', searchParams.get('status'));
    }
    
    // Add date range filtering
    if (searchParams.has('from_date')) {
      query.gte('created_at', searchParams.get('from_date'));
    }
    
    if (searchParams.has('to_date')) {
      query.lte('created_at', searchParams.get('to_date'));
    }
    
    const { data, error } = await query;
    
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    return NextResponse.json({ applications: data });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST /api/applications - Submit a new job application
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate required fields
    const requiredFields = ['job_id', 'applicant_id', 'resume_url'];
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json({ error: `Missing required field: ${field}` }, { status: 400 });
      }
    }
    
    // Add created_at timestamp and default status
    const applicationData = {
      ...body,
      created_at: new Date().toISOString(),
      status: 'pending'
    };
    
    const { data, error } = await supabase.from('job_applications').insert(applicationData).select();
    
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    return NextResponse.json({ application: data[0] }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PATCH /api/applications - Update an application status
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...updateData } = body;
    
    if (!id) {
      return NextResponse.json({ error: 'Missing application ID' }, { status: 400 });
    }
    
    const { data, error } = await supabase
      .from('job_applications')
      .update(updateData)
      .eq('id', id)
      .select();
    
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    if (!data || data.length === 0) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 });
    }
    
    return NextResponse.json({ application: data[0] });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE /api/applications - Delete a job application
export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: 'Missing application ID' }, { status: 400 });
    }
    
    const { error } = await supabase.from('job_applications').delete().eq('id', id);
    
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}