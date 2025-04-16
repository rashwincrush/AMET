import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// GET /api/admin/users - Get all users with role information
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const path = request.nextUrl.pathname.split('/').pop();
    
    // Handle different admin endpoints
    switch (path) {
      case 'users':
        return await getUsers(searchParams);
      case 'stats':
        return await getStats();
      case 'logs':
        return await getLogs(searchParams);
      default:
        return NextResponse.json({ error: 'Invalid admin endpoint' }, { status: 404 });
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// GET /api/admin/users - Get all users with role information
async function getUsers(searchParams: URLSearchParams) {
  const query = supabase.from('users').select('*, roles(*)');
  
  // Apply filters if provided in query params
  if (searchParams.has('role')) {
    query.eq('roles.name', searchParams.get('role'));
  }
  
  if (searchParams.has('status')) {
    query.eq('status', searchParams.get('status'));
  }
  
  // Add search functionality
  if (searchParams.has('search')) {
    const searchTerm = searchParams.get('search');
    query.or(`email.ilike.%${searchTerm}%,full_name.ilike.%${searchTerm}%`);
  }
  
  const { data, error } = await query;
  
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  
  return NextResponse.json({ users: data });
}

// GET /api/admin/stats - Get system statistics
async function getStats() {
  // Get user count
  const { count: userCount, error: userError } = await supabase
    .from('users')
    .select('*', { count: 'exact', head: true });
  
  // Get event count
  const { count: eventCount, error: eventError } = await supabase
    .from('events')
    .select('*', { count: 'exact', head: true });
  
  // Get job count
  const { count: jobCount, error: jobError } = await supabase
    .from('jobs')
    .select('*', { count: 'exact', head: true });
  
  // Get mentorship count
  const { count: mentorshipCount, error: mentorshipError } = await supabase
    .from('mentorship')
    .select('*', { count: 'exact', head: true });
  
  if (userError || eventError || jobError || mentorshipError) {
    return NextResponse.json({ 
      error: 'Error fetching statistics' 
    }, { status: 500 });
  }
  
  return NextResponse.json({
    stats: {
      users: userCount,
      events: eventCount,
      jobs: jobCount,
      mentorships: mentorshipCount
    }
  });
}

// GET /api/admin/logs - Get system activity logs
async function getLogs(searchParams: URLSearchParams) {
  const query = supabase.from('activity_logs').select('*');
  
  // Apply filters if provided in query params
  if (searchParams.has('user_id')) {
    query.eq('user_id', searchParams.get('user_id'));
  }
  
  if (searchParams.has('action_type')) {
    query.eq('action_type', searchParams.get('action_type'));
  }
  
  // Add date range filtering
  if (searchParams.has('from_date')) {
    query.gte('created_at', searchParams.get('from_date'));
  }
  
  if (searchParams.has('to_date')) {
    query.lte('created_at', searchParams.get('to_date'));
  }
  
  // Order by most recent first
  query.order('created_at', { ascending: false });
  
  // Add pagination
  const page = parseInt(searchParams.get('page') || '1');
  const pageSize = parseInt(searchParams.get('page_size') || '20');
  const start = (page - 1) * pageSize;
  query.range(start, start + pageSize - 1);
  
  const { data, error } = await query;
  
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  
  return NextResponse.json({ logs: data });
}

// POST /api/admin/roles - Create or update user roles
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const path = request.nextUrl.pathname.split('/').pop();
    
    // Handle different admin POST endpoints
    switch (path) {
      case 'roles':
        return await updateUserRole(body);
      case 'settings':
        return await updateSystemSettings(body);
      default:
        return NextResponse.json({ error: 'Invalid admin endpoint' }, { status: 404 });
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// Update user role
async function updateUserRole(body: any) {
  const { user_id, role } = body;
  
  if (!user_id || !role) {
    return NextResponse.json({ 
      error: 'Missing required fields: user_id and role' 
    }, { status: 400 });
  }
  
  // Check if user exists
  const { data: userData, error: userError } = await supabase
    .from('users')
    .select('id')
    .eq('id', user_id)
    .single();
  
  if (userError || !userData) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }
  
  // Update or insert role
  const { data, error } = await supabase
    .from('user_roles')
    .upsert({
      user_id,
      role,
      updated_at: new Date().toISOString()
    })
    .select();
  
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  
  return NextResponse.json({ role: data[0] });
}

// Update system settings
async function updateSystemSettings(body: any) {
  const { settings } = body;
  
  if (!settings || typeof settings !== 'object') {
    return NextResponse.json({ 
      error: 'Missing or invalid settings object' 
    }, { status: 400 });
  }
  
  // Update each setting
  const updates = Object.entries(settings).map(async ([key, value]) => {
    return supabase
      .from('system_settings')
      .upsert({
        key,
        value: JSON.stringify(value),
        updated_at: new Date().toISOString()
      });
  });
  
  await Promise.all(updates);
  
  return NextResponse.json({ success: true });
}

// DELETE /api/admin - Delete user or log
export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const path = request.nextUrl.pathname.split('/').pop();
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: 'Missing ID parameter' }, { status: 400 });
    }
    
    // Handle different admin DELETE endpoints
    switch (path) {
      case 'users':
        return await deleteUser(id);
      case 'logs':
        return await deleteLog(id);
      default:
        return NextResponse.json({ error: 'Invalid admin endpoint' }, { status: 404 });
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// Delete user
async function deleteUser(id: string) {
  // First delete related records
  await supabase.from('user_roles').delete().eq('user_id', id);
  
  // Then delete the user
  const { error } = await supabase.from('users').delete().eq('id', id);
  
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  
  return NextResponse.json({ success: true });
}

// Delete activity log
async function deleteLog(id: string) {
  const { error } = await supabase.from('activity_logs').delete().eq('id', id);
  
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  
  return NextResponse.json({ success: true });
}