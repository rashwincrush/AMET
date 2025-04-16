import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// GET /api/mentorship - Get all mentorship relationships or filter by query params
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = supabase.from('mentorship').select('*');
    
    // Apply filters if provided in query params
    if (searchParams.has('mentor_id')) {
      query.eq('mentor_id', searchParams.get('mentor_id'));
    }
    
    if (searchParams.has('mentee_id')) {
      query.eq('mentee_id', searchParams.get('mentee_id'));
    }
    
    if (searchParams.has('status')) {
      query.eq('status', searchParams.get('status'));
    }
    
    if (searchParams.has('field')) {
      query.ilike('field', `%${searchParams.get('field')}%`);
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
    
    return NextResponse.json({ mentorships: data });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST /api/mentorship - Create a new mentorship request
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate required fields
    const requiredFields = ['mentor_id', 'mentee_id', 'field', 'goals'];
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json({ error: `Missing required field: ${field}` }, { status: 400 });
      }
    }
    
    // Add created_at timestamp and default status
    const mentorshipData = {
      ...body,
      created_at: new Date().toISOString(),
      status: 'pending'
    };
    
    const { data, error } = await supabase.from('mentorship').insert(mentorshipData).select();
    
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    return NextResponse.json({ mentorship: data[0] }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PATCH /api/mentorship - Update a mentorship relationship status
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...updateData } = body;
    
    if (!id) {
      return NextResponse.json({ error: 'Missing mentorship ID' }, { status: 400 });
    }
    
    const { data, error } = await supabase
      .from('mentorship')
      .update(updateData)
      .eq('id', id)
      .select();
    
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    if (!data || data.length === 0) {
      return NextResponse.json({ error: 'Mentorship relationship not found' }, { status: 404 });
    }
    
    return NextResponse.json({ mentorship: data[0] });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE /api/mentorship - End a mentorship relationship
export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: 'Missing mentorship ID' }, { status: 400 });
    }
    
    const { error } = await supabase.from('mentorship').delete().eq('id', id);
    
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}