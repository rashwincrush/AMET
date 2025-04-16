import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

// Generate a recovery code
export async function POST(request: NextRequest) {
  const supabase = createRouteHandlerClient({ cookies });
  
  try {
    const { email } = await request.json();
    
    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }
    
    // Find user by email
    const { data: userData, error: userError } = await supabase
      .from('profiles')
      .select('id, recovery_email, two_factor_enabled')
      .eq('email', email)
      .single();
    
    if (userError || !userData) {
      // Don't reveal if user exists or not for security
      return NextResponse.json({ success: true, message: 'If your account exists, a recovery email has been sent' });
    }
    
    // Check if 2FA is enabled
    if (!userData.two_factor_enabled) {
      return NextResponse.json({ success: true, message: 'If your account exists, a recovery email has been sent' });
    }
    
    // Generate a recovery code (6-digit number)
    const recoveryCode = Math.floor(100000 + Math.random() * 900000).toString();
    
    // In a real implementation, we would store this code securely with an expiry
    // and send it to the recovery email. For this demo, we'll simulate that process.
    
    // Store the recovery code with a 15-minute expiry
    const expiryTime = new Date();
    expiryTime.setMinutes(expiryTime.getMinutes() + 15);
    
    // For a real implementation, you would store this in a secure table
    // Here we'll use a temporary storage mechanism
    await supabase.from('recovery_codes').upsert({
      user_id: userData.id,
      code: recoveryCode,
      expires_at: expiryTime.toISOString(),
      used: false
    }, { onConflict: 'user_id' });
    
    // In a real implementation, send the code to recovery_email
    // For demo purposes, we'll log it (never do this in production)
    console.log(`Recovery code for ${email}: ${recoveryCode}`);
    
    // Log the recovery attempt
    await supabase.from('activity_logs').insert({
      user_id: userData.id,
      activity_type: '2fa_recovery',
      details: { recovery_initiated: true }
    });
    
    return NextResponse.json({ 
      success: true, 
      message: 'If your account exists, a recovery email has been sent',
      // Only in development, remove in production:
      dev_code: process.env.NODE_ENV === 'development' ? recoveryCode : undefined
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// Verify recovery code and reset 2FA
export async function PUT(request: NextRequest) {
  const supabase = createRouteHandlerClient({ cookies });
  
  try {
    const { email, recoveryCode } = await request.json();
    
    if (!email || !recoveryCode) {
      return NextResponse.json({ error: 'Email and recovery code are required' }, { status: 400 });
    }
    
    // Find user by email
    const { data: userData, error: userError } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', email)
      .single();
    
    if (userError || !userData) {
      return NextResponse.json({ error: 'Invalid recovery information' }, { status: 400 });
    }
    
    // Verify the recovery code
    const { data: recoveryData, error: recoveryError } = await supabase
      .from('recovery_codes')
      .select('*')
      .eq('user_id', userData.id)
      .eq('code', recoveryCode)
      .eq('used', false)
      .single();
    
    if (recoveryError || !recoveryData) {
      return NextResponse.json({ error: 'Invalid recovery code' }, { status: 400 });
    }
    
    // Check if code is expired
    if (new Date(recoveryData.expires_at) < new Date()) {
      return NextResponse.json({ error: 'Recovery code has expired' }, { status: 400 });
    }
    
    // Mark code as used
    await supabase
      .from('recovery_codes')
      .update({ used: true })
      .eq('user_id', userData.id);
    
    // Disable 2FA for the user
    await supabase
      .from('profiles')
      .update({ 
        two_factor_enabled: false,
        trusted_devices: '[]' 
      })
      .eq('id', userData.id);
    
    // Log the successful recovery
    await supabase.from('activity_logs').insert({
      user_id: userData.id,
      activity_type: '2fa_recovery',
      details: { recovery_successful: true }
    });
    
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
