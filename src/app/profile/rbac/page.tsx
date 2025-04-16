'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth';
import { Shield, CheckCircle, XCircle, Lock, Key, UserCheck, Settings, AlertTriangle } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

export default function RoleBasedAccessControlPage() {
  const { userRole, permissions, hasPermission, user } = useAuth();
  const [permissionGroups, setPermissionGroups] = useState<{[key: string]: string[]}>({});
  
  // Group permissions by category for better visualization
  useEffect(() => {
    const groups: {[key: string]: string[]} = {};
    
    permissions.forEach(permission => {
      const category = permission.split('_')[0] || 'general';
      if (!groups[category]) {
        groups[category] = [];
      }
      groups[category].push(permission);
    });
    
    setPermissionGroups(groups);
  }, [permissions]);

  // Calculate access level percentage based on role
  const getAccessLevelPercentage = () => {
    switch(userRole) {
      case 'super_admin': return 100;
      case 'administrator': return 80;
      case 'alumni': return 60;
      case 'employer': return 50;
      case 'user': return 30;
      default: return 10;
    }
  };

  // Get role description
  const getRoleDescription = () => {
    switch(userRole) {
      case 'super_admin': return 'Full system access with all permissions';
      case 'administrator': return 'Administrative access to manage users and content';
      case 'alumni': return 'Alumni-specific features and networking capabilities';
      case 'employer': return 'Ability to post jobs and view alumni profiles';
      case 'user': return 'Basic access to public features';
      default: return 'Limited access to the system';
    }
  };

  // Get role badge color
  const getRoleBadgeColor = () => {
    switch(userRole) {
      case 'super_admin': return 'bg-purple-500 hover:bg-purple-600';
      case 'administrator': return 'bg-blue-500 hover:bg-blue-600';
      case 'alumni': return 'bg-green-500 hover:bg-green-600';
      case 'employer': return 'bg-amber-500 hover:bg-amber-600';
      case 'user': return 'bg-gray-500 hover:bg-gray-600';
      default: return 'bg-gray-400 hover:bg-gray-500';
    }
  };

  return (
    <div className="p-8 space-y-8 max-w-6xl mx-auto">
      <div className="flex items-center space-x-3 mb-6">
        <Shield className="h-8 w-8 text-primary" />
        <h1 className="text-3xl font-bold">Role-Based Access Control</h1>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* User Role Card */}
        <Card className="md:col-span-1 shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center">
              <UserCheck className="mr-2 h-5 w-5" />
              Your Role
            </CardTitle>
            <CardDescription>Current system access level</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center py-4 space-y-4">
              <Badge className={`text-lg py-2 px-4 ${getRoleBadgeColor()}`}>
                {userRole || 'No Role Assigned'}
              </Badge>
              <div className="w-full space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Access Level</span>
                  <span>{getAccessLevelPercentage()}%</span>
                </div>
                <Progress value={getAccessLevelPercentage()} className="h-2" />
              </div>
              <p className="text-sm text-center text-muted-foreground">
                {getRoleDescription()}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Permissions Overview Card */}
        <Card className="md:col-span-2 shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center">
              <Key className="mr-2 h-5 w-5" />
              Your Permissions
            </CardTitle>
            <CardDescription>What you can do in the system</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {userRole === 'super_admin' ? (
                <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg border border-purple-200 dark:border-purple-800">
                  <div className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-purple-600 dark:text-purple-400 mr-2" />
                    <p className="font-medium text-purple-800 dark:text-purple-300">Super Administrator Access</p>
                  </div>
                  <p className="mt-1 text-sm text-purple-700 dark:text-purple-400">
                    As a Super Administrator, you have unrestricted access to all system features and permissions.
                  </p>
                </div>
              ) : (
                Object.keys(permissionGroups).length > 0 ? (
                  Object.entries(permissionGroups).map(([category, perms]) => (
                    <div key={category} className="border rounded-lg p-4">
                      <h3 className="font-medium capitalize mb-2">{category} Permissions</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {perms.map(perm => (
                          <div key={perm} className="flex items-center space-x-2 text-sm">
                            <CheckCircle className="h-4 w-4 text-green-500" />
                            <span>{perm.replace(/_/g, ' ')}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <AlertTriangle className="h-10 w-10 text-amber-500 mb-2" />
                    <p className="text-muted-foreground">No specific permissions assigned</p>
                  </div>
                )
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Access Matrix Card */}
      <Card className="shadow-md hover:shadow-lg transition-shadow">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center">
            <Lock className="mr-2 h-5 w-5" />
            System Access Matrix
          </CardTitle>
          <CardDescription>Features you can access based on your role</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4">Feature</th>
                  <th className="text-center py-3 px-4">Access</th>
                  <th className="text-left py-3 px-4">Description</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                <tr>
                  <td className="py-3 px-4 font-medium">Dashboard</td>
                  <td className="py-3 px-4 text-center">
                    {hasPermission('dashboard_access') ? (
                      <CheckCircle className="h-5 w-5 text-green-500 mx-auto" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-500 mx-auto" />
                    )}
                  </td>
                  <td className="py-3 px-4 text-sm text-muted-foreground">View analytics and system overview</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-medium">User Management</td>
                  <td className="py-3 px-4 text-center">
                    {hasPermission('manage_users') || userRole === 'super_admin' || userRole === 'administrator' ? (
                      <CheckCircle className="h-5 w-5 text-green-500 mx-auto" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-500 mx-auto" />
                    )}
                  </td>
                  <td className="py-3 px-4 text-sm text-muted-foreground">Create, edit, and delete user accounts</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-medium">Job Posting</td>
                  <td className="py-3 px-4 text-center">
                    {hasPermission('post_jobs') || userRole === 'super_admin' || userRole === 'employer' ? (
                      <CheckCircle className="h-5 w-5 text-green-500 mx-auto" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-500 mx-auto" />
                    )}
                  </td>
                  <td className="py-3 px-4 text-sm text-muted-foreground">Create and manage job listings</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-medium">Event Management</td>
                  <td className="py-3 px-4 text-center">
                    {hasPermission('manage_events') || userRole === 'super_admin' || userRole === 'administrator' ? (
                      <CheckCircle className="h-5 w-5 text-green-500 mx-auto" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-500 mx-auto" />
                    )}
                  </td>
                  <td className="py-3 px-4 text-sm text-muted-foreground">Create and manage alumni events</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-medium">System Settings</td>
                  <td className="py-3 px-4 text-center">
                    {userRole === 'super_admin' ? (
                      <CheckCircle className="h-5 w-5 text-green-500 mx-auto" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-500 mx-auto" />
                    )}
                  </td>
                  <td className="py-3 px-4 text-sm text-muted-foreground">Configure system-wide settings</td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
        <CardFooter className="border-t pt-4">
          <div className="flex items-center text-sm text-muted-foreground">
            <Settings className="h-4 w-4 mr-2" />
            <span>Access is determined by your assigned role and specific permissions</span>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}