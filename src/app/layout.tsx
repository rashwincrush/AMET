import { Metadata } from 'next';
import './globals.css';
import { Providers } from './providers';
import { AuthProvider } from '@/lib/AuthContext';
import NavigationTracker from '@/components/navigation/NavigationTracker';
import { Toaster } from '@/components/ui/toaster';
import { SessionLayout } from '@/components/layout/SessionLayout';
import { AppInitializer } from '@/components/AppInitializer';

export const metadata: Metadata = {
  title: 'AMET Alumni Management',
  description: 'A comprehensive platform for managing AMET alumni networks, events, job opportunities, and mentorship programs.',
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode; }>) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <AppInitializer />
          <Providers>
            <NavigationTracker />
            <SessionLayout>
              {children}
            </SessionLayout>
            <Toaster />
          </Providers>
        </AuthProvider>
      </body>
    </html>
  );
}