'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';

export default function SetupAdmin() {
  const [status, setStatus] = useState('');

  const setupAdmin = async () => {
    setStatus('Setting up admin role...');
    try {
      const response = await fetch('/api/admin/setup', {
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
      <h1 className="text-2xl font-bold mb-4">Setup Admin Role</h1>
      <p className="mb-4">This will assign the admin role to your account.</p>
      <Button onClick={setupAdmin}>
        Setup Admin Role
      </Button>
      {status && (
        <p className={`mt-4 ${status.includes('Error') ? 'text-red-500' : 'text-green-500'}`}>
          {status}
        </p>
      )}
    </div>
  );
}
