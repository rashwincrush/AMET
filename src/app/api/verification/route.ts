import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { createServerClient } from '@/lib/supabase-server';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  try {
    // Initialize server client to get authenticated user
    const cookieStore = cookies();
    const supabaseServer = createServerClient(cookieStore);
    
    const { data: { user }, error: authError } = await supabaseServer.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }
    
    // Check if user is an admin
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();
      
    if (profileError) {
      return NextResponse.json(
        { error: 'Error fetching user profile' },
        { status: 500 }
      );
    }
    
    if (profileData.role !== 'admin') {
      return NextResponse.json(
        { error: 'Access denied: Admin privileges required' },
        { status: 403 }
      );
    }
    
    // Get query parameters
    const url = new URL(request.url);
    const status = url.searchParams.get('status');
    
    // Build query
    let query = supabase
      .from('verification_requests')
      .select(`
        id,
        user_id,
        submitted_at,
        status,
        document_type,
        graduation_year,
        student_id,
        notes,
        profiles(
          first_name,
          last_name,
          email
        )
      `);
    
    // Filter by status if provided
    if (status) {
      query = query.eq('status', status);
    }
    
    const { data, error } = await query.order('submitted_at', { ascending: false });
    
    if (error) {
      return NextResponse.json(
        { error: 'Error fetching verification requests' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({ requests: data });
  } catch (error) {
    console.error('Error in verification GET route:', error);
    return NextResponse.json(
      { error: 'Server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Initialize server client to get authenticated user
    const cookieStore = cookies();
    const supabaseServer = createServerClient(cookieStore);
    
    const { data: { user }, error: authError } = await supabaseServer.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }
    
    // Parse request body
    const requestData = await request.json();
    const { document_url, document_type, graduation_year, student_id, notes } = requestData;
    
    if (!document_url || !document_type) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    // Create verification request
    const { data, error } = await supabase
      .from('verification_requests')
      .insert({
        user_id: user.id,
        document_url,
        document_type,
        graduation_year,
        student_id,
        notes,
        status: 'pending',
        submitted_at: new Date().toISOString()
      })
      .select()
      .single();
    
    if (error) {
      return NextResponse.json(
        { error: 'Error creating verification request' },
        { status: 500 }
      );
    }
    
    // Update user's verification status
    const roleField = document_type === 'alumni_verification' 
      ? 'alumni_verification_status' 
      : document_type === 'mentor_verification' 
        ? 'mentor_status' 
        : 'mentee_status';
    
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ [roleField]: 'pending' })
      .eq('id', user.id);
    
    if (updateError) {
      console.error('Error updating profile status:', updateError);
      // Continue anyway since the request was created
    }
    
    return NextResponse.json({ 
      message: 'Verification request submitted successfully',
      request: data
    });
  } catch (error) {
    console.error('Error in verification POST route:', error);
    return NextResponse.json(
      { error: 'Server error' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    // Initialize server client to get authenticated user
    const cookieStore = cookies();
    const supabaseServer = createServerClient(cookieStore);
    
    const { data: { user }, error: authError } = await supabaseServer.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }
    
    // Check if user is an admin
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();
      
    if (profileError) {
      return NextResponse.json(
        { error: 'Error fetching user profile' },
        { status: 500 }
      );
    }
    
    if (profileData.role !== 'admin') {
      return NextResponse.json(
        { error: 'Access denied: Admin privileges required' },
        { status: 403 }
      );
    }
    
    // Parse request body
    const requestData = await request.json();
    const { id, status, admin_notes } = requestData;
    
    if (!id || !status) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    if (!['approved', 'rejected'].includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status, must be approved or rejected' },
        { status: 400 }
      );
    }
    
    // Get the verification request
    const { data: verificationData, error: verificationError } = await supabase
      .from('verification_requests')
      .select('user_id, document_type')
      .eq('id', id)
      .single();
    
    if (verificationError) {
      return NextResponse.json(
        { error: 'Error fetching verification request' },
        { status: 500 }
      );
    }
    
    // Update the verification request
    const { error: updateError } = await supabase
      .from('verification_requests')
      .update({ 
        status, 
        admin_notes,
        reviewed_at: new Date().toISOString(),
        reviewed_by: user.id
      })
      .eq('id', id);
    
    if (updateError) {
      return NextResponse.json(
        { error: 'Error updating verification request' },
        { status: 500 }
      );
    }
    
    // Update the user's profile with the new status
    const roleField = verificationData.document_type === 'alumni_verification' 
      ? 'alumni_verification_status' 
      : verificationData.document_type === 'mentor_verification' 
        ? 'mentor_status' 
        : 'mentee_status';
    
    const { error: profileUpdateError } = await supabase
      .from('profiles')
      .update({ [roleField]: status })
      .eq('id', verificationData.user_id);
    
    if (profileUpdateError) {
      console.error('Error updating profile status:', profileUpdateError);
      // Continue anyway since the request was updated
    }
    
    return NextResponse.json({ 
      message: `Verification request ${status} successfully` 
    });
  } catch (error) {
    console.error('Error in verification PATCH route:', error);
    return NextResponse.json(
      { error: 'Server error' },
      { status: 500 }
    );
  }
} 