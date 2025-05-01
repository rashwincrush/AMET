import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
  try {
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
    
    // Parse the request body
    const { userId, phone } = await request.json();
    
    if (!userId || !phone) {
      return NextResponse.json(
        { error: 'User ID and phone number are required' },
        { status: 400 }
      );
    }
    
    // First update the user's profile with the phone number
    const { error: profileError } = await supabase
      .from('profiles')
      .update({ phone: phone })
      .eq('id', userId);
      
    if (profileError) {
      console.error('Error updating profile phone:', profileError);
      // Continue to try other methods
    }
    
    // Then try to update the auth user metadata
    const { error: userError } = await supabase.auth.admin.updateUserById(
      userId,
      { phone: phone }
    );
    
    if (userError) {
      console.error('Error updating user auth phone:', userError);
      
      // Fallback to regular user update
      const { error: fallbackError } = await supabase.auth.updateUser({
        phone: phone
      });
      
      if (fallbackError) {
        return NextResponse.json(
          { success: false, error: fallbackError.message },
          { status: 500 }
        );
      }
    }
    
    // Additional safety: also update the user data metadata
    const { error: metadataError } = await supabase.auth.updateUser({
      data: { phone_number: phone }
    });
    
    if (metadataError) {
      console.error('Error updating user metadata:', metadataError);
      // Non-blocking error, proceed anyway
    }
    
    return NextResponse.json(
      { success: true, message: 'Phone number updated in all locations' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error in phone update route:', error);
    return NextResponse.json(
      { success: false, error: 'Server error updating phone number' },
      { status: 500 }
    );
  }
}
