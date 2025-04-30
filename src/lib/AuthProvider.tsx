'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { supabase } from './supabase';
import { Session, User, AuthError } from '@supabase/supabase-js';

// Define the types for the auth context
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

// Create the context
const AuthContext = createContext<AuthContextType>({} as AuthContextType);

// Export the auth provider component
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
      if (typeof window === 'undefined') return false;
      
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
          // Handle user role
          setUserRole('user'); // Default to user role
        }
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Unexpected error refreshing session:', error);
      return false;
    }
  }, []);

  // Get the user session on component mount
  useEffect(() => {
    let mounted = true;
    
    const getSession = async () => {
      try {
        if (!mounted) return;
        
        setIsLoading(true);
        
        // First, check for any stored tokens
        const hasTokens = checkForTokens();
        
        if (hasTokens) {
          // Try to refresh the session if tokens exist
          const refreshed = await refreshSession();
          
          if (refreshed) {
            if (mounted) {
              setIsLoading(false);
              setAuthInitialized(true);
            }
            return;
          }
        }
        
        // If no tokens or refresh failed, check current session
        const { data } = await supabase.auth.getSession();
        
        if (data.session) {
          if (mounted) {
            setSession(data.session);
            setUser(data.session.user);
            setIsAuthenticated(true);
            
            if (data.session.user) {
              // Set default user role
              setUserRole('user');
              setPermissions(['view_content']);
            }
          }
        } else {
          if (mounted) {
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
          // Set default user role
          setUserRole('user');
          setPermissions(['view_content']);
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
          // Set default user role
          setUserRole('user');
          setPermissions(['view_content']);
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
      if (typeof window !== 'undefined') {
        // Clear any stored session data
        localStorage.removeItem('supabase.auth.token');
        document.cookie = 'sb-refresh-token=; path=/; max-age=0; SameSite=Lax';
        document.cookie = 'sb-access-token=; path=/; max-age=0; SameSite=Lax';
        document.cookie = 'supabase.auth.token=; path=/; max-age=0; SameSite=Lax';
      }
      
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

// Export the auth hook
export const useAuth = () => useContext(AuthContext);
