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

  // Function to set default permissions for all users in MVP demo
  const fetchUserRole = useCallback(async (userId: string) => {
    try {
      // TEMPORARILY BYPASS RBAC FOR MVP DEMO
      // Set default role and permissions for all users to enable Jobs page functionality
      setUserRole('user');
      setPermissions([
        'view_content',
        'view_jobs',
        'apply_jobs',
        'post_jobs',
        'manage_jobs',
        'view_applications'
      ]);
      
      // Debug log for MVP demo
      console.log('MVP Demo: Using default permissions for all users');
    } catch (error) {
      console.error('Error setting default permissions:', error);
      setUserRole('user');
      setPermissions(['view_content']);
    }
  }, []);

  const hasPermission = useCallback((permission: string): boolean => {
    // Super admin has all permissions
    if (userRole === 'super_admin') return true;
    
    // Check if user has the specific permission
    return permissions.includes(permission);
  }, [userRole, permissions]);

  // Function to refresh the session
  const refreshSession = useCallback(async (): Promise<boolean> => {
    try {
      const { data, error } = await supabase.auth.refreshSession();
      
      if (error) {
        console.error('Error refreshing session:', error);
        return false;
      }
      
      if (data && data.session) {
        console.log('Session refreshed successfully');
        setSession(data.session);
        setUser(data.session.user);
        setIsAuthenticated(true);
        
        if (data.session.user) {
          await fetchUserRole(data.session.user.id);
        }
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Unexpected error refreshing session:', error);
      return false;
    }
  }, [fetchUserRole]);

  // Sign in function
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
      if (data && data.session) {
        setSession(data.session);
        setUser(data.session.user);
        setIsAuthenticated(true);
        
        if (data.session.user) {
          await fetchUserRole(data.session.user.id);
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

  // Sign up function
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

  // Sign out function
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
      setPermissions([]);
      setIsAuthenticated(false);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  // Reset password function
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

  // Get session from Supabase on initial load
  useEffect(() => {
    let mounted = true;
    
    const getSession = async () => {
      try {
        setIsLoading(true);
        
        // Check if we have tokens stored
        const hasTokens = checkForTokens();
        
        // If we have tokens, try refreshing the session
        if (hasTokens) {
          const refreshed = await refreshSession();
          
          if (refreshed && mounted) {
            setIsAuthenticated(true);
            return; // Successfully refreshed session
          }
        }
        
        // If no tokens or refresh failed, get current session
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting session:', error);
          if (mounted) {
            setIsAuthenticated(false);
          }
          return;
        }
        
        if (data && data.session) {
          if (mounted) {
            setSession(data.session);
            setUser(data.session.user);
            setIsAuthenticated(true);
            
            if (data.session.user) {
              await fetchUserRole(data.session.user.id);
            }
          }
        } else {
          if (mounted) {
            setSession(null);
            setUser(null);
            setUserRole(null);
            setPermissions([]);
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
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, currentSession) => {
      console.log('Auth state changed:', event);
      
      if (!mounted) return;
      
      if (currentSession) {
        console.log('New session established');
        setSession(currentSession);
        setUser(currentSession.user);
        setIsAuthenticated(true);
        
        if (currentSession.user) {
          await fetchUserRole(currentSession.user.id);
        }
      } else if (event === 'SIGNED_OUT') {
        console.log('Session ended');
        setSession(null);
        setUser(null);
        setUserRole(null);
        setPermissions([]);
        setIsAuthenticated(false);
      }
      
      setIsLoading(false);
      setAuthInitialized(true);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [checkForTokens, refreshSession, fetchUserRole]);

  // Create the context value object
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
