'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { assignRole, removeRole, getAllRoles, Role } from '@/lib/roles';
import { useAuthWithRoles } from '@/lib/useAuthWithRoles';

interface UserRoleAssignmentProps {
  userId: string;
  userEmail: string;
  currentRoles: string[];
  onRolesUpdated?: () => void;
}

export default function UserRoleAssignment({
  userId,
  userEmail,
  currentRoles = [],
  onRolesUpdated
}: UserRoleAssignmentProps) {
  const [roles, setRoles] = useState<Role[]>([]);
  const [selectedRole, setSelectedRole] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const { user, refreshRoles } = useAuthWithRoles();

  useEffect(() => {
    fetchRoles();
  }, []);

  const fetchRoles = async () => {
    try {
      const allRoles = await getAllRoles();
      setRoles(allRoles);
    } catch (error) {
      console.error('Error fetching roles:', error);
      toast.error('Failed to load roles');
    }
  };

  const handleAssignRole = async () => {
    if (!selectedRole) {
      toast.error('Please select a role');
      return;
    }

    setLoading(true);
    try {
      await assignRole(userId, selectedRole, user?.id || '');
      toast.success(`Role assigned to ${userEmail}`);
      setSelectedRole('');
      if (onRolesUpdated) onRolesUpdated();
      if (userId === user?.id) refreshRoles();
    } catch (error) {
      console.error('Error assigning role:', error);
      toast.error('Failed to assign role');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveRole = async (roleId: string) => {
    setLoading(true);
    try {
      await removeRole(userId, roleId);
      toast.success(`Role removed from ${userEmail}`);
      if (onRolesUpdated) onRolesUpdated();
      if (userId === user?.id) refreshRoles();
    } catch (error) {
      console.error('Error removing role:', error);
      toast.error('Failed to remove role');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Manage User Roles</h3>
      
      <div className="space-y-2">
        <Label>Current Roles</Label>
        <div className="flex flex-wrap gap-2">
          {currentRoles.length === 0 ? (
            <p className="text-sm text-gray-500">No roles assigned</p>
          ) : (
            currentRoles.map((roleName) => {
              const role = roles.find(r => r.name === roleName);
              return (
                <div key={roleName} className="flex items-center bg-blue-50 px-3 py-1 rounded-full">
                  <span className="text-sm text-blue-700">{roleName}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 ml-2"
                    onClick={() => handleRemoveRole(role?.id || '')}
                    disabled={loading || roleName === 'admin'}
                  >
                    ×
                  </Button>
                </div>
              );
            })
          )}
        </div>
      </div>

      <div className="flex items-end gap-2">
        <div className="flex-1">
          <Label htmlFor="role">Assign New Role</Label>
          <select
            id="role"
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            className="flex h-10 w-full items-center rounded-md border border-gray-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-950"
          >
            <option value="">Select a role</option>
            {roles
              .filter(role => !currentRoles.includes(role.name))
              .map(role => (
                <option key={role.id} value={role.id}>
                  {role.name}
                </option>
              ))}
          </select>
        </div>
        <Button onClick={handleAssignRole} disabled={loading || !selectedRole}>
          Assign
        </Button>
      </div>
    </div>
  );
}
