import { supabase } from '@/lib/supabase';
import { Role, UserRole } from '@/types/database';

export const roleService = {
  // Get all roles
  async getAllRoles() {
    const { data, error } = await supabase
      .from('roles')
      .select('*')
      .order('name', { ascending: true });
    
    if (error) throw error;
    return data as Role[];
  },
  
  // Get user roles
  async getUserRoles(profileId: string) {
    const { data, error } = await supabase
      .from('user_roles')
      .select(`
        *,
        roles:role_id (id, name, description)
      `)
      .eq('profile_id', profileId);
    
    if (error) throw error;
    return data;
  },
  
  // Check if user has role
  async hasRole(profileId: string, roleName: string) {
    const { data, error } = await supabase
      .from('user_roles')
      .select(`
        *,
        roles!inner(name)
      `)
      .eq('profile_id', profileId)
      .eq('roles.name', roleName)
      .maybeSingle();
    
    if (error) throw error;
    return !!data;
  },
  
  // Assign role to user
  async assignRole(profileId: string, roleId: string, assignedBy?: string) {
    const { data, error } = await supabase
      .from('user_roles')
      .insert([
        {
          profile_id: profileId,
          role_id: roleId,
          assigned_by: assignedBy
        }
      ])
      .select()
      .single();
    
    if (error) throw error;
    return data as UserRole;
  },
  
  // Remove role from user
  async removeRole(profileId: string, roleId: string) {
    const { error } = await supabase
      .from('user_roles')
      .delete()
      .eq('profile_id', profileId)
      .eq('role_id', roleId);
    
    if (error) throw error;
    return true;
  }
}; 