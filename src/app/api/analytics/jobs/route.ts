import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { fetchJobMetrics } from '@/lib/services/analyticsService';

export async function GET() {
  try {
    // Verify admin access
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Check if user is admin
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', session.user.id)
      .single();
    
    if (profileError || !profile || !profile.is_admin) {
      return NextResponse.json(
        { error: 'Forbidden: Admin access required' },
        { status: 403 }
      );
    }
    
    // Fetch job metrics
    const metrics = await fetchJobMetrics();
    
    if (!metrics) {
      return NextResponse.json(
        { error: 'Failed to fetch job metrics' },
        { status: 500 }
      );
    }
    
    return NextResponse.json(metrics);
  } catch (error) {
    console.error('Error in job analytics API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
