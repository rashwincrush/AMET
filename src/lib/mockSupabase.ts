import { mockJobs } from '@/mock/jobs';
import { mockEvents } from '@/mock/events';
import { mockAlumni } from '@/mock/alumni';
import { mockConversations, mockMessages, currentUserId } from '@/mock/messages';

// Mock user roles data
const mockUserRoles = [
  {
    id: 1,
    user_id: 'alumni-001',
    role_id: 1,
    profile_id: '5371e2d5-0697-46c0-bf5b-aab2e4d88b58',
    created_at: '2023-01-01T00:00:00.000Z',
    roles: {
      name: 'alumni',
      permissions: ['view_events', 'view_jobs', 'view_profiles', 'message_alumni']
    }
  }
];

// Create a mock Supabase client that returns mock data instead of making API calls
export const createMockSupabaseClient = () => {
  return {
    auth: {
      getSession: () => Promise.resolve({ data: { session: { user: { id: 'alumni-001' } } }, error: null }),
      getUser: () => Promise.resolve({ 
        data: { 
          user: { 
            id: 'alumni-001',
            email: 'alex.johnson@example.com',
            identities: [],
            user_metadata: {
              first_name: 'Alex',
              last_name: 'Johnson',
              phone_number: '+1 555-123-4567'
            }
          } 
        }, 
        error: null 
      }),
      signInWithPassword: ({ email, password }: any) => {
        // Simulate successful login
        return Promise.resolve({
          data: {
            user: {
              id: 'alumni-001',
              email,
              identities: [],
              user_metadata: {
                first_name: 'Alex',
                last_name: 'Johnson'
              }
            },
            session: {
              access_token: 'mock-access-token',
              refresh_token: 'mock-refresh-token',
              expires_at: Date.now() + 3600000 // 1 hour from now
            }
          },
          error: null
        });
      },
      signIn: ({ email, password }: any) => {
        // Simulate successful login
        return Promise.resolve({
          data: {
            user: {
              id: 'alumni-001',
              email,
              identities: [],
              user_metadata: {
                first_name: 'Alex',
                last_name: 'Johnson'
              }
            },
            session: {
              access_token: 'mock-access-token',
              refresh_token: 'mock-refresh-token',
              expires_at: Date.now() + 3600000 // 1 hour from now
            }
          },
          error: null
        });
      },
      signUp: (params: any) => {
        // Simulate successful signup
        return Promise.resolve({
          data: {
            user: {
              id: 'new-user-001',
              email: params.email,
              identities: [],
              user_metadata: params.options?.data || {}
            },
            session: {
              access_token: 'mock-access-token',
              refresh_token: 'mock-refresh-token',
              expires_at: Date.now() + 3600000 // 1 hour from now
            }
          },
          error: null
        });
      },
      updateUser: (params: any) => {
        // Simulate successful user update
        return Promise.resolve({
          data: { user: { id: 'alumni-001', ...params } },
          error: null
        });
      },
      onAuthStateChange: (callback: any) => {
        // Simulate auth state change
        setTimeout(() => {
          callback('SIGNED_IN', {
            user: {
              id: 'alumni-001',
              email: 'alex.johnson@example.com',
              user_metadata: {
                first_name: 'Alex',
                last_name: 'Johnson'
              }
            }
          });
        }, 100);
        return { data: { subscription: { unsubscribe: () => {} } } };
      }
    },
    from: (table: string) => {
      console.log(`[MOCK] Accessing table: ${table}`);
      
      // Special handling for user_roles table to fix 406 error
      if (table === 'user_roles') {
        return {
          select: (columns: string) => {
            console.log(`[MOCK] Selecting ${columns} from user_roles`);
            
            // Check for the problematic inner join query pattern that causes 406 errors
            const isInnerJoinQuery = columns && columns.includes('roles!inner');
            console.log(`[MOCK] Is inner join query: ${isInnerJoinQuery}`);
            
            return {
              eq: (field: string, value: any) => {
                console.log(`[MOCK] Filtering ${field}=${value} in user_roles with columns: ${columns}`);
                
                // Return properly structured response for the inner join query
                if (isInnerJoinQuery) {
                  return Promise.resolve({
                    data: [
                      {
                        id: '1',
                        profile_id: value, // Use the actual filter value
                        role_id: '1',
                        created_at: '2023-01-01T00:00:00.000Z',
                        roles: {
                          id: '1',
                          name: 'alumni',
                          permissions: ['view_events', 'view_jobs', 'view_profiles', 'message_alumni']
                        }
                      }
                    ],
                    error: null
                  });
                }
                
                // For standard queries
                return Promise.resolve({
                  data: mockUserRoles,
                  error: null
                });
              }
            };
          },
          insert: () => Promise.resolve({ data: { id: 'new-role-1' }, error: null }),
          update: () => Promise.resolve({ data: {}, error: null }),
          delete: () => Promise.resolve({ data: {}, error: null })
        };
      }
      
      // Handle jobs table
      if (table === 'jobs') {
        return {
          select: () => ({
            order: () => ({
              limit: () => Promise.resolve({ data: mockJobs, error: null })
            }),
            limit: () => Promise.resolve({ data: mockJobs, error: null })
          })
        };
      } 
      
      // Handle events table
      else if (table === 'events') {
        return {
          select: () => ({
            order: () => ({
              limit: () => Promise.resolve({ data: mockEvents, error: null })
            }),
            limit: () => Promise.resolve({ data: mockEvents, error: null }),
            gte: () => ({
              order: () => ({
                limit: () => Promise.resolve({ data: mockEvents, error: null })
              })
            })
          })
        };
      }
      
      // Handle profiles table
      else if (table === 'profiles') {
        return {
          select: () => ({
            order: () => ({
              limit: () => Promise.resolve({ data: mockAlumni, error: null })
            }),
            limit: () => Promise.resolve({ data: mockAlumni, error: null }),
            eq: (field: string, value: string) => {
              const profile = mockAlumni.find(a => 
                (field === 'id' && a.id === value) || 
                (field === 'email' && a.email === value)
              );
              return {
                single: () => Promise.resolve({ data: profile || null, error: null })
              };
            }
          }),
          update: () => ({
            match: () => Promise.resolve({ data: {}, error: null }),
            eq: () => Promise.resolve({ data: {}, error: null })
          }),
          insert: () => Promise.resolve({ data: {}, error: null })
        };
      }
      
      // Handle conversations table
      else if (table === 'conversations') {
        return {
          select: () => ({
            eq: () => ({
              eq: () => Promise.resolve({ data: mockConversations, error: null }),
              order: () => ({
                limit: () => Promise.resolve({ data: mockConversations, error: null })
              })
            }),
            in: () => ({
              eq: () => Promise.resolve({ data: mockConversations, error: null }),
              order: () => ({
                limit: () => Promise.resolve({ data: mockConversations, error: null })
              })
            })
          })
        };
      }
      
      // Handle messages table
      else if (table === 'messages') {
        return {
          select: () => ({
            eq: () => ({
              order: () => ({
                limit: () => Promise.resolve({ data: mockMessages, error: null })
              })
            })
          }),
          insert: () => Promise.resolve({ data: { id: 'new-message-1' }, error: null })
        };
      }
      
      // Default generic handler for any other tables
      return {
        select: () => ({
          eq: () => Promise.resolve({ data: [], error: null }),
          order: () => ({
            limit: () => Promise.resolve({ data: [], error: null })
          }),
          limit: () => Promise.resolve({ data: [], error: null })
        }),
        insert: () => Promise.resolve({ data: { id: 'new-id' }, error: null }),
        update: () => Promise.resolve({ data: {}, error: null }),
        delete: () => Promise.resolve({ data: {}, error: null })
      };
    }
  };
};

// Export a mock Supabase client instance
export const mockSupabaseClient = createMockSupabaseClient();
