import fs from 'fs';
import path from 'path';

// Explicitly mark this page as static
export const dynamic = 'error';

export default function StaticHomePage() {
  // This will be a simple static page that doesn't use any client modules or dynamic features
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 m-4">
        <h1 className="text-3xl font-bold text-blue-600 mb-4">AMET Alumni Portal</h1>
        <p className="text-gray-600 mb-6">Welcome to the AMET Alumni Management System</p>
        <a 
          href="/home" 
          className="block w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white text-center font-medium rounded-lg"
        >
          Enter Alumni Portal
        </a>
      </div>
    </div>
  );
}
