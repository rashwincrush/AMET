import { supabase } from './supabase';

export interface Role {
  id: string;
  name: string;
  description: string;
  permissions: Record<string, boolean>;
  created_at: string;
  updated_at: string;
}

export interface UserRole {
  id: string;
  profile_id: string;
  role_id: string;
  assigned_by: string;
  created_at: string;
  updated_at: string;
}

export const ROLES = {
  SUPER_ADMIN: 'super_admin',
  ADMIN: 'admin',
  MODERATOR: 'moderator',
  EVENT_MANAGER: 'event_manager',
  MENTOR: 'mentor',
  ALUMNI: 'alumni',
  STUDENT: 'student'
} as const;

// Role hierarchy from highest to lowest
export const ROLE_HIERARCHY = [
  ROLES.SUPER_ADMIN,
  ROLES.ADMIN,
  ROLES.MODERATOR,
  ROLES.EVENT_MANAGER,
  ROLES.MENTOR,
  ROLES.ALUMNI,
  ROLES.STUDENT
];

export const AVAILABLE_PERMISSIONS = {
  manage_users: 'Manage Users',
  manage_roles: 'Manage Roles',
  manage_events: 'Manage Events',
  manage_jobs: 'Manage Jobs',
  manage_content: 'Manage Content',
  manage_settings: 'Manage Settings',
  view_network: 'View Network',
  create_profile: 'Create Profile',
  view_jobs: 'View Jobs',
  view_events: 'View Events',
  mentor_users: 'Mentor Users',
  create_events: 'Create Events',
  edit_events: 'Edit Events',
  manage_event_registrations: 'Manage Event Registrations',
  create_mentorship: 'Create Mentorship',
  manage_mentorship: 'Manage Mentorship',
  update_profile: 'Update Profile'
};

export const ROLE_PERMISSIONS = {
  [ROLES.SUPER_ADMIN]: {
    manage_users: true,
    manage_roles: true,
    manage_events: true,
    manage_jobs: true,
    manage_content: true,
    manage_settings: true,
    view_network: true,
    create_profile: true,
    view_jobs: true,
    view_events: true,
    mentor_users: true,
    create_events: true,
    edit_events: true,
    manage_event_registrations: true,
    create_mentorship: true,
    manage_mentorship: true,
    update_profile: true
  },
  [ROLES.ADMIN]: {
    manage_users: true,
    manage_roles: true,
    manage_events: true,
    manage_jobs: true,
    manage_content: true,
    manage_settings: true
  },
  [ROLES.MODERATOR]: {
    manage_content: true,
    manage_events: true,
    manage_jobs: true
  },
  [ROLES.EVENT_MANAGER]: {
    create_events: true,
    edit_events: true,
    manage_event_registrations: true
  },
  [ROLES.MENTOR]: {
    create_mentorship: true,
    manage_mentorship: true
  },
  [ROLES.ALUMNI]: {
    create_profile: true,
    update_profile: true,
    view_network: true
  },
  [ROLES.STUDENT]: {
    create_profile: true,
    view_jobs: true,
    view_events: true
  }
} as const;

export async function getUserRoles(profileId: string) {
  const { data: userRoles } = await supabase
    .from('user_roles')
    .select('role_id, roles(name, permissions)')
    .eq('profile_id', profileId);

  return userRoles?.map((ur: any) => ({
    id: ur.role_id,
    name: ur.roles.name,
    permissions: ur.roles.permissions
  })) || [];
}

export async function checkPermission(profileId: string, permission: string) {
  const roles = await getUserRoles(profileId);
  return roles.some((role: any) => 
    role.permissions[permission] === true
  );
}

/**
 * Check if a user has a specific role
 */
export async function hasRole(userId: string, roleName: string): Promise<boolean> {
  const { data, error } = await supabase
    .from('user_roles')
    .select('roles!inner(name)')
    .eq('profile_id', userId)
    .eq('roles.name', roleName);

  if (error) {
    console.error('Error checking user role:', error);
    return false;
  }

  return data.length > 0;
}

/**
 * Get all permissions for a user (combined from all roles)
 */
export async function getUserPermissions(userId: string): Promise<string[]> {
  const roles = await getUserRoles(userId);
  
  // Combine all permissions from all roles
  const permissions = new Set<string>();
  
  roles.forEach((role: any) => {
    Object.entries(role.permissions).forEach(([permission, enabled]) => {
      if (enabled) {
        permissions.add(permission);
      }
    });
  });
  
  return Array.from(permissions);
}

/**
 * Get all available roles
 */
export async function getAllRoles(): Promise<Role[]> {
  const { data, error } = await supabase
    .from('roles')
    .select('*')
    .order('name');

  if (error) {
    console.error('Error fetching roles:', error);
    return [];
  }

  return data as Role[];
}

/**
 * Get a specific role by ID
 */
export async function getRoleById(roleId: string): Promise<Role | null> {
  const { data, error } = await supabase
    .from('roles')
    .select('*')
    .eq('id', roleId)
    .single();

  if (error) {
    console.error('Error fetching role:', error);
    return null;
  }

  return data as Role;
}

/**
 * Create a new role
 */
export async function createRole(
  name: string,
  description: string,
  permissions: Record<string, boolean>
): Promise<Role | null> {
  const { data, error } = await supabase
    .from('roles')
    .insert({
      name,
      description,
      permissions
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating role:', error);
    return null;
  }

  return data as Role;
}

/**
 * Update an existing role
 */
export async function updateRole(
  roleId: string,
  updates: Partial<Omit<Role, 'id' | 'created_at' | 'updated_at'>>
): Promise<boolean> {
  const { error } = await supabase
    .from('roles')
    .update(updates)
    .eq('id', roleId);

  if (error) {
    console.error('Error updating role:', error);
    return false;
  }

  return true;
}

/**
 * Delete a role
 */
export async function deleteRole(roleId: string): Promise<boolean> {
  const { error } = await supabase
    .from('roles')
    .delete()
    .eq('id', roleId);

  if (error) {
    console.error('Error deleting role:', error);
    return false;
  }

  return true;
}

/**
 * Get all users with a specific role
 */
export async function getUsersWithRole(roleName: string): Promise<string[]> {
  const { data, error } = await supabase
    .from('user_roles')
    .select('profile_id, roles!inner(name)')
    .eq('roles.name', roleName);

  if (error) {
    console.error('Error fetching users with role:', error);
    return [];
  }

  return data.map((item: any) => item.profile_id);
}

export async function assignRole(profileId: string, roleId: string, assignedBy: string) {
  const { error } = await supabase
    .from('user_roles')
    .insert({
      profile_id: profileId,
      role_id: roleId,
      assigned_by: assignedBy
    });

  if (error) throw error;
}

export async function removeRole(profileId: string, roleId: string) {
  const { error } = await supabase
    .from('user_roles')
    .delete()
    .eq('profile_id', profileId)
    .eq('role_id', roleId);

  if (error) throw error;
}

export async function initializeRoles() {
  // Create default roles if they don't exist
  const defaultRoles = Object.entries(ROLE_PERMISSIONS).map(([name, permissions]) => ({
    name,
    permissions,
    description: `Default ${name} role`
  }));

  for (const role of defaultRoles) {
    const { data: existingRole } = await supabase
      .from('roles')
      .select('id')
      .eq('name', role.name)
      .single();

    if (!existingRole) {
      await supabase
        .from('roles')
        .insert({
          name: role.name,
          description: role.description,
          permissions: role.permissions
        });
    }
  }
}

/**
 * Check if a user has a specific permission
 */
export async function hasPermission(userId: string, permission: string): Promise<boolean> {
  const permissions = await getUserPermissions(userId);
  return permissions.includes(permission);
}
