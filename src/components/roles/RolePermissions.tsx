'use client';

import { useState } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { AVAILABLE_PERMISSIONS } from '@/lib/roles';

interface RolePermissionsProps {
  permissions: Record<string, boolean>;
  onChange: (permissions: Record<string, boolean>) => void;
  disabled?: boolean;
}

export default function RolePermissions({
  permissions = {},
  onChange,
  disabled = false
}: RolePermissionsProps) {
  const handlePermissionChange = (permission: string, checked: boolean) => {
    const updatedPermissions = {
      ...permissions,
      [permission]: checked
    };
    onChange(updatedPermissions);
  };

  const permissionGroups = {
    'Admin': ['manage_users', 'manage_roles', 'manage_settings'],
    'Content': ['manage_content'],
    'Events': ['manage_events', 'view_events'],
    'Jobs': ['manage_jobs', 'view_jobs'],
    'Network': ['view_network', 'create_profile'],
    'Mentorship': ['mentor_users']
  };

  return (
    <div className="space-y-6">
      {Object.entries(permissionGroups).map(([groupName, groupPermissions]) => (
        <div key={groupName} className="space-y-2">
          <h3 className="font-medium text-sm text-gray-700">{groupName} Permissions</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {groupPermissions.map(permission => (
              <div key={permission} className="flex items-center space-x-2">
                <Checkbox
                  id={`permission-${permission}`}
                  checked={permissions[permission] || false}
                  onCheckedChange={(checked) => handlePermissionChange(permission, !!checked)}
                  disabled={disabled}
                />
                <Label
                  htmlFor={`permission-${permission}`}
                  className="text-sm font-normal"
                >
                  {AVAILABLE_PERMISSIONS[permission] || permission}
                </Label>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
