import { headers } from 'next/headers';
import { redirect } from 'next/navigation';

// This is a server component that handles the root route
export default function RootPage() {
  // Check if we're in a static generation context
  try {
    // During static generation, this will throw an error
    // which we can catch to provide fallback content
    headers();
    // If we get here, we're in a server context and can safely redirect
    redirect('/home');
  } catch (e) {
    // We're in a static generation context, so return a simple page
    // that will be pre-rendered
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 m-4">
          <h1 className="text-3xl font-bold text-blue-600 mb-4">AMET Alumni Portal</h1>
          <p className="text-xl text-gray-700 mb-6">
            Welcome to the AMET Alumni Management System.
          </p>
          <a 
            href="/home" 
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            Enter Portal
          </a>
        </div>
      </div>
    );
  }
}
