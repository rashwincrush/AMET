'use client';

import Link from 'next/link';
import { useAuth } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { FaUser, FaSignOutAlt, FaSignInAlt, FaUserPlus, FaLock } from 'react-icons/fa';

export default function Header() {
  const { user, signOut } = useAuth();
  // Use type assertion for userRole
  const userRole = (useAuth() as any).userRole;


  return (
    <header className="bg-blue-600 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex">
            <Link href="/home" className="flex-shrink-0 flex items-center">
              <img 
                src="/images/logo.jpg?v=2" 
                alt="AMET Logo" 
                width="120" 
                height="40" 
                className="h-10 w-auto" 
                style={{ objectFit: 'contain' }}
              />
            </Link>
            <nav className="hidden md:ml-6 md:flex md:space-x-4">
              <Link href="/directory" className="px-3 py-2 rounded-md text-sm font-medium text-white hover:bg-blue-700">
                Directory
              </Link>
              <Link href="/events" className="px-3 py-2 rounded-md text-sm font-medium text-white hover:bg-blue-700">
                Events
              </Link>
              <Link href="/jobs" className="px-3 py-2 rounded-md text-sm font-medium text-white hover:bg-blue-700">
                Jobs
              </Link>
              <Link href="/mentorship" className="px-3 py-2 rounded-md text-sm font-medium text-white hover:bg-blue-700">
                Mentorship
              </Link>
            </nav>
          </div>
          <div className="flex items-center space-x-4">
            {user ? (
              <>
                {userRole === 'admin' && (
                  <Link href="/admin" className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50">
                    Admin Dashboard
                  </Link>
                )}
                <Link href="/profile" className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 flex items-center">
                  <FaUser className="mr-2" />
                  My Profile
                </Link>
                <Link href="/auth/security" className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 flex items-center">
                  <FaLock className="mr-2" />
                  Security
                </Link>
                <Button 
                  variant="ghost" 
                  onClick={() => signOut()}
                  className="flex items-center"
                >
                  <FaSignOutAlt className="mr-2" />
                  Sign Out
                </Button>
              </>
            ) : (
              <>
                <Link href="/auth/login" className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 flex items-center">
                  <FaSignInAlt className="mr-2" />
                  Sign In
                </Link>
                <Link href="/auth/signup">
                  <Button className="flex items-center">
                    <FaUserPlus className="mr-2" />
                    Sign Up
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
