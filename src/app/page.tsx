'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function RedirectToHome() {
  const router = useRouter();
  
  useEffect(() => {
    // Immediate redirect with no delay
    window.location.href = '/home';
  }, []);
  
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-red-100">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 m-4 border-4 border-red-600">
        <h1 className="text-3xl font-bold text-red-600 mb-4">UPDATED ROOT PAGE</h1>
        <p className="text-xl text-red-800 mb-6">Redirecting to /home immediately...</p>
        <div className="bg-yellow-100 p-4 border-2 border-yellow-400 rounded">
          <p className="font-bold">Debug Info:</p>
          <p>Time: {new Date().toISOString()}</p>
          <p>This page was updated at 10:10 AM</p>
        </div>
      </div>
    </div>
  );
}
