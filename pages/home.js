import { useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';

export default function HomePage() {
  return (
    <>
      <Head>
        <title>Home | Alumni Management System</title>
        <meta name="description" content="Alumni Management System dashboard and home page" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      
      <div className="min-h-screen bg-gray-50">
        <header className="bg-blue-600 text-white shadow">
          <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
            <h1 className="text-2xl font-bold">Alumni Management System</h1>
            <nav className="space-x-4">
              <Link href="/dashboard" className="hover:underline">Dashboard</Link>
              <Link href="/directory" className="hover:underline">Directory</Link>
              <Link href="/events" className="hover:underline">Events</Link>
              <Link href="/profile" className="hover:underline">Profile</Link>
            </nav>
          </div>
        </header>
        
        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Welcome to the Alumni Portal</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-blue-50 p-6 rounded-lg shadow-sm">
                  <h3 className="text-lg font-medium text-blue-800 mb-2">Directory</h3>
                  <p className="text-gray-600 mb-4">Connect with fellow alumni from various years and programs.</p>
                  <Link href="/directory" className="text-blue-600 hover:underline">Browse Directory →</Link>
                </div>
                
                <div className="bg-green-50 p-6 rounded-lg shadow-sm">
                  <h3 className="text-lg font-medium text-green-800 mb-2">Upcoming Events</h3>
                  <p className="text-gray-600 mb-4">Join networking events, webinars, and reunions.</p>
                  <Link href="/events" className="text-green-600 hover:underline">View Events →</Link>
                </div>
                
                <div className="bg-purple-50 p-6 rounded-lg shadow-sm">
                  <h3 className="text-lg font-medium text-purple-800 mb-2">Job Opportunities</h3>
                  <p className="text-gray-600 mb-4">Explore career opportunities shared by alumni network.</p>
                  <Link href="/jobs" className="text-purple-600 hover:underline">Browse Jobs →</Link>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
