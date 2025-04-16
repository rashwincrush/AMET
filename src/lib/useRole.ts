// src/lib/useRole.ts
import { useAuth } from './auth';

export function useRole() {
  const { userRole } = useAuth();

  return {
    isAdmin: userRole === 'admin',
    isAlumni: userRole === 'alumni',
    isEmployer: userRole === 'employer',
    isUser: userRole === 'user',
    role: userRole,
  };
}