import { supabase } from './supabase';

export async function setupAdminRole(email: string) {
  try {
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

    console.log('Admin role successfully assigned to:', email);
    return true;
  } catch (error) {
    console.error('Error setting up admin role:', error);
    throw error;
  }
}
