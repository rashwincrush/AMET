'use client';

import { useEffect } from 'react';

// Removing direct import of role assignment to prevent blocking errors
// import { ensureDefaultRolesExist } from './roles/roleAssignment';

export function useAppInitialization() {
  useEffect(() => {
    const initializeApp = async () => {
      try {
        console.log('App initialization starting');
        
        // Skip role initialization completely for now
        // Will be re-enabled once Supabase connectivity is fixed
        
        console.log('App initialization completed successfully');
      } catch (error) {
        console.warn('App initialization error, but continuing:', error);
      }
    };

    initializeApp();
  }, []);
}