'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';

export default function CreateAdmin() {
  const [status, setStatus] = useState('');

  const createAdmin = async () => {
    setStatus('Setting up admin role...');
    try {
      const response = await fetch('/api/admin/create-admin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: 'ashwinproject2024@gmail.com'
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        setStatus('Admin role setup completed successfully!');
      } else {
        setStatus('Failed to setup admin role: ' + data.error);
      }
    } catch (error: any) {
      setStatus('Error: ' + (error.message || 'Unknown error'));
    }
  };

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-2xl font-bold mb-4">Create Admin Role</h1>
      <p className="mb-4">This will create the admin role and assign it to your account.</p>
      <Button onClick={createAdmin}>
        Create Admin Role
      </Button>
      {status && (
        <p className={`mt-4 ${status.includes('Error') ? 'text-red-500' : 'text-green-500'}`}>
          {status}
        </p>
      )}
    </div>
  );
}
