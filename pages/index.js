import { useRouter } from 'next/router';
import Head from 'next/head';

export default function Home() {
  const router = useRouter();
  
  const handleEnterPortal = () => {
    // Navigate to the dashboard page
    router.push('/dashboard');
  };
  
  return (
    <>
      <Head>
        <title>Alumni Management System</title>
        <meta name="description" content="Connect with fellow alumni, discover events, and explore career opportunities." />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white p-8 rounded-lg shadow-lg text-center max-w-md w-full">
          <h1 className="text-3xl font-bold text-blue-700 mb-4">Alumni Management System</h1>
          
          <p className="text-gray-600 mb-6">
            Connect with fellow alumni, discover events, and explore career opportunities.
          </p>
          
          <button 
            onClick={handleEnterPortal}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-md transition-colors"
          >
            Enter Portal
          </button>
        </div>
      </div>
    </>
  );
}
