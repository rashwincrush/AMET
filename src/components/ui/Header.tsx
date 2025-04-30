'use client';

import Link from 'next/link';
import { useAuth } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { FaUser, FaSignOutAlt, FaSignInAlt, FaUserPlus, FaLock } from 'react-icons/fa';

export default function Header() {
  const { user, signOut } = useAuth();
  
  // Determine if user is admin - this would normally check a role claim or a profile lookup
  // For now we'll use a simple check based on email or metadata
  const isAdmin = user?.email?.endsWith('@admin.ametalumni.in') || 
                 user?.app_metadata?.role === 'admin' || 
                 user?.user_metadata?.role === 'admin';

  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex">
            <Link href="/" className="flex-shrink-0 flex items-center">
              <span className="text-xl font-bold text-blue-600">Alumni Network</span>
            </Link>
            <nav className="hidden md:ml-6 md:flex md:space-x-4">
              <Link href="/directory" className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50">
                Directory
              </Link>
              <Link href="/events" className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50">
                Events
              </Link>
              <Link href="/jobs" className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50">
                Jobs
              </Link>
              <Link href="/mentorship" className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50">
                Mentorship
              </Link>
            </nav>
          </div>
          <div className="flex items-center space-x-4">
            {user ? (
              <>
                {isAdmin && (
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
