'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';

type MentorshipProgram = {
  id: string;
  title: string;
  description: string;
  start_date: string;
  end_date: string;
  is_active: boolean;
};

type Mentor = {
  id: string;
  first_name?: string;
  last_name?: string;
  current_position?: string;
  current_company?: string;
  bio?: string;
  avatar_url?: string;
  mentorship_count: number;
};

function PageClient({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { user } = useAuth();
  const [program, setProgram] = useState<MentorshipProgram | null>(null);
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [loading, setLoading] = useState(true);
  const [requestLoading, setRequestLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<string>('all');
  
  useEffect(() => {
    async function loadData() {
      if (!params.id || !user) return;
      
      try {
        setLoading(true);
        setError(null);

        // Load program details
        const { data: programData, error: programError } = await supabase
          .from('mentorship_programs')
          .select('*')
          .eq('id', params.id)
          .single();

        if (programError) throw programError;
        setProgram(programData);

        // Load mentors
        const { data: mentorsData, error: mentorsError } = await supabase
          .from('profiles')
          .select(`
            id, 
            first_name, 
            last_name, 
            current_position, 
            current_company, 
            bio, 
            avatar_url
          `)
          .eq('is_mentor', true);

        if (mentorsError) throw mentorsError;

        // Count mentorship relationships for each mentor
        const mentorsWithCount = await Promise.all(
          (mentorsData || []).map(async (mentor) => {
            const { count, error: countError } = await supabase
              .from('mentorship_relationships')
              .select('id', { count: 'exact' })
              .eq('mentor_id', mentor.id);

            if (countError) throw countError;

            return {
              ...mentor,
              mentorship_count: count || 0
            };
          })
        );

        setMentors(mentorsWithCount);
      } catch (err: any) {
        console.error('Error loading mentors:', err);
        setError('Failed to load mentors. Please try again.');
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [params.id, user]);

  const handleRequestMentor = async (mentorId: string) => {
    if (!user || !program) return;
    
    try {
      setRequestLoading(true);
      setError(null);
      setSuccess(null);
      
      // Check if relationship already exists
      const { data: existingRelationship, error: checkError } = await supabase
        .from('mentorship_relationships')
        .select('id')
        .eq('program_id', program.id)
        .eq('mentor_id', mentorId)
        .eq('mentee_id', user.id)
        .single();

      if (checkError && checkError.code !== 'PGRST116') { // PGRST116 is the error code for no rows returned
        throw checkError;
      }

      if (existingRelationship) {
        setError('You have already requested this mentor.');
        return;
      }

      // Create new mentorship relationship
      const { error: insertError } = await supabase
        .from('mentorship_relationships')
        .insert([
          {
            program_id: program.id,
            mentor_id: mentorId,
            mentee_id: user.id,
            status: 'pending'
          }
        ]);

      if (insertError) throw insertError;
      
      setSuccess('Mentor request sent successfully!');
      
      // Refresh mentor list after a short delay
      setTimeout(() => {
        router.push('/mentorship');
      }, 2000);
      
    } catch (err: any) {
      console.error('Error requesting mentor:', err);
      setError('Failed to send mentor request. Please try again.');
    } finally {
      setRequestLoading(false);
    }
  };

  const filteredMentors = mentors.filter(mentor => {
    const fullName = `${mentor.first_name || ''} ${mentor.last_name || ''}`.toLowerCase();
    const position = (mentor.current_position || '').toLowerCase();
    const company = (mentor.current_company || '').toLowerCase();
    const searchLower = searchTerm.toLowerCase();
    
    const matchesSearch = 
      fullName.includes(searchLower) || 
      position.includes(searchLower) || 
      company.includes(searchLower);
    
    if (filter === 'all') return matchesSearch;
    if (filter === 'available') return matchesSearch && mentor.mentorship_count < 3;
    if (filter === 'experienced') return matchesSearch && mentor.mentorship_count > 0;
    
    return matchesSearch;
  });

  return (
    <div>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Link href="/mentorship">
            <Button variant="outline" className="mb-4">
              ← Back to Mentorship
            </Button>
          </Link>
          
          <h1 className="text-3xl font-bold mb-2">
            {program ? program.title : 'Find a Mentor'}
          </h1>
          {program && program.description && (
            <p className="text-gray-600 mb-4">{program.description}</p>
          )}
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
            {success}
          </div>
        )}

        <div className="mb-6 flex flex-col md:flex-row gap-4">
          <input
            type="text"
            placeholder="Search mentors..."
            className="flex-1 p-3 border rounded-md"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          
          <select
            className="p-3 border rounded-md w-full md:w-48"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="all">All Mentors</option>
            <option value="available">Available (&lt; 3 mentees)</option>
            <option value="experienced">Experienced</option>
          </select>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : filteredMentors.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow-md">
            <p className="text-gray-500 mb-4">No mentors found matching your criteria.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMentors.map((mentor) => (
              <div key={mentor.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                <div className="p-6">
                  <div className="flex items-center mb-4">
                    <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-200 mr-4">
                      {mentor.avatar_url ? (
                        <img 
                          src={mentor.avatar_url} 
                          alt={`${mentor.first_name} ${mentor.last_name}`} 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-blue-500 text-white text-xl font-bold">
                          {mentor.first_name?.[0]}{mentor.last_name?.[0]}
                        </div>
                      )}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold">
                        {mentor.first_name} {mentor.last_name}
                      </h3>
                      {mentor.current_position && (
                        <p className="text-gray-600">{mentor.current_position}</p>
                      )}
                      {mentor.current_company && (
                        <p className="text-gray-600">{mentor.current_company}</p>
                      )}
                    </div>
                  </div>
                  
                  {mentor.bio && (
                    <p className="text-gray-700 mb-4 line-clamp-3">{mentor.bio}</p>
                  )}
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">
                      {mentor.mentorship_count} active mentee{mentor.mentorship_count !== 1 ? 's' : ''}
                    </span>
                    <Button 
                      onClick={() => handleRequestMentor(mentor.id)}
                      disabled={requestLoading}
                    >
                      Request as Mentor
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function MentorListPage() {
  return <PageClient />;
}