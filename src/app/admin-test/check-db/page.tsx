'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export default function CheckDbPage() {
  const [results, setResults] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkDatabase();
  }, []);

  const addResult = (message: string) => {
    setResults(prev => [...prev, message]);
    console.log(message);
  };

  const checkDatabase = async () => {
    setLoading(true);
    addResult('Starting database check...');

    try {
      // Check Supabase connection
      addResult('Checking Supabase connection...');
      const { data: user, error: userError } = await supabase.auth.getUser();
      
      if (userError) {
        addResult(`❌ Error connecting to Supabase: ${userError.message}`);
        return;
      }
      
      addResult(`✅ Connected to Supabase as: ${user.user?.email}`);

      // List all tables in the public schema
      addResult('Listing all tables in the public schema...');
      const { data: tables, error: tablesError } = await supabase
        .from('pg_tables')
        .select('tablename')
        .eq('schemaname', 'public');

      if (tablesError) {
        addResult(`❌ Error listing tables: ${tablesError.message}`);
      } else {
        addResult(`✅ Found ${tables.length} tables in the public schema:`);
        tables.forEach((table: any) => {
          addResult(`   - ${table.tablename}`);
        });
      }

      // Try to create a simple test table
      addResult('Trying to create a simple test table...');
      const { error: createError } = await supabase.rpc('create_test_table');

      if (createError) {
        addResult(`❌ Error creating test table: ${createError.message}`);
        addResult('This likely means you need to create a stored procedure first.');
        addResult('Go to the SQL Editor in Supabase and run:');
        addResult(`
-- Create a stored procedure for testing table creation
CREATE OR REPLACE FUNCTION create_test_table()
RETURNS void AS $$
BEGIN
  CREATE TABLE IF NOT EXISTS test_table (
    id SERIAL PRIMARY KEY,
    name TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
        `);
      } else {
        addResult('✅ Successfully created test table');
      }

      // Check database permissions
      addResult('Checking database permissions...');
      const { error: insertError } = await supabase
        .from('test_table')
        .insert({ name: 'test' });

      if (insertError) {
        addResult(`❌ Error inserting into test table: ${insertError.message}`);
        if (insertError.message.includes('permission denied')) {
          addResult('This is likely a Row Level Security (RLS) issue.');
          addResult('You need to create appropriate RLS policies for your tables.');
        }
      } else {
        addResult('✅ Successfully inserted into test table');
      }

      // Provide recommendations
      addResult('\nRecommendations:');
      addResult('1. Create the roles and user_roles tables using the SQL Editor');
      addResult('2. Set up appropriate RLS policies');
      addResult('3. Create the admin role and assign it to your user');
      addResult('\nCheck the console for more detailed logs.');
    } catch (err: any) {
      addResult(`❌ Unexpected error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-2xl font-bold mb-4">Database Check</h1>
      
      <div className="bg-gray-100 p-4 rounded-lg">
        <h2 className="text-xl font-semibold mb-2">Results</h2>
        {loading ? (
          <p>Running database checks...</p>
        ) : (
          <pre className="whitespace-pre-wrap text-sm">
            {results.join('\n')}
          </pre>
        )}
      </div>
    </div>
  );
}
