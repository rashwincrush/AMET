'use client';

import { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';
import { Button } from '@/components/ui/button';

const AdminLayout = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function checkAdminStatus() {
      try {
        if (!user) {
          router.push('/auth/login');
          return;
        }

        // Check if user has admin role
        const { data, error } = await supabase
          .from('user_roles')
          .select('roles!inner(name)')
          .eq('profile_id', user.id)
          .eq('roles.name', 'admin')
          .single();

        if (error && error.code !== 'PGRST116') { // PGRST116 is the error code for no rows returned
          throw error;
        }

        setIsAdmin(!!data);

        if (!data) {
          router.push('/');
          return;
        }
      } catch (err: any) {
        console.error('Error checking admin status:', err);
        setError('Failed to verify permissions. Please try again.');
      } finally {
        setLoading(false);
      }
    }

    checkAdminStatus();
  }, [user, router]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          You do not have permission to access this page.
        </div>
        <Link href="/">
          <Button>Return to Home</Button>
        </Link>
      </div>
    );
  }

  const navItems = [
    { name: 'Dashboard', path: '/admin' },
    { name: 'Roles Dashboard', path: '/admin/roles-dashboard' },
    { name: 'Manage Roles', path: '/admin/roles' },
    { name: 'User Roles', path: '/admin/users/roles' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 bg-white shadow-md h-screen fixed">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-800">Admin Dashboard</h2>
          </div>
          <nav className="mt-4">
            <ul>
              {navItems.map((item) => (
                <li key={item.path}>
                  <Link href={item.path}>
                    <div
                      className={`px-4 py-3 flex items-center ${pathname === item.path ? 'bg-blue-50 text-blue-600 border-r-4 border-blue-600' : 'text-gray-700 hover:bg-gray-100'}`}
                    >
                      <span>{item.name}</span>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        {/* Main content */}
        <div className="ml-64 flex-1 p-6">
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}
          {children}
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;