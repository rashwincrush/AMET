'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import SupabaseConnectionTest from '@/components/SupabaseConnectionTest';
import { useAuth } from '@/lib/auth';

export default function TestConnectionPage() {
  const { user, isLoading } = useAuth();
  const [tables, setTables] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchTables() {
      try {
        setLoading(true);
        
        // List all tables in the public schema
        const { data, error } = await supabase
          .from('roles')
          .select('*')
          .limit(5);
        
        if (error) throw error;
        
        console.log('Roles data:', data);
        
        // Get list of tables
        const tableNames = ['profiles', 'roles', 'user_roles', 'events', 'job_listings', 'achievements'];
        setTables(tableNames);
      } catch (err: any) {
        console.error('Error fetching tables:', err);
        setError(err.message || 'Failed to fetch tables');
      } finally {
        setLoading(false);
      }
    }
    
    fetchTables();
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Supabase Connection Test</h1>
      
      <div className="mb-8">
        <SupabaseConnectionTest />
      </div>
      
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Authentication Status</h2>
        <div className="p-4 border rounded-md">
          {isLoading ? (
            <p>Loading authentication status...</p>
          ) : user ? (
            <div>
              <p className="text-green-600">✅ Authenticated as {user.email}</p>
              <p className="text-sm mt-2">User ID: {user.id}</p>
            </div>
          ) : (
            <p className="text-yellow-600">⚠️ Not authenticated</p>
          )}
        </div>
      </div>
      
      <div>
        <h2 className="text-xl font-semibold mb-4">Database Tables</h2>
        <div className="p-4 border rounded-md">
          {loading ? (
            <p>Loading tables...</p>
          ) : error ? (
            <p className="text-red-600">Error: {error}</p>
          ) : (
            <ul className="list-disc pl-5">
              {tables.map(table => (
                <li key={table} className="mb-1">{table}</li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
} 