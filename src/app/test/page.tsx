"use client";

import { useAuth } from '@/lib/auth';
import { useEffect } from 'react';

export default function TestPage() {
  const { userRole, permissions, hasPermission, user } = useAuth();

  useEffect(() => {
    console.log('User Role:', userRole);
    console.log('Permissions:', permissions);
    console.log('User:', user);
  }, [userRole, permissions, user]);

  return (
    <div className="p-8 space-y-8">
      <h1 className="text-2xl font-bold">Role-Based Access Control Test</h1>

      <div className="bg-gray-100 p-4 rounded-lg">
        <h2 className="text-xl font-semibold mb-4">User Information</h2>
        <div className="space-y-2">
          <p><strong>Email:</strong> {user?.email || 'Not logged in'}</p>
          <p><strong>Role:</strong> {userRole || 'Not assigned'}</p>
          <p><strong>Permissions:</strong> {permissions.length > 0 ? permissions.join(', ') : 'None'}</p>
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Permission Tests</h2>
        
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-medium mb-2">Super Admin Area</h3>
          {userRole === 'super_admin' ? (
            <div className="bg-green-50 p-4 rounded">
              <p className="text-green-800">✅ You have super admin access</p>
              <p>You can see this because you are a super admin</p>
            </div>
          ) : (
            <div className="bg-red-50 p-4 rounded">
              <p className="text-red-800">❌ Super admin access required</p>
              <p>You need super admin role to access this area</p>
            </div>
          )}
        </div>

        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-medium mb-2">Dashboard Access</h3>
          {hasPermission('dashboard_access') ? (
            <div className="bg-green-50 p-4 rounded">
              <p className="text-green-800">✅ You have dashboard access</p>
              <p>You can see dashboard content here</p>
            </div>
          ) : (
            <div className="bg-red-50 p-4 rounded">
              <p className="text-red-800">❌ Dashboard access required</p>
              <p>You need dashboard_access permission to access this area</p>
            </div>
          )}
        </div>

        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-medium mb-2">Job Posting</h3>
          {hasPermission('post_jobs') ? (
            <div className="bg-green-50 p-4 rounded">
              <p className="text-green-800">✅ You can post jobs</p>
              <p>Job posting form would go here</p>
            </div>
          ) : (
            <div className="bg-red-50 p-4 rounded">
              <p className="text-red-800">❌ Job posting not allowed</p>
              <p>You need post_jobs permission to post jobs</p>
            </div>
          )}
        </div>
      </div>

      <div className="bg-white p-4 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Role Hierarchy</h2>
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-medium mb-2">Super Admin Features</h3>
            {userRole === 'super_admin' ? (
              <div className="bg-green-50 p-4 rounded">
                <p className="text-green-800">✅ Full access</p>
                <p>You can manage everything in the system</p>
              </div>
            ) : (
              <div className="bg-yellow-50 p-4 rounded">
                <p className="text-yellow-800">⚠️ Limited access</p>
                <p>You have {userRole || 'user'} access</p>
              </div>
            )}
          </div>

          <div>
            <h3 className="text-lg font-medium mb-2">Administrator Features</h3>
            {userRole === 'administrator' ? (
              <div className="bg-green-50 p-4 rounded">
                <p className="text-green-800">✅ Administrator access</p>
                <p>You can manage alumni, employers, and users</p>
              </div>
            ) : (
              <div className="bg-yellow-50 p-4 rounded">
                <p className="text-yellow-800">⚠️ Limited access</p>
                <p>You have {userRole || 'user'} access</p>
              </div>
            )}
          </div>

          <div>
            <h3 className="text-lg font-medium mb-2">Alumni Features</h3>
            {userRole === 'alumni' ? (
              <div className="bg-green-50 p-4 rounded">
                <p className="text-green-800">✅ Alumni access</p>
                <p>You can access alumni-specific features</p>
              </div>
            ) : (
              <div className="bg-yellow-50 p-4 rounded">
                <p className="text-yellow-800">⚠️ Limited access</p>
                <p>You have {userRole || 'user'} access</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
