import { mockEvents, mockJobs, mockAlumni, mockConversations, mockMessages } from '@/mock';

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
      return {
        select: (query: string) => {
          return {
            eq: (field: string, value: any) => {
              return {
                single: () => {
                  // Return mock data based on the table
                  if (table === 'profiles') {
                    const profile = mockAlumni.find(a => a.id === value || a.email === value);
                    return Promise.resolve({
                      data: profile ? {
                        id: profile.id,
                        first_name: profile.firstName,
                        last_name: profile.lastName,
                        email: profile.email,
                        avatar_url: profile.avatarUrl,
                        graduation_year: parseInt(profile.graduationYear),
                        major: profile.major,
                        industry: profile.company,
                        location: profile.location,
                        bio: profile.bio,
                        phone_number: profile.phoneNumber,
                        is_verified: profile.isVerified,
                        created_at: profile.joinedDate,
                        updated_at: profile.joinedDate,
                        full_name: `${profile.firstName} ${profile.lastName}`
                      } : null,
                      error: null
                    });
                  }
                  return Promise.resolve({ data: null, error: null });
                },
                order: () => ({
                  limit: () => Promise.resolve({ data: [], error: null })
                }),
                limit: () => Promise.resolve({ data: [], error: null }),
                gte: () => ({
                  order: () => ({
                    limit: () => Promise.resolve({ data: [], error: null })
                  })
                })
              };
            },
            or: () => {
              return {
                order: () => {
                  // Return mock data based on the table
                  if (table === 'events') {
                    const formattedEvents = mockEvents.map(event => ({
                      id: event.id,
                      title: event.title,
                      description: event.description,
                      location: event.location,
                      is_virtual: event.isVirtual,
                      virtual_meeting_link: event.isVirtual ? event.virtualLink : undefined,
                      start_date: event.date + 'T' + event.time.split(' - ')[0] + ':00Z',
                      end_date: event.date + 'T' + event.time.split(' - ')[1] + ':00Z',
                      max_attendees: event.attendees,
                      image_url: event.image,
                      creator_id: event.organizer,
                      created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
                      category: event.category,
                      is_published: true
                    }));
                    return Promise.resolve({ data: formattedEvents, error: null });
                  }
                  if (table === 'jobs') {
                    const formattedJobs = mockJobs.map(job => ({
                      id: job.id,
                      title: job.title,
                      company: job.company,
                      location: job.location,
                      description: job.description,
                      requirements: job.requirements.join('\n'),
                      salary_range: job.salary,
                      job_type: job.employmentType.toLowerCase(),
                      experience_level: job.experienceLevel.toLowerCase().replace('-level', ''),
                      application_url: job.applicationLink,
                      contact_email: job.contactEmail,
                      posted_by: job.postedBy,
                      created_at: job.postedDate,
                      expires_at: job.applicationDeadline,
                      is_active: true
                    }));
                    return Promise.resolve({ data: formattedJobs, error: null });
                  }
                  if (table === 'conversations') {
                    const formattedConversations = mockConversations.map(conv => {
                      const otherParticipant = conv.participants.find(p => p.id !== 'alumni-001');
                      return {
                        id: conv.id,
                        participant1_id: 'alumni-001',
                        participant2_id: otherParticipant?.id || '',
                        last_message_time: conv.lastMessage.timestamp,
                        last_message_id: `msg-${conv.id}-last`
                      };
                    });
                    return Promise.resolve({ data: formattedConversations, error: null });
                  }
                  return Promise.resolve({ data: [], error: null });
                }
              };
            },
            count: () => Promise.resolve({ count: 0, error: null }),
            limit: () => Promise.resolve({ data: [], error: null })
          };
        },
        insert: () => Promise.resolve({ data: { id: 'new-id' }, error: null }),
        update: () => Promise.resolve({ data: {}, error: null }),
        upsert: () => Promise.resolve({ data: {}, error: null }),
        delete: () => Promise.resolve({ data: {}, error: null })
      };
    }
  };
};

// Export a mock Supabase client instance
export const mockSupabaseClient = createMockSupabaseClient();
