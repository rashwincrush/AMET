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

export type AuthContextType = {
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

  // Throttling to prevent repeated auth API calls
  const [lastAuthCheck, setLastAuthCheck] = useState<number>(0);
  const AUTH_CHECK_INTERVAL = 30000; // 30 seconds minimum between auth checks
  
  // Get session from Supabase on initial load
  useEffect(() => {
    let mounted = true;
    let authCheckAttempted = false;
    
    const getSession = async () => {
      try {
        // Only proceed if this is the first auth check or if sufficient time has passed since last check
        const now = Date.now();
        if (authCheckAttempted && now - lastAuthCheck < AUTH_CHECK_INTERVAL) {
          console.log('[Auth] Skipping redundant auth check - too frequent');
          return;
        }
        
        authCheckAttempted = true;
        setLastAuthCheck(now);
        setIsLoading(true);
        console.log('[Auth] Performing auth check...');
        
        // Check browser storage for rate limit markers
        const rateLimitKey = 'supabase_rate_limit_until';
        const rateLimitUntil = localStorage.getItem(rateLimitKey);
        if (rateLimitUntil && parseInt(rateLimitUntil, 10) > Date.now()) {
          console.warn('[Auth] Suppressing auth check due to previous rate limit', 
            new Date(parseInt(rateLimitUntil, 10)));
          if (mounted) {
            setIsLoading(false);
            setAuthInitialized(true);  
          }
          return;
        }
        
        // Check if we have tokens stored
        const hasTokens = checkForTokens();
        
        // If we have tokens, try refreshing the session
        if (hasTokens) {
          try {
            const refreshed = await refreshSession();
            
            if (refreshed && mounted) {
              setIsAuthenticated(true);
              setIsLoading(false);
              setAuthInitialized(true);
              return; // Successfully refreshed session
            }
          } catch (refreshError: any) {
            console.error('[Auth] Session refresh error:', refreshError);
            // If we hit rate limits during refresh, pause auth checks
            if (refreshError.status === 429) {
              console.warn('[Auth] Rate limit hit during refresh, pausing auth checks for 5 minutes');
              localStorage.setItem(rateLimitKey, (Date.now() + 5 * 60 * 1000).toString());
              if (mounted) {
                setIsLoading(false);
                setAuthInitialized(true);  
              }
              return;
            }
          }
        }
        
        // If no tokens or refresh failed, get current session
        try {
          const { data, error } = await supabase.auth.getSession();
          
          if (error) {
            console.error('[Auth] Error getting session:', error);
            // If we hit rate limits, pause auth checks
            if (error.status === 429) {
              console.warn('[Auth] Rate limit hit during getSession, pausing auth checks for 5 minutes');
              localStorage.setItem(rateLimitKey, (Date.now() + 5 * 60 * 1000).toString());
            }
            
            if (mounted) {
              setIsAuthenticated(false);
              setIsLoading(false);
              setAuthInitialized(true);
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
              
              setIsLoading(false);
              setAuthInitialized(true);
            }
          } else {
            if (mounted) {
              setSession(null);
              setUser(null);
              setUserRole(null);
              setPermissions([]);
              setIsAuthenticated(false);
              setIsLoading(false);
              setAuthInitialized(true);
            }
          }
        } catch (getSessionError: any) {
          console.error('[Auth] Unexpected error getting session:', getSessionError);
          // Handle rate limits here too
          if (getSessionError.status === 429) {
            console.warn('[Auth] Rate limit hit during getSession catch, pausing auth checks for 5 minutes');
            localStorage.setItem(rateLimitKey, (Date.now() + 5 * 60 * 1000).toString());
          }
          
          if (mounted) {
            setIsAuthenticated(false);
            setIsLoading(false);
            setAuthInitialized(true);
          }
        }
      } catch (error) {
        console.error('[Auth] Critical error in getSession function:', error);
        if (mounted) {
          setIsAuthenticated(false);
          setIsLoading(false);
          setAuthInitialized(true);
        }
      }
    };

    getSession();

    // Set up auth state listener with debounce to prevent rapid-fire events
    let lastAuthEventTime = 0;
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, currentSession) => {
      console.log('[Auth] Auth state changed:', event);
      
      if (!mounted) return;
      
      // Prevent multiple rapid event handling
      const now = Date.now();
      if (now - lastAuthEventTime < AUTH_CHECK_INTERVAL) {
        console.log('[Auth] Debouncing auth event - too frequent');
        return;
      }
      
      lastAuthEventTime = now;
      
      if (currentSession) {
        console.log('[Auth] New session established');
        setSession(currentSession);
        setUser(currentSession.user);
        setIsAuthenticated(true);
        
        if (currentSession.user) {
          await fetchUserRole(currentSession.user.id);
        }
      } else if (event === 'SIGNED_OUT') {
        console.log('[Auth] Session ended');
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
