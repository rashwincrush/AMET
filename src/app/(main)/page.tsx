import Link from 'next/link';

// Mark this page as completely static - no server components or dynamic features
export const dynamic = 'error';
export const runtime = 'edge';

// A simple static landing page with no dynamic imports or data fetching
export default function StaticHomePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 m-4 text-center">
        <h1 className="text-3xl font-bold text-blue-600 mb-4">AMET Alumni Portal</h1>
        <p className="text-gray-600 mb-6">Welcome to the AMET Alumni Management System</p>
        
        {/* Simple static link - no dynamic content */}
        <Link 
          href="/home" 
          className="block w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white text-center font-medium rounded-lg transition-colors"
        >
          Enter Alumni Portal
        </Link>
        
        <div className="mt-6 text-sm text-gray-500">
          <p className="mb-2">Connect with alumni, find opportunities, and stay engaged</p>
        </div>
      </div>
    </div>
  );
}