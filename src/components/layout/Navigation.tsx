'use client';

import EnhancedHeader from '@/components/ui/EnhancedHeader';
import EnhancedFooter from '@/components/ui/EnhancedFooter';

export default function Navigation({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen">
      <EnhancedHeader />
      <main className="flex-1">
        {children}
      </main>
      <EnhancedFooter />
    </div>
  );
}
