'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { supabase } from './supabase';
import { Session, User, AuthError } from '@supabase/supabase-js';

interface Role {
  id: string;
  name: string;
  description: string;
  permissions: Permission[];
}

interface Permission {
  id: string;
  name: string;
  description: string;
}

interface UserRole {
  profile_id: string;
  role_id: string;
  roles: Role;
}

interface RolePermission {
  role_id: string;
  permission_id: string;
  permissions: Permission;
}

type AuthContextType = {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  signIn: (email: string, password: string) => Promise<{ error: AuthError | null; data?: any }>;
  signUp: (email: string, password: string) => Promise<{ error: AuthError | null; data?: any }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: AuthError | null }>;
  refreshSession: () => Promise<boolean>;
  userRole: string | null;
  permissions: string[];
  hasPermission: (permission: string) => boolean;
};

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [permissions, setPermissions] = useState<string[]>([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authInitialized, setAuthInitialized] = useState(false);

  // Function to check for tokens in storage
  const checkForTokens = useCallback(() => {
    try {
      // Check localStorage
      const hasLocalStorageTokens = 
        localStorage.getItem('supabase.auth.token') || 
        localStorage.getItem('sb-refresh-token') || 
        localStorage.getItem('sb-access-token');
      
      // Check cookies
      const hasCookieTokens = 
        document.cookie.includes('sb-refresh-token') || 
        document.cookie.includes('sb-access-token') ||
        document.cookie.includes('supabase.auth.token');
        
      return !!hasLocalStorageTokens || !!hasCookieTokens;
    } catch (error) {
      console.error('Error checking for tokens:', error);
      return false;
    }
  }, []);

  const hasPermission = (permission: string): boolean => {
    // Super admin has all permissions
    if (userRole === 'super_admin') return true;
    
    // Check if user has the specific permission
    return permissions.includes(permission);
  };

  // Function to refresh the session
  const refreshSession = useCallback(async (): Promise<boolean> => {
    try {
      const { data, error } = await supabase.auth.refreshSession();
      
      if (error) {
        console.error('Error refreshing session:', error);
        return false;
      }
      
      if (data.session) {
        console.log('Session refreshed successfully');
        setSession(data.session);
        setUser(data.session.user);
        setIsAuthenticated(true);
        
        if (data.session.user) {
          fetchUserRole(data.session.user.id);
        }
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Unexpected error refreshing session:', error);
      return false;
    }
  }, []);

  const fetchUserRole = async (userId: string) => {
    try {
      // Get user's role
      const { data: userRoleData } = await supabase
        .from('user_roles')
        .select('roles!inner(name, permissions)')
        .eq('profile_id', userId)
        .single();

      if (!userRoleData) {
        setUserRole('user');
        setPermissions(['view_content']);
        return;
      }

      // Handle different possible response structures
      let roleName = 'user';
      let permissions: string[] = ['view_content'];
      
      // Log the response for debugging
      console.log('User role data:', JSON.stringify(userRoleData, null, 2));
      
      try {
        // Define a type guard for role objects
        const isRoleObject = (obj: any): obj is { name: string; permissions: any } => {
          return obj && typeof obj === 'object' && 'name' in obj;
        };
        
        // Check if roles is an array or an object
        if (Array.isArray(userRoleData.roles)) {
          // If it's an array, take the first role
          if (userRoleData.roles.length > 0) {
            const role = userRoleData.roles[0] as any;
            roleName = (role && typeof role === 'object' && 'name' in role) ? String(role.name) : 'user';
            
            // Handle permissions based on format
            if (role && typeof role === 'object' && 'permissions' in role && role.permissions) {
              if (Array.isArray(role.permissions)) {
                permissions = role.permissions.map((p: any) => 
                  p && typeof p === 'object' && 'name' in p ? String(p.name) : String(p)
                );
              } else if (typeof role.permissions === 'object') {
                permissions = Object.entries(role.permissions as Record<string, any>)
                  .filter(([_, enabled]) => enabled)
                  .map(([permName]) => permName);
              }
            }
          }
        } else if (userRoleData.roles && typeof userRoleData.roles === 'object') {
          // If it's an object
          const rolesObj = userRoleData.roles as any;
          roleName = 'name' in rolesObj ? String(rolesObj.name) : 'user';
          
          // Handle permissions based on format
          const rolePermissions = 'permissions' in rolesObj ? rolesObj.permissions : null;
          if (rolePermissions) {
            if (Array.isArray(rolePermissions)) {
              permissions = rolePermissions.map((p: any) => 
                p && typeof p === 'object' && 'name' in p ? String(p.name) : String(p)
              );
            } else if (typeof rolePermissions === 'object') {
              permissions = Object.entries(rolePermissions as Record<string, any>)
                .filter(([_, enabled]) => enabled)
                .map(([permName]) => permName);
            }
          }
        }
      } catch (parseError) {
        console.error('Error parsing role data:', parseError);
      }
      
      // Get highest priority role
      const rolePriority = ['super_admin', 'administrator', 'admin', 'alumni', 'employer', 'user'];
      setUserRole(roleName);

      setPermissions(permissions);
    } catch (error) {
      console.error('Error fetching user roles:', error);
      setUserRole('user');
      setPermissions(['view_content']);
    }
  };

  // Initialize auth state
  useEffect(() => {
    let mounted = true;
    
    // Get session from Supabase
    const getSession = async () => {
      try {
        setIsLoading(true);
        
        // First check if we have tokens in storage
        const hasTokens = checkForTokens();
        if (hasTokens) {
          console.log('Found stored tokens, attempting to refresh session');
          const refreshed = await refreshSession();
          if (refreshed && mounted) {
            return; // Successfully refreshed, no need to continue
          }
        }

        // If no tokens or refresh failed, try to get session directly
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting session:', error);
          if (mounted) {
            setIsAuthenticated(false);
          }
          return;
        }
        
        if (data.session) {
          console.log('Session found, user is authenticated');
          if (mounted) {
            setSession(data.session);
            setUser(data.session.user);
            setIsAuthenticated(true);
            
            if (data.session.user) {
              fetchUserRole(data.session.user.id);
            }
          }
        } else {
          console.log('No active session found');
          if (mounted) {
            setSession(null);
            setUser(null);
            setUserRole(null);
            setIsAuthenticated(false);
          }
        }
      } catch (error) {
        console.error('Unexpected error getting session:', error);
        if (mounted) {
          setIsAuthenticated(false);
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
          setAuthInitialized(true);
        }
      }
    };

    getSession();

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, currentSession) => {
      console.log('Auth state changed:', event);
      
      if (!mounted) return;
      
      if (currentSession) {
        console.log('New session established');
        setSession(currentSession);
        setUser(currentSession.user);
        setIsAuthenticated(true);
        
        if (currentSession.user) {
          fetchUserRole(currentSession.user.id);
        }
      } else if (event === 'SIGNED_OUT') {
        console.log('Session ended');
        setSession(null);
        setUser(null);
        setUserRole(null);
        setIsAuthenticated(false);
      }
      
      setIsLoading(false);
      setAuthInitialized(true);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [checkForTokens, refreshSession]);

  const signIn = async (email: string, password: string) => {
    console.log('Attempting to sign in');
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ 
        email, 
        password
      });
      
      if (error) {
        console.error(`Authentication error: ${error.name}`);
        return { error };
      }
      
      // Update authentication state
      if (data.session) {
        setSession(data.session);
        setUser(data.session.user);
        setIsAuthenticated(true);
        
        if (data.session.user) {
          fetchUserRole(data.session.user.id);
        }
      }
      
      return { data, error: null };
    } catch (err) {
      console.error('Unexpected error during authentication', err);
      return { 
        error: new AuthError('Unexpected error during authentication') 
      };
    }
  };

  const signUp = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({ 
        email, 
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`
        }
      });
      
      return { data, error };
    } catch (err) {
      console.error('Unexpected error during sign up', err);
      return { 
        error: new AuthError('Unexpected error during sign up') 
      };
    }
  };

  const signOut = async () => {
    try {
      // Clear any stored session data
      localStorage.removeItem('supabase.auth.token');
      document.cookie = 'sb-refresh-token=; path=/; max-age=0; SameSite=Lax';
      document.cookie = 'sb-access-token=; path=/; max-age=0; SameSite=Lax';
      document.cookie = 'supabase.auth.token=; path=/; max-age=0; SameSite=Lax';
      
      // Sign out from Supabase
      await supabase.auth.signOut();
      
      // Clear state
      setUser(null);
      setSession(null);
      setUserRole(null);
      setIsAuthenticated(false);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const resetPassword = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });
      return { error };
    } catch (err) {
      console.error('Unexpected error during password reset', err);
      return { 
        error: new AuthError('Unexpected error during password reset') 
      };
    }
  };

  const value = {
    user,
    session,
    isLoading,
    isAuthenticated,
    signIn,
    signUp,
    signOut,
    resetPassword,
    refreshSession,
    userRole,
    permissions,
    hasPermission,
  };

  return <AuthContext.Provider value={value}>{!isLoading && authInitialized && children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);