import Link from 'next/link';

// Make this a static page
export const dynamic = 'force-static';

// Simple static landing page for the root route
export default function RootPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background">
      <div className="max-w-md w-full bg-card rounded-xl shadow-lg p-8 m-4 text-center">
        <h1 className="text-3xl font-bold text-primary mb-4">AMET Alumni Portal</h1>
        <p className="text-xl text-foreground mb-6">
          Welcome to the AMET Alumni Management System
        </p>
        <Link 
          href="/home" 
          className="inline-block bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-2 px-4 rounded transition-colors"
        >
          Enter Portal
        </Link>
        
        <div className="mt-6 text-sm text-muted-foreground">
          <p className="mb-2">Connect with alumni, find opportunities, and stay engaged</p>
        </div>
      </div>
    </div>
  );
}
