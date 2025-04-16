import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

// Force dynamic to avoid static generation issues
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';


// Generate a device fingerprint from request data
function generateDeviceFingerprint(request: NextRequest, userId: string) {
  const userAgent = request.headers.get('user-agent') || '';
  const ip = request.headers.get('x-forwarded-for') || request.ip || '';
  
  // Create a hash of the user agent, IP, and user ID
  return crypto
    .createHash('sha256')
    .update(`${userAgent}${ip}${userId}`)
    .digest('hex');
}

// Verify 2FA code
export async function POST(request: NextRequest) {
  const supabase = createRouteHandlerClient({ cookies });
  
  try {
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const { code, rememberDevice } = await request.json();
    
    if (!code) {
      return NextResponse.json({ error: 'Verification code is required' }, { status: 400 });
    }
    
    // In a real implementation, we would verify the code against one sent via email
    // For now, we'll simulate verification (replace with actual verification logic)
    const isCodeValid = await verifyCode(user.id, code);
    
    if (!isCodeValid) {
      return NextResponse.json({ error: 'Invalid verification code' }, { status: 400 });
    }
    
    // If user wants to remember this device, add it to trusted devices
    if (rememberDevice) {
      const deviceFingerprint = generateDeviceFingerprint(request, user.id);
      
      // Get current trusted devices
      const { data: profileData } = await supabase
        .from('profiles')
        .select('trusted_devices')
        .eq('id', user.id)
        .single();
      
      const trustedDevices = profileData?.trusted_devices || [];
      
      // Add new device with 30-day expiry
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + 30);
      
      trustedDevices.push({
        fingerprint: deviceFingerprint,
        name: request.headers.get('user-agent') || 'Unknown device',
        added_at: new Date().toISOString(),
        expires_at: expiryDate.toISOString()
      });
      
      // Update profile with new trusted device
      await supabase
        .from('profiles')
        .update({ trusted_devices: trustedDevices })
        .eq('id', user.id);
    }
    
    // Log successful verification
    await supabase.from('activity_logs').insert({
      user_id: user.id,
      activity_type: 'login',
      details: { 
        with_2fa: true,
        device_remembered: rememberDevice || false
      }
    });
    
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// Simulate code verification (replace with actual implementation)
async function verifyCode(userId: string, code: string): Promise<boolean> {
  // In a real implementation, you would verify against a code stored in the database
  // or sent via email/SMS. For demo purposes, we'll accept "123456" as valid.
  return code === '123456';
}
