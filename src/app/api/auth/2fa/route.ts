import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';

// Helper function to log 2FA activities
async function logActivity(supabase: any, userId: string, type: string, details: any = {}) {
  try {
    await supabase.from('activity_logs').insert({
      user_id: userId,
      activity_type: type,
      details: details
    });
  } catch (error) {
    console.error('Failed to log activity:', error);
  }
}

// Enable 2FA for a user
export async function POST(request: NextRequest) {
  const supabase = createRouteHandlerClient({ cookies });
  
  try {
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const { recovery_email } = await request.json();
    
    if (!recovery_email) {
      return NextResponse.json({ error: 'Recovery email is required' }, { status: 400 });
    }
    
    // Update profile to enable 2FA
    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        two_factor_enabled: true,
        recovery_email: recovery_email
      })
      .eq('id', user.id);
    
    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }
    
    // Log the activity
    await logActivity(supabase, user.id, '2fa_enable', { recovery_email });
    
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// Disable 2FA for a user
export async function DELETE(request: NextRequest) {
  const supabase = createRouteHandlerClient({ cookies });
  
  try {
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Update profile to disable 2FA
    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        two_factor_enabled: false,
        trusted_devices: "[]"
      })
      .eq('id', user.id);
    
    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }
    
    // Log the activity
    await logActivity(supabase, user.id, '2fa_disable');
    
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
