import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// Force dynamic to avoid static generation issues
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// GET /api/events - Get all events or filter by query params
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = supabase.from('events').select('*');
    
    // Apply filters if provided in query params
    if (searchParams.has('start_date')) {
      query.gte('start_date', searchParams.get('start_date'));
    }
    
    if (searchParams.has('end_date')) {
      query.lte('end_date', searchParams.get('end_date'));
    }
    
    if (searchParams.has('is_virtual')) {
      query.eq('is_virtual', searchParams.get('is_virtual') === 'true');
    }
    
    if (searchParams.has('location')) {
      query.ilike('location', `%${searchParams.get('location')}%`);
    }
    
    // Add search functionality
    if (searchParams.has('search')) {
      const searchTerm = searchParams.get('search');
      query.or(`title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`);
    }
    
    // Only return published events for non-admin users
    if (!searchParams.has('include_unpublished')) {
      query.eq('is_published', true);
    }
    
    const { data, error } = await query;
    
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    return NextResponse.json({ events: data });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST /api/events - Create a new event
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { creator_id, ...eventData } = body;
    
    if (!creator_id) {
      return NextResponse.json({ error: 'Creator ID is required' }, { status: 400 });
    }
    
    // Create the event with the provided data
    const { data, error } = await supabase
      .from('events')
      .insert({
        creator_id,
        ...eventData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();
    
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    return NextResponse.json({ event: data });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PATCH /api/events/:id - Update an existing event
export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const eventId = params.id;
    const body = await request.json();
    const { ...eventData } = body;
    
    // Update the event with the provided data
    const { data, error } = await supabase
      .from('events')
      .update({
        ...eventData,
        updated_at: new Date().toISOString()
      })
      .eq('id', eventId)
      .select()
      .single();
    
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    return NextResponse.json({ event: data });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE /api/events/:id - Delete an event
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const eventId = params.id;
    
    // Delete the event
    const { error } = await supabase
      .from('events')
      .delete()
      .eq('id', eventId);
    
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}