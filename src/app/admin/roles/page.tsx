'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useAuthWithRoles } from '@/lib/useAuthWithRoles';
import { 
  getAllRoles, 
  deleteRole, 
  getUsersWithRole, 
  Role, 
  createRole as createRoleApi 
} from '@/lib/roles';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/components/ui/alert-dialog';
import { Trash2, Shield, UserPlus, AlertTriangle, Search, X, Users } from 'lucide-react';

export default function RoleManagementPage() {
  const router = useRouter();
  const { user, isAdmin, isLoading: authLoading } = useAuthWithRoles();
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userCounts, setUserCounts] = useState<Record<string, number>>({});
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (!authLoading && user) {
      loadRoles();
    }
  }, [authLoading, user]);

  const loadRoles = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch all roles
      const rolesData = await getAllRoles();
      setRoles(rolesData);
      
      // Fetch user counts for each role
      const counts: Record<string, number> = {};
      
      await Promise.all(
        rolesData.map(async (role) => {
          const users = await getUsersWithRole(role.id);
          counts[role.id] = users.length;
        })
      );
      
      setUserCounts(counts);
    } catch (err) {
      console.error('Error loading roles:', err);
      setError('Failed to load roles. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const filteredRoles = roles.filter(role => 
    role.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (role.description && role.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (loading || authLoading) {
    return (
      <div className="container mx-auto p-6 flex justify-center items-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-lg font-medium">Loading roles...</p>
        </div>
      </div>
    );
  }
  
  if (!isAdmin) {
    return (
      <div className="container mx-auto p-6">
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="text-red-800">Access Denied</CardTitle>
            <CardDescription className="text-red-600">
              You do not have permission to manage roles.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={() => router.push('/')} 
              variant="outline" 
              className="mt-2"
            >
              Return to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Role Management</h1>
          <p className="text-gray-600">View system roles and user assignments</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => router.push('/admin/users/roles')} variant="outline">
            User Role Assignment
          </Button>
          <Button onClick={() => router.push('/admin')} variant="outline">
            Back to Dashboard
          </Button>
        </div>
      </div>
      
      {error && (
        <Card className="mb-6 border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-red-800">
              <AlertTriangle className="h-5 w-5" />
              <p>{error}</p>
            </div>
            <Button 
              onClick={loadRoles} 
              variant="outline" 
              className="mt-2"
            >
              Retry
            </Button>
          </CardContent>
        </Card>
      )}
      
      {/* Search Section */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              placeholder="Search roles..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
            {searchTerm && (
              <button 
                onClick={() => setSearchTerm('')}
                className="absolute right-2.5 top-2.5 text-gray-500 hover:text-gray-700"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </CardContent>
      </Card>
      
      {/* Existing Roles Section */}
      <h2 className="text-2xl font-semibold mb-4 flex items-center">
        <Shield className="h-6 w-6 mr-2 text-gray-600" />
        System Roles
      </h2>
      
      {filteredRoles.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center text-gray-500">
            {searchTerm 
              ? 'No roles match your search criteria' 
              : 'No roles found in the system.'}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredRoles.map((role) => (
            <Card key={role.id} className="overflow-hidden">
              <CardHeader className="bg-gray-50">
                <CardTitle>{role.name}</CardTitle>
                {role.description && (
                  <CardDescription>{role.description}</CardDescription>
                )}
              </CardHeader>
              <CardContent className="pt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500 flex items-center">
                      <Users className="h-4 w-4 mr-1" />
                      Users with this role
                    </p>
                    <p className="text-2xl font-bold">{userCounts[role.id] || 0}</p>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => router.push(`/admin/users/roles?role=${role.id}`)}
                  >
                    Manage Users
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      
      {/* Help Text */}
      <Card className="mt-8 bg-blue-50 border-blue-100">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-blue-100 rounded-full">
              <Shield className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h3 className="font-medium text-blue-800">About Role Management</h3>
              <p className="text-sm text-blue-600 mt-1">
                This page displays the system's predefined roles. To assign or remove roles from users, 
                use the <strong>User Role Assignment</strong> page.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
