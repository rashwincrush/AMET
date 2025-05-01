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
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png' },
    ],
    other: [
      {
        rel: 'manifest',
        url: '/site.webmanifest',
      },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode; }>) {
  return (
    <html lang="en">
      <body>
        {/* Add a debugging element that will be unmistakable */}
        <div style={{ background: 'red', color: 'white', padding: '10px', textAlign: 'center', fontWeight: 'bold', fontSize: '16px' }}>
          UPDATED LAYOUT - REDIRECTING TO HOME - {new Date().toISOString()}
        </div>
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