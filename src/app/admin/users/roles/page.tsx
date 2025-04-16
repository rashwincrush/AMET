'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import { useAuthWithRoles } from '@/lib/useAuthWithRoles';
import { 
  AlertCircle, 
  Search, 
  Users, 
  X, 
  Shield, 
  UserCog
} from 'lucide-react';

interface User {
  id: string;
  email: string;
  roles: string[];
}

function UserRoleAssignment({ userId, userEmail, currentRoles, onRolesUpdated }: { 
  userId: string; 
  userEmail: string; 
  currentRoles: string[];
  onRolesUpdated: () => void;
}) {
  const [roles, setRoles] = useState<Array<{id: string; name: string}>>([]);
  const [selectedRoles, setSelectedRoles] = useState<string[]>(currentRoles);
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const { data, error } = await supabase
          .from('roles')
          .select('id, name');
        
        if (error) throw error;
        setRoles(data || []);
      } catch (error) {
        console.error('Error fetching roles:', error);
        toast.error('Failed to load roles');
      }
    };
    
    fetchRoles();
  }, []);
  
  const updateUserRoles = async () => {
    try {
      setLoading(true);
      
      // Delete current role assignments using profile_id instead of user_id
      const { error: deleteError } = await supabase
        .from('user_roles')
        .delete()
        .eq('profile_id', userId);
      
      if (deleteError) throw deleteError;
      
      // Add new role assignments with profile_id
      for (const roleId of selectedRoles) {
        const { error } = await supabase
          .from('user_roles')
          .insert([
            { profile_id: userId, role_id: roleId }
          ]);
        
        if (error) throw error;
      }
      
      toast.success('User roles updated successfully');
      onRolesUpdated();
    } catch (error) {
      console.error('Error updating user roles:', error);
      toast.error('Failed to update user roles');
    } finally {
      setLoading(false);
    }
  };
  
  const toggleRole = (roleId: string) => {
    setSelectedRoles(prev => 
      prev.includes(roleId)
        ? prev.filter(id => id !== roleId)
        : [...prev, roleId]
    );
  };
  
  return (
    <Card className="mt-4">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-medium">
          <div className="flex items-center">
            <UserCog className="h-4 w-4 mr-2" />
            Manage Roles for {userEmail}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-2">
            {roles.map(role => (
              <div key={role.id} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id={`role-${role.id}`}
                  checked={selectedRoles.includes(role.id)}
                  onChange={() => toggleRole(role.id)}
                  className="h-4 w-4 rounded border-gray-300"
                />
                <Label htmlFor={`role-${role.id}`} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  {role.name}
                </Label>
              </div>
            ))}
          </div>
          
          <div className="flex justify-end space-x-2">
            <Button
              onClick={updateUserRoles}
              disabled={loading}
              size="sm"
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {loading ? 'Updating...' : 'Save Changes'}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function UserRolesPage() {
  const router = useRouter();
  const { user, isAdmin, isLoading: authLoading } = useAuthWithRoles();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && user) {
      loadUsers();
    }
  }, [authLoading, user]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Get all users from the auth.users table via profiles
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, email');
      
      if (profilesError) throw profilesError;
      
      // Get all user_roles with correct profile_id column instead of user_id
      const { data: userRoles, error: rolesError } = await supabase
        .from('user_roles')
        .select('profile_id, role_id, roles(id, name)');
      
      if (rolesError) throw rolesError;
      
      // Map user roles to users with corrected field names
      const usersWithRoles = profiles?.map(profile => {
        const userRolesList = userRoles
          ?.filter(ur => ur.profile_id === profile.id)
          .map(ur => ur.role_id) || [];
        
        return {
          id: profile.id,
          email: profile.email,
          roles: userRolesList
        };
      }) || [];
      
      setUsers(usersWithRoles);
    } catch (error) {
      console.error('Error loading users:', error);
      setError('Failed to load users. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRolesUpdated = () => {
    loadUsers();
  };

  const filteredUsers = users.filter(user => 
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading || authLoading) {
    return (
      <div className="container mx-auto p-6 flex justify-center items-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-lg font-medium">Loading users...</p>
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
              You do not have permission to manage user roles.
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

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <Card className="mb-6 border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-red-800">
              <AlertCircle className="h-5 w-5" />
              <p>{error}</p>
            </div>
            <Button 
              onClick={loadUsers} 
              variant="outline" 
              className="mt-2"
            >
              Retry
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
          <h1 className="text-3xl font-bold">User Role Management</h1>
          <p className="text-gray-600">Assign and manage roles for users</p>
        </div>
        <Button onClick={() => router.push('/admin')} variant="outline">
          Back to Dashboard
        </Button>
      </div>
      
      {/* Search Section */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              placeholder="Search users by email..."
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
      
      {/* Users List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Users className="mr-2 h-5 w-5" />
            Users
          </CardTitle>
          <CardDescription>
            {filteredUsers.length} user{filteredUsers.length !== 1 ? 's' : ''} found
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredUsers.length === 0 ? (
            <div className="text-center py-6 text-gray-500">
              {searchTerm 
                ? 'No users match your search criteria' 
                : 'No users found in the system'}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredUsers.map(user => (
                <div key={user.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-medium">{user.email}</h3>
                      <div className="text-sm text-gray-500 flex items-center mt-1">
                        <Shield className="h-3 w-3 mr-1" />
                        {user.roles.length > 0 
                          ? `${user.roles.length} assigned role${user.roles.length !== 1 ? 's' : ''}` 
                          : 'No roles assigned'}
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedUserId(selectedUserId === user.id ? null : user.id)}
                    >
                      {selectedUserId === user.id ? 'Close' : 'Manage Roles'}
                    </Button>
                  </div>
                  
                  {selectedUserId === user.id && (
                    <UserRoleAssignment
                      userId={user.id}
                      userEmail={user.email}
                      currentRoles={user.roles}
                      onRolesUpdated={handleRolesUpdated}
                    />
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
