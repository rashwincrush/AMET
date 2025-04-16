import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// GET /api/groups - Get all networking groups or filter by query params
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = supabase.from('networking_groups').select('*');
    
    // Apply filters if provided in query params
    if (searchParams.has('category')) {
      query.eq('category', searchParams.get('category'));
    }
    
    if (searchParams.has('is_private')) {
      query.eq('is_private', searchParams.get('is_private') === 'true');
    }
    
    // Add search functionality
    if (searchParams.has('search')) {
      const searchTerm = searchParams.get('search');
      query.or(`name.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`);
    }
    
    const { data, error } = await query;
    
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    return NextResponse.json({ groups: data });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST /api/groups - Create a new networking group
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate required fields
    const requiredFields = ['name', 'description', 'category', 'created_by'];
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json({ error: `Missing required field: ${field}` }, { status: 400 });
      }
    }
    
    // Add created_at timestamp and default values
    const groupData = {
      ...body,
      created_at: new Date().toISOString(),
      is_private: body.is_private || false,
      member_count: 1 // Creator is the first member
    };
    
    const { data, error } = await supabase.from('networking_groups').insert(groupData).select();
    
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    // Add creator as a member and admin of the group
    if (data && data.length > 0) {
      const memberData = {
        group_id: data[0].id,
        user_id: body.created_by,
        joined_at: new Date().toISOString(),
        is_admin: true
      };
      
      await supabase.from('group_members').insert(memberData);
    }
    
    return NextResponse.json({ group: data[0] }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PATCH /api/groups - Update a networking group
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...updateData } = body;
    
    if (!id) {
      return NextResponse.json({ error: 'Missing group ID' }, { status: 400 });
    }
    
    const { data, error } = await supabase
      .from('networking_groups')
      .update(updateData)
      .eq('id', id)
      .select();
    
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    if (!data || data.length === 0) {
      return NextResponse.json({ error: 'Group not found' }, { status: 404 });
    }
    
    return NextResponse.json({ group: data[0] });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE /api/groups - Delete a networking group
export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: 'Missing group ID' }, { status: 400 });
    }
    
    // First delete all group members
    await supabase.from('group_members').delete().eq('group_id', id);
    
    // Then delete the group itself
    const { error } = await supabase.from('networking_groups').delete().eq('id', id);
    
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}