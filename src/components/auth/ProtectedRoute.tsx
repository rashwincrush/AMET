// src/components/auth/ProtectedRoute.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { useAuthWithRoles } from '@/lib/useAuthWithRoles';
import { Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface ProtectedRouteProps {
  children: React.ReactNode;
  adminOnly?: boolean;
  allowSetup?: boolean;
  requiredRole?: string;
  requiredPermission?: string;
}

export default function ProtectedRoute({ 
  children, 
  adminOnly = false, 
  allowSetup = false,
  requiredRole,
  requiredPermission
}: ProtectedRouteProps) {
  const router = useRouter();
  const { user } = useAuth();
  const { hasRole, hasPermission, isAdmin: userIsAdmin } = useAuthWithRoles();
  const [isLoading, setIsLoading] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);

  useEffect(() => {
    async function checkAccess() {
      if (!user) {
        router.push('/login');
        return;
      }

      // Skip access checks if this is a setup page
      if (allowSetup) {
        setHasAccess(true);
        setIsLoading(false);
        return;
      }
      
      let accessGranted = true;
      
      // Check for admin access if required
      if (adminOnly) {
        const isUserAdmin = await hasRole('admin');
        if (!isUserAdmin) {
          accessGranted = false;
        }
      }
      
      // Check for specific role if required
      if (requiredRole && accessGranted) {
        const hasRequiredRole = await hasRole(requiredRole);
        if (!hasRequiredRole) {
          accessGranted = false;
        }
      }
      
      // Check for specific permission if required
      if (requiredPermission && accessGranted) {
        const hasRequiredPermission = await hasPermission(requiredPermission);
        if (!hasRequiredPermission) {
          accessGranted = false;
        }
      }
      
      setHasAccess(accessGranted);
      
      if (!accessGranted) {
        router.push('/unauthorized');
      }

      setIsLoading(false);
    }

    checkAccess();
  }, [user, router, adminOnly, allowSetup, requiredRole, requiredPermission, hasRole, hasPermission]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  if (!hasAccess && !isLoading) {
    return null;
  }

  return <>{children}</>;
}