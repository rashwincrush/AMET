'use client';

import { ReactNode } from 'react';
import { AuthProvider } from '@/lib/auth';
import { UnifiedThemeProvider } from '@/components/ui/UnifiedThemeProvider';

export const Providers = ({ children }: { children: React.ReactNode }) => {
  return (
    <UnifiedThemeProvider>
      <AuthProvider>{children}</AuthProvider>
    </UnifiedThemeProvider>
  );
};