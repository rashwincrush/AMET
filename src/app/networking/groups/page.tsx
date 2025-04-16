'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';
import ProtectedRoute from '@/components/auth/ProtectedRoute';

interface GroupMember {
  group_id: string;
}

type NetworkingGroup = {
  id: string;
  name: string;
  description: string;
  category: string;
  created_at: string;
  created_by: string;
  member_count: number;
  is_private: boolean;
  image_url?: string;
  creator?: {
    first_name?: string;
    last_name?: string;
  };
  is_member?: boolean;
};

export default function NetworkingGroupsPage() {
  const router = useRouter();
  const { user } = useAuth();
  
  const [groups, setGroups] = useState<NetworkingGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('');
  const [categories, setCategories] = useState<string[]>([]);
  
  useEffect(() => {
    async function loadGroups() {
      if (!user) return;
      
      try {
        setLoading(true);
        setError(null);
        
        // Get all networking groups
        const { data, error } = await supabase
          .from('networking_groups')
          .select(`
            *,
            creator:created_by(first_name, last_name),
            member_count:group_members(count)
          `)
          .order('created_at', { ascending: false });
          
        if (error) throw error;
        
        if (data) {
          // Get user's memberships
          const { data: memberships, error: membershipError } = await supabase
            .from('group_members')
            .select('group_id')
            .eq('user_id', user.id);
            
          if (membershipError) throw membershipError;
          
          const userGroupIds = memberships ? memberships.map((m: GroupMember) => m.group_id) : [];
          
          // Process the data
          const processedGroups = data.map(group => ({
            ...group,
            is_member: userGroupIds.includes(group.id)
          }));
          
          setGroups(processedGroups);
          
          // Extract unique categories
          const uniqueCategories = Array.from(new Set(data.map(group => group.category))) as string[];
          setCategories(uniqueCategories);
        }
      } catch (err: any) {
        console.error('Error loading networking groups:', err);
        setError(err.message || 'Failed to load networking groups');
      } finally {
        setLoading(false);
      }
    }
    
    loadGroups();
  }, [user]);
  
  const filteredGroups = groups.filter(group => {
    const matchesSearch = searchTerm === '' || 
      group.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      group.description.toLowerCase().includes(searchTerm.toLowerCase());
      
    const matchesCategory = categoryFilter === '' || group.category === categoryFilter;
    
    return matchesSearch && matchesCategory;
  });
  
  const handleJoinGroup = async (groupId: string) => {
    if (!user) return;
    
    try {
      // Add user to group
      const { error } = await supabase
        .from('group_members')
        .insert({
          group_id: groupId,
          user_id: user.id,
          joined_at: new Date().toISOString(),
          status: 'active'
        });
        
      if (error) throw error;
      
      // Update local state
      setGroups(groups.map(group => 
        group.id === groupId 
          ? { ...group, is_member: true, member_count: group.member_count + 1 } 
          : group
      ));
    } catch (err: any) {
      console.error('Error joining group:', err);
      alert('Failed to join group. Please try again.');
    }
  };
  
  const handleLeaveGroup = async (groupId: string) => {
    if (!user) return;
    
    try {
      // Remove user from group
      const { error } = await supabase
        .from('group_members')
        .delete()
        .eq('group_id', groupId)
        .eq('user_id', user.id);
        
      if (error) throw error;
      
      // Update local state
      setGroups(groups.map(group => 
        group.id === groupId 
          ? { ...group, is_member: false, member_count: group.member_count - 1 } 
          : group
      ));
    } catch (err: any) {
      console.error('Error leaving group:', err);
      alert('Failed to leave group. Please try again.');
    }
  };
  
  return (
    <ProtectedRoute>
      <div className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
        <div className="md:flex md:items-center md:justify-between mb-6">
          <div className="flex-1 min-w-0">
            <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
              Networking Groups
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Connect with alumni who share your interests and professional goals.
            </p>
          </div>
          <div className="mt-4 flex md:mt-0 md:ml-4">
            <Link href="/networking/groups/create">
              <Button>
                Create New Group
              </Button>
            </Link>
          </div>
        </div>
        
        <div className="bg-white shadow px-4 py-5 sm:rounded-lg sm:p-6 mb-6">
          <div className="md:flex md:items-center md:justify-between">
            <div className="flex-1 min-w-0">
              <div className="max-w-lg w-full lg:max-w-xs">
                <label htmlFor="search" className="sr-only">Search</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <input
                    id="search"
                    name="search"
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="Search groups"
                    type="search"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
            </div>
            <div className="mt-4 md:mt-0 md:ml-4">
              <select
                id="category"
                name="category"
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
              >
                <option value="">All Categories</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
        
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : error ? (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        ) : filteredGroups.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No groups found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm || categoryFilter 
                ? 'Try adjusting your search or filter criteria.' 
                : 'Get started by creating a new networking group.'}
            </p>
            {!searchTerm && !categoryFilter && (
              <div className="mt-6">
                <Link href="/networking/groups/create">
                  <Button>
                    Create New Group
                  </Button>
                </Link>
              </div>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredGroups.map((group) => (
              <div key={group.id} className="bg-white overflow-hidden shadow rounded-lg">
                <div className="relative pb-48 overflow-hidden">
                  {group.image_url ? (
                    <img 
                      className="absolute inset-0 h-full w-full object-cover"
                      src={group.image_url} 
                      alt={group.name} 
                    />
                  ) : (
                    <div className="absolute inset-0 h-full w-full bg-gradient-to-r from-blue-400 to-blue-600 flex items-center justify-center">
                      <span className="text-white text-2xl font-bold">{group.name.charAt(0)}</span>
                    </div>
                  )}
                  {group.is_private && (
                    <div className="absolute top-0 right-0 m-2 px-2 py-1 bg-gray-800 bg-opacity-75 text-white text-xs rounded">
                      Private
                    </div>
                  )}
                </div>
                <div className="p-6">
                  <div className="flex items-baseline">
                    <span className="inline-block px-2 py-1 text-xs font-semibold bg-blue-100 text-blue-800 rounded-full">
                      {group.category}
                    </span>
                    <div className="ml-2 text-xs text-gray-500">
                      {group.member_count} {group.member_count === 1 ? 'member' : 'members'}
                    </div>
                  </div>
                  <h3 className="mt-2 text-xl font-semibold text-gray-900">{group.name}</h3>
                  <p className="mt-2 text-gray-500 line-clamp-3">{group.description}</p>
                  <div className="mt-4">
                    <div className="flex items-center">
                      <div className="text-sm text-gray-500">
                        Created by {group.creator?.first_name} {group.creator?.last_name}
                      </div>
                    </div>
                  </div>
                  <div className="mt-6 flex justify-between items-center">
                    <Link href={`/networking/groups/${group.id}`}>
                      <Button variant="outline">
                        View Group
                      </Button>
                    </Link>
                    {group.is_member ? (
                      <Button 
                        variant="outline" 
                        onClick={() => handleLeaveGroup(group.id)}
                        className="border-red-300 text-red-700 hover:bg-red-50"
                      >
                        Leave
                      </Button>
                    ) : (
                      <Button onClick={() => handleJoinGroup(group.id)}>
                        Join
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}