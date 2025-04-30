// This is a fallback page using the Pages Router
// It will ONLY be used if the App Router version fails to build

import { useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';

export default function FallbackPage() {
  const router = useRouter();
  
  // Automatically redirect to dashboard if you want a complete bypass
  // Uncomment the next block if you want automatic redirect
  /*
  useEffect(() => {
    router.push('/dashboard');
  }, [router]);
  */
  
  return (
    <>
      <Head>
        <title>Alumni Management System</title>
        <meta name="description" content="Connect with fellow alumni, discover events, and explore career opportunities" />
      </Head>
      
      <div className="flex min-h-screen flex-col items-center justify-center p-4">
        <h1 className="text-4xl font-bold mb-6">Alumni Management System</h1>
        <p className="mb-8 text-lg text-center max-w-md">
          Connect with fellow alumni, discover events, and explore career opportunities.
        </p>
        <a 
          href="/home" 
          className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          Enter Portal
        </a>
      </div>
    </>
  );
}

// Disable static generation for this page
export const getServerSideProps = async () => {
  return { props: {} };
};
