import { useEffect, useState, useCallback } from 'react';
import { useAuth } from './auth';
import { getUserRoles, checkPermission, hasRole, getUserPermissions } from './roles';

export function useAuthWithRoles() {
  const { user } = useAuth();
  const [roles, setRoles] = useState<string[]>([]);
  const [permissions, setPermissions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (!user) {
      setRoles([]);
      setPermissions([]);
      setIsAdmin(false);
      setIsLoading(false);
      return;
    }

    const loadUserRoles = async () => {
      try {
        const userRoles = await getUserRoles(user.id);
        const allPermissions = userRoles.reduce((acc: string[], role: any) => {
          return [...acc, ...Object.keys(role.permissions).filter(key => role.permissions[key])];
        }, []);

        const roleNames = userRoles.map((role: any) => role.name);
        setRoles(roleNames);
        setPermissions(allPermissions);
        setIsAdmin(roleNames.includes('admin'));
      } catch (error) {
        console.error('Error loading user roles:', error);
        setRoles([]);
        setPermissions([]);
        setIsAdmin(false);
      } finally {
        setIsLoading(false);
      }
    };

    loadUserRoles();
  }, [user?.id]);

  const hasPermission = useCallback(async (permission: string): Promise<boolean> => {
    if (!user) return false;
    if (permissions.includes(permission)) return true;
    return checkPermission(user.id, permission);
  }, [user, permissions]);
  
  const checkHasRole = useCallback(async (roleName: string): Promise<boolean> => {
    if (!user) return false;
    if (roles.includes(roleName)) return true;
    return hasRole(user.id, roleName);
  }, [user, roles]);
  
  const refreshRoles = useCallback(async (): Promise<void> => {
    if (!user) return;
    setIsLoading(true);
    try {
      const userRoles = await getUserRoles(user.id);
      const allPermissions = await getUserPermissions(user.id);
      
      const roleNames = userRoles.map((role: any) => role.name);
      setRoles(roleNames);
      setPermissions(allPermissions);
      setIsAdmin(roleNames.includes('admin'));
    } catch (error) {
      console.error('Error refreshing user roles:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  return {
    user,
    roles,
    permissions,
    hasPermission,
    hasRole: checkHasRole,
    isAdmin,
    isLoading,
    refreshRoles
  };
}
