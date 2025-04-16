'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';
import ProtectedRoute from '@/components/auth/ProtectedRoute';

export default function CreateNetworkingGroupPage() {
  const router = useRouter();
  const { user } = useAuth();
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'Professional',
    is_private: false,
    image_url: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const categories = [
    'Professional',
    'Industry',
    'Regional',
    'Graduation Year',
    'Special Interest',
    'Academic',
    'Career Development',
    'Social',
    'Other'
  ];
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    
    setFormData(prevData => ({
      ...prevData,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    // Validate form
    if (!formData.name || !formData.description || !formData.category) {
      setError('Please fill in all required fields');
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      // Create the networking group
      const { data, error: createError } = await supabase
        .from('networking_groups')
        .insert({
          name: formData.name,
          description: formData.description,
          category: formData.category,
          is_private: formData.is_private,
          image_url: formData.image_url || null,
          created_by: user.id,
          created_at: new Date().toISOString()
        })
        .select();
        
      if (createError) throw createError;
      
      if (data && data[0]) {
        // Add creator as a member and admin
        const { error: memberError } = await supabase
          .from('group_members')
          .insert({
            group_id: data[0].id,
            user_id: user.id,
            role: 'admin',
            joined_at: new Date().toISOString(),
            status: 'active'
          });
          
        if (memberError) throw memberError;
        
        // Redirect to the new group page
        router.push(`/networking/groups/${data[0].id}`);
      }
    } catch (err: any) {
      console.error('Error creating networking group:', err);
      setError(err.message || 'Failed to create networking group');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <ProtectedRoute>
      <div className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
        <div className="md:flex md:items-center md:justify-between mb-6">
          <div className="flex-1 min-w-0">
            <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
              Create Networking Group
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Start a new group to connect with alumni who share your interests.
            </p>
          </div>
        </div>
        
        <div className="bg-white shadow px-4 py-5 sm:rounded-lg sm:p-6">
          {error && (
            <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6">
              <p>{error}</p>
            </div>
          )}
          
          <form onSubmit={handleSubmit}>
            <div className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  Group Name *
                </label>
                <div className="mt-1">
                  <input
                    type="text"
                    name="name"
                    id="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    required
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                  Description *
                </label>
                <div className="mt-1">
                  <textarea
                    id="description"
                    name="description"
                    rows={4}
                    value={formData.description}
                    onChange={handleChange}
                    className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    placeholder="Describe the purpose and goals of your group"
                    required
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700">
                  Category *
                </label>
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                  required
                >
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label htmlFor="image_url" className="block text-sm font-medium text-gray-700">
                  Group Image URL
                </label>
                <div className="mt-1">
                  <input
                    type="url"
                    name="image_url"
                    id="image_url"
                    value={formData.image_url}
                    onChange={handleChange}
                    className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    placeholder="https://example.com/image.jpg"
                  />
                </div>
                <p className="mt-2 text-sm text-gray-500">
                  Optional. Provide a URL to an image that represents your group.
                </p>
              </div>
              
              <div className="flex items-start">
                <div className="flex items-center h-5">
                  <input
                    id="is_private"
                    name="is_private"
                    type="checkbox"
                    checked={formData.is_private}
                    onChange={handleChange}
                    className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                  />
                </div>
                <div className="ml-3 text-sm">
                  <label htmlFor="is_private" className="font-medium text-gray-700">
                    Private Group
                  </label>
                  <p className="text-gray-500">
                    Private groups require approval to join and are not visible in search results.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="mt-8 flex justify-end">
              <Link href="/networking/groups">
                <Button type="button" variant="outline" className="mr-3">
                  Cancel
                </Button>
              </Link>
              <Button type="submit" disabled={loading}>
                {loading ? 'Creating...' : 'Create Group'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </ProtectedRoute>
  );
} 