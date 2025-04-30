// Create a static page with no dynamic content
import Link from 'next/link';

// Explicitly set to static export
export const dynamic = 'error';
export const runtime = 'edge';

export default function StaticHome() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 text-center">
      <h1 className="text-4xl font-bold mb-6">AMET Alumni Association</h1>
      <p className="text-xl mb-8">Welcome to the AMET Alumni Management System</p>
      <Link 
        href="/home" 
        className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg text-lg transition-colors"
      >
        Enter the Portal
      </Link>
    </div>
  );
}
