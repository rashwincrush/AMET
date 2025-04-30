'use client';

import { ReactNode } from 'react';
import { AuthProvider } from '@/lib/AuthProvider';
import { UnifiedThemeProvider } from '@/components/ui/theme-provider';

export const Providers = ({ children }: { children: React.ReactNode }) => {
  return (
    <UnifiedThemeProvider>
      <AuthProvider>{children}</AuthProvider>
    </UnifiedThemeProvider>
  );
};