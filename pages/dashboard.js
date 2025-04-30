'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';

export default function DashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // Simulate loading data
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 px-4 md:px-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-gray-500">Welcome to the Alumni Management System</p>
        </div>
        <div className="flex items-center space-x-2">
          <button className="bg-blue-100 p-2 rounded-full text-blue-500">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
          </button>
          <button className="bg-gray-100 p-2 rounded-full text-gray-500">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>
          <div className="bg-blue-500 text-white rounded-full h-10 w-10 flex items-center justify-center">
            <span>AU</span>
          </div>
        </div>
      </div>

      {/* Profile Summary Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow p-6 col-span-2">
          <div className="flex items-start">
            <div className="bg-blue-500 text-white rounded-full h-16 w-16 flex items-center justify-center text-xl mr-4">
              <span>AU</span>
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-semibold">Alumni User</h2>
              <p className="text-gray-500">Class of 2022 • Computer Science</p>
              <p className="text-gray-500">Software Engineer at Tech Company</p>
              
              <div className="mt-4">
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium">Profile Completion</span>
                  <span className="text-sm font-medium">65%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div className="bg-blue-500 h-2.5 rounded-full" style={{ width: '65%' }}></div>
                </div>
                <p className="text-sm text-gray-500 mt-2">Complete your profile to connect with more alumni</p>
              </div>
            </div>
            <Link href="/profile/edit">
              <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md text-sm">
                Edit Profile
              </button>
            </Link>
          </div>
        </div>
        
        {/* Notifications Card */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Notifications</h3>
            <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full">3 New</span>
          </div>
          <div className="space-y-4">
            <div className="flex items-start">
              <div className="bg-blue-100 p-2 rounded-full text-blue-500 mr-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium">New Alumni Meetup</p>
                <p className="text-xs text-gray-500">
                  Join us for the annual alumni meetup on May 15th
                </p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="bg-green-100 p-2 rounded-full text-green-500 mr-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium">New Job Opportunity</p>
                <p className="text-xs text-gray-500">
                  Senior Developer position at Google
                </p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="bg-purple-100 p-2 rounded-full text-purple-500 mr-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium">Mentorship Request</p>
                <p className="text-xs text-gray-500">
                  John Doe wants to connect with you for mentorship
                </p>
              </div>
            </div>
          </div>
          <Link href="/notifications">
            <button className="w-full text-blue-500 text-sm mt-4 hover:underline">
              View All Notifications
            </button>
          </Link>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h3 className="text-lg font-semibold mb-4">Alumni Network</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-blue-500">1,234</div>
            <div className="text-sm text-gray-500">Total Alumni</div>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-green-500">42</div>
            <div className="text-sm text-gray-500">Events This Year</div>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-purple-500">87</div>
            <div className="text-sm text-gray-500">Active Mentors</div>
          </div>
          <div className="bg-yellow-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-yellow-500">156</div>
            <div className="text-sm text-gray-500">Job Opportunities</div>
          </div>
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Events Card */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Upcoming Events</h3>
            <Link href="/events">
              <button className="text-blue-500 text-sm hover:underline">View All</button>
            </Link>
          </div>
          <div className="space-y-4">
            <div className="border-l-4 border-blue-500 pl-4">
              <p className="font-medium">Annual Alumni Meetup</p>
              <p className="text-sm text-gray-500">May 15, 2025 • San Francisco</p>
              <div className="flex mt-2">
                <button className="text-xs bg-blue-100 text-blue-500 px-2 py-1 rounded mr-2">RSVP</button>
                <button className="text-xs bg-gray-100 text-gray-500 px-2 py-1 rounded">Details</button>
              </div>
            </div>
            <div className="border-l-4 border-green-500 pl-4">
              <p className="font-medium">Tech Industry Panel</p>
              <p className="text-sm text-gray-500">June 3, 2025 • Virtual</p>
              <div className="flex mt-2">
                <button className="text-xs bg-blue-100 text-blue-500 px-2 py-1 rounded mr-2">RSVP</button>
                <button className="text-xs bg-gray-100 text-gray-500 px-2 py-1 rounded">Details</button>
              </div>
            </div>
            <div className="border-l-4 border-purple-500 pl-4">
              <p className="font-medium">Career Development Workshop</p>
              <p className="text-sm text-gray-500">June 22, 2025 • New York</p>
              <div className="flex mt-2">
                <button className="text-xs bg-blue-100 text-blue-500 px-2 py-1 rounded mr-2">RSVP</button>
                <button className="text-xs bg-gray-100 text-gray-500 px-2 py-1 rounded">Details</button>
              </div>
            </div>
          </div>
        </div>
        
        {/* Jobs Card */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Job Openings</h3>
            <Link href="/jobs">
              <button className="text-blue-500 text-sm hover:underline">View All</button>
            </Link>
          </div>
          <div className="space-y-4">
            <div className="flex items-start">
              <img src="https://via.placeholder.com/40" alt="Google" className="rounded mr-3" />
              <div>
                <p className="font-medium">Senior Software Engineer</p>
                <p className="text-sm text-gray-500">Google • San Francisco, CA</p>
                <p className="text-xs text-gray-400 mt-1">Posted 2 days ago</p>
              </div>
            </div>
            <div className="flex items-start">
              <img src="https://via.placeholder.com/40" alt="Microsoft" className="rounded mr-3" />
              <div>
                <p className="font-medium">Product Manager</p>
                <p className="text-sm text-gray-500">Microsoft • Remote</p>
                <p className="text-xs text-gray-400 mt-1">Posted 3 days ago</p>
              </div>
            </div>
            <div className="flex items-start">
              <img src="https://via.placeholder.com/40" alt="Apple" className="rounded mr-3" />
              <div>
                <p className="font-medium">UX Designer</p>
                <p className="text-sm text-gray-500">Apple • Cupertino, CA</p>
                <p className="text-xs text-gray-400 mt-1">Posted 5 days ago</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Mentors Card */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Featured Mentors</h3>
          <Link href="/mentors">
            <button className="text-blue-500 text-sm hover:underline">View All</button>
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gray-50 rounded-lg p-4 text-center">
            <div className="bg-blue-500 text-white rounded-full h-16 w-16 flex items-center justify-center text-xl mx-auto mb-3">
              <span>JD</span>
            </div>
            <p className="font-medium">Jane Doe</p>
            <p className="text-sm text-gray-500">Senior Engineer at Google</p>
            <p className="text-xs text-gray-400 mt-1">Mentors in: Career Growth, Technical Skills</p>
            <button className="mt-3 bg-blue-500 hover:bg-blue-600 text-white text-sm px-4 py-1 rounded-md">
              Connect
            </button>
          </div>
          <div className="bg-gray-50 rounded-lg p-4 text-center">
            <div className="bg-green-500 text-white rounded-full h-16 w-16 flex items-center justify-center text-xl mx-auto mb-3">
              <span>MS</span>
            </div>
            <p className="font-medium">Mike Smith</p>
            <p className="text-sm text-gray-500">Product Director at Amazon</p>
            <p className="text-xs text-gray-400 mt-1">Mentors in: Product Management, Leadership</p>
            <button className="mt-3 bg-blue-500 hover:bg-blue-600 text-white text-sm px-4 py-1 rounded-md">
              Connect
            </button>
          </div>
          <div className="bg-gray-50 rounded-lg p-4 text-center">
            <div className="bg-purple-500 text-white rounded-full h-16 w-16 flex items-center justify-center text-xl mx-auto mb-3">
              <span>AL</span>
            </div>
            <p className="font-medium">Amy Lee</p>
            <p className="text-sm text-gray-500">UX Director at Microsoft</p>
            <p className="text-xs text-gray-400 mt-1">Mentors in: Design, User Research</p>
            <button className="mt-3 bg-blue-500 hover:bg-blue-600 text-white text-sm px-4 py-1 rounded-md">
              Connect
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
