import { supabase } from '@/lib/supabase';
import { PostgrestResponse } from '@supabase/supabase-js';

// Type definitions for Supabase responses
type RoleRecord = {
  id: string;
  name: string;
  description: string;
  permissions: Record<string, boolean>;
};

type UserRoleRecord = {
  id: string;
  profile_id: string;
  role_id: string;
  roles: { name: string };
};

/**
 * Ensures that the default roles exist in the database
 * Returns silently if there are network errors to prevent blocking the app
 */
export async function ensureDefaultRolesExist() {
  try {
    // Create a wrapper for Supabase calls that handles network errors gracefully
    const safeQuery = async <T>(queryFn: () => Promise<PostgrestResponse<T>>) => {
      try {
        return await Promise.race([
          queryFn(),
          new Promise<PostgrestResponse<T>>((_, reject) => 
            setTimeout(() => reject(new Error('Timeout')), 3000)
          )
        ]);
      } catch (err) {
        console.warn('Supabase query failed:', err);
        return { data: null, error: err } as PostgrestResponse<T>;
      }
    };
    
    // Check for connectivity
    const healthCheck = await safeQuery(() => 
      supabase.from('roles').select('count').limit(1)
    );
    
    if (healthCheck.error) {
      console.warn('Supabase connectivity issues detected, skipping role initialization');
      return false;
    }
    
    // Check if roles already exist
    const result = await supabase
      .from('roles')
      .select('name');
    
    const existingRoles = result.data;
    const checkError = result.error;
    
    if (checkError) {
      console.warn('Error checking existing roles:', checkError);
      return false; // Return silently instead of throwing
    }
    
    if (!existingRoles) {
      console.warn('No roles data returned from Supabase');
      return false;
    }

    const existingRoleNames = existingRoles.map((role: any) => role.name);
    
    // Define default roles
    const defaultRoles = [
      {
        name: 'admin',
        description: 'Administrator with full system access',
        permissions: { 
          admin: true, 
          manage_users: true, 
          manage_content: true 
        }
      },
      {
        name: 'alumni',
        description: 'Verified alumni with additional access',
        permissions: { 
          view_content: true, 
          alumni_features: true 
        }
      },
      {
        name: 'user',
        description: 'Regular user with basic access',
        permissions: { 
          view_content: true 
        }
      }
    ];
    
    // Insert any missing roles
    for (const role of defaultRoles) {
      if (!existingRoleNames.includes(role.name)) {
        const { error: insertError } = await supabase
          .from('roles')
          .insert(role);
        
        if (insertError) {
          console.error(`Error creating ${role.name} role:`, insertError);
        } else {
          console.log(`Created ${role.name} role successfully`);
        }
      }
    }
    
    return true;
  } catch (error) {
    console.error('Error ensuring default roles exist:', error);
    return false;
  }
}

export async function assignDefaultRole(userId: string) {
  try {
    // Get the alumni role ID first
    const { data: alumniRole, error: roleError } = await supabase
      .from('roles')
      .select('id')
      .eq('name', 'alumni')
      .single();
    
    if (roleError) {
      console.error('Error getting alumni role:', roleError);
      throw roleError;
    }

    if (!alumniRole) {
      console.error('Alumni role not found in database');
      throw new Error('Alumni role not found in database');
    }

    // Assign alumni role to the user
    const { error: assignError } = await supabase
      .from('user_roles')
      .insert([
        {
          profile_id: userId,
          role_id: alumniRole.id
        }
      ]);

    if (assignError) {
      console.error('Error assigning default role:', assignError);
      throw assignError;
    }
  } catch (error) {
    console.error('Failed to assign default role:', error);
    throw error;
  }
}

export async function assignAdminRole(userId: string) {
  try {
    // Get the admin role ID first
    const { data: adminRole, error: roleError } = await supabase
      .from('roles')
      .select('id')
      .eq('name', 'admin')
      .single();
    
    if (roleError) {
      console.error('Error getting admin role:', roleError);
      throw roleError;
    }

    if (!adminRole) {
      console.error('Admin role not found in database');
      throw new Error('Admin role not found in database');
    }

    // Assign admin role to the user
    const { error: assignError } = await supabase
      .from('user_roles')
      .insert([
        {
          profile_id: userId,
          role_id: adminRole.id
        }
      ]);

    if (assignError) {
      console.error('Error assigning admin role:', assignError);
      throw assignError;
    }
  } catch (error) {
    console.error('Failed to assign admin role:', error);
    throw error;
  }
}

export async function checkUserRole(userId: string): Promise<string[]> {
  try {
    const result = await supabase
      .from('user_roles')
      .select('roles(name)')
      .eq('profile_id', userId);
      
    const data = result.data;
    const error = result.error;

    if (error) {
      console.error('Error checking user role:', error);
      return [];
    }

    if (!data || data.length === 0) {
      return [];
    }

    // Extract role names from the result
    const roleNames = data.map((item: any) => item.roles.name);
    return roleNames;
  } catch (error) {
    console.error('Failed to check user role:', error);
    return [];
  }
}
