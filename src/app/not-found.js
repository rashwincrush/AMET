'use client';

import Link from 'next/link';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function NotFound() {
  const router = useRouter();
  
  // Auto-redirect to /home after a brief delay
  useEffect(() => {
    const redirectTimer = setTimeout(() => {
      router.push('/home');
    }, 100);
    
    return () => clearTimeout(redirectTimer);
  }, [router]);
  
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-4 text-center">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8">
        <h1 className="text-3xl font-bold text-blue-600 mb-4">AMET Alumni Portal</h1>
        <p className="text-gray-600 mb-6">Welcome to the AMET Alumni Management System</p>
        <Link 
          href="/home" 
          className="block w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white text-center font-medium rounded-lg transition-colors"
        >
          Enter Alumni Portal
        </Link>
        <p className="mt-4 text-sm text-gray-500">Redirecting to portal...</p>
      </div>
    </div>
  );
}
