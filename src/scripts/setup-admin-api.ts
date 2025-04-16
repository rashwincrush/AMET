import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

/**
 * Setup admin role for a user by email
 * @param email - Email of the user to assign admin role to
 * @returns Success or error message
 */
async function setupAdminRole(email: string) {
  try {
    if (!email) {
      throw new Error('Email is required');
    }

    // First, get the user's profile ID
    const { data: profiles, error: profileError } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', email)
      .single();

    if (profileError) throw profileError;
    if (!profiles) throw new Error('Profile not found');

    // Check if admin role exists
    const { data: adminRole, error: roleError } = await supabase
      .from('roles')
      .select('id')
      .eq('name', 'admin')
      .single();

    if (roleError && roleError.code !== 'PGRST116') {
      throw roleError;
    }

    let adminRoleId;
    if (!adminRole) {
      // Create admin role if it doesn't exist
      const { data: newRole, error: createError } = await supabase
        .from('roles')
        .insert({
          name: 'admin',
          description: 'System administrator with full access',
          permissions: {
            manage_users: true,
            manage_roles: true,
            manage_events: true,
            manage_jobs: true,
            manage_content: true,
            manage_settings: true
          }
        })
        .select()
        .single();

      if (createError) throw createError;
      adminRoleId = newRole.id;
    } else {
      adminRoleId = adminRole.id;
    }

    // Assign admin role to the user
    const { error: assignError } = await supabase
      .from('user_roles')
      .insert({
        profile_id: profiles.id,
        role_id: adminRoleId,
        assigned_by: profiles.id // Self-assignment
      });

    if (assignError) throw assignError;

    return { success: true, message: 'Admin role assigned successfully' };
  } catch (error) {
    console.error('Error setting up admin role:', error);
    throw error;
  }
}

export async function POST(request: Request) {
  try {
    const { email } = await request.json();
    
    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

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

export { setupAdminRole };
