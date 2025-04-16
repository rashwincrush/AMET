'use client';

import { useEffect } from 'react';
import { ensureDefaultRolesExist } from './roles/roleAssignment';

export function useAppInitialization() {
  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Ensure default roles exist
        await ensureDefaultRolesExist();
        console.log('App initialization completed successfully');
      } catch (error) {
        console.error('Error during app initialization:', error);
      }
    };

    initializeApp();
  }, []);
} 