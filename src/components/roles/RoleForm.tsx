'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { createRole, updateRole, Role } from '@/lib/roles';
import RolePermissions from './RolePermissions';

interface RoleFormProps {
  role?: Role;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function RoleForm({ role, onSuccess, onCancel }: RoleFormProps) {
  const [name, setName] = useState(role?.name || '');
  const [description, setDescription] = useState(role?.description || '');
  const [permissions, setPermissions] = useState<Record<string, boolean>>(role?.permissions || {});
  const [loading, setLoading] = useState(false);

  const isEditMode = !!role;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!name.trim()) {
      toast.error('Role name is required');
      return;
    }

    setLoading(true);
    try {
      if (isEditMode) {
        await updateRole(role.id, {
          name,
          description,
          permissions
        });
        toast.success('Role updated successfully');
      } else {
        await createRole(name, description, permissions);
        toast.success('Role created successfully');
      }
      
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error('Error saving role:', error);
      toast.error(`Failed to ${isEditMode ? 'update' : 'create'} role`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Role Name</Label>
          <Input
            id="name"
            value={name}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
            placeholder="e.g., event_manager"
            disabled={loading || (isEditMode && role.name === 'admin')}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={description}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setDescription(e.target.value)}
            placeholder="Describe the purpose of this role"
            disabled={loading || (isEditMode && role.name === 'admin')}
            rows={3}
          />
        </div>

        <div className="space-y-2">
          <Label>Permissions</Label>
          <RolePermissions
            permissions={permissions}
            onChange={setPermissions}
            disabled={loading || (isEditMode && role.name === 'admin')}
          />
        </div>
      </div>

      <div className="flex justify-end space-x-2">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
            Cancel
          </Button>
        )}
        <Button type="submit" disabled={loading || (isEditMode && role.name === 'admin')}>
          {isEditMode ? 'Update Role' : 'Create Role'}
        </Button>
      </div>
    </form>
  );
}
