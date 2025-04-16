import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { email } = await request.json();
    
    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    // Import the setup function here to avoid circular dependencies
    const { setupAdminRole } = await import('@/scripts/setup-admin-api');
    const result = await setupAdminRole(email);
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error setting up admin role:', error);
    return NextResponse.json(
      { error: 'Failed to setup admin role' },
      { status: 500 }
    );
  }
}
