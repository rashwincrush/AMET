// Static home page that redirects to the dynamic home
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function StaticHome() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to the dynamic home page
    router.push('/home');
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-blue-600 mb-4">AMET Alumni Network</h1>
        <p className="text-gray-600 mb-8">Loading your personalized experience...</p>
        <div className="w-16 h-16 border-t-4 border-b-4 border-blue-500 rounded-full animate-spin mx-auto"></div>
      </div>
    </div>
  );
}
