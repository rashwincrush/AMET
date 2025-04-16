import { supabase } from '../supabase';

/**
 * Assigns the admin role to a specific user
 * @param userId - The UUID of the user to assign admin role to
 * @returns Object containing success status and message
 */
export async function assignAdminRole(userId: string) {
  try {
    // First, check if the user exists
    const { data: userExists, error: userError } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', userId)
      .single();
    
    if (userError || !userExists) {
      return { 
        success: false, 
        message: `User with ID ${userId} not found` 
      };
    }

    // Get the admin role ID
    const { data: adminRole, error: roleError } = await supabase
      .from('roles')
      .select('id')
      .eq('name', 'admin')
      .single();
    
    if (roleError || !adminRole) {
      return { 
        success: false, 
        message: 'Admin role not found in the database' 
      };
    }

    // Check if the user already has the admin role
    const { data: existingRole, error: existingRoleError } = await supabase
      .from('user_roles')
      .select('id')
      .eq('profile_id', userId)
      .eq('role_id', adminRole.id)
      .single();
    
    if (existingRole) {
      return { 
        success: true, 
        message: `User ${userId} already has admin role` 
      };
    }

    // Assign the admin role to the user
    const { error: assignError } = await supabase
      .from('user_roles')
      .insert({
        profile_id: userId,
        role_id: adminRole.id
      });
    
    if (assignError) {
      return { 
        success: false, 
        message: `Error assigning admin role: ${assignError.message}` 
      };
    }

    return { 
      success: true, 
      message: `Admin role successfully assigned to user ${userId}` 
    };
  } catch (error) {
    console.error('Error in assignAdminRole:', error);
    return { 
      success: false, 
      message: `Unexpected error: ${error instanceof Error ? error.message : String(error)}` 
    };
  }
}