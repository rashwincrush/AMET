'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import AchievementsList from './AchievementsList';
import { supabase } from '@/lib/supabase';

type Achievement = {
  id: string;
  title: string;
  description?: string;
  year?: number;
  url?: string;
  achievement_type?: 'professional' | 'academic' | 'personal' | 'other';
  created_at?: string;
};

type ProfileViewProps = {
  profile: {
    id: string;
    first_name?: string;
    last_name?: string;
    graduation_year?: number;
    degree?: string;
    major?: string;
    current_company?: string;
    current_position?: string;
    location?: string;
    bio?: string;
    linkedin_url?: string;
    twitter_url?: string;
    website_url?: string;
    created_at?: string;
  };
  isOwnProfile?: boolean;
};

export  function ProfileView({ profile, isOwnProfile = false }: ProfileViewProps) {
  const router = useRouter();
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    async function loadAchievements() {
      try {
        setLoading(true);
        
        const { data, error } = await supabase
          .from('achievements')
          .select('*')
          .eq('profile_id', profile.id)
          .order('year', { ascending: false });
          
        if (error) throw error;
        
        setAchievements(data || []);
      } catch (err) {
        console.error('Error loading achievements:', err);
      } finally {
        setLoading(false);
      }
    }
    
    loadAchievements();
  }, [profile.id]);

  return (
    <div className="max-w-2xl mx-auto bg-white shadow overflow-hidden sm:rounded-lg">
      <div className="px-4 py-5 sm:px-6">
        <h3 className="text-lg leading-6 font-medium text-gray-900">
          {profile.first_name} {profile.last_name}
        </h3>
        {profile.current_position && profile.current_company && (
          <p className="mt-1 max-w-2xl text-sm text-gray-500">
            {profile.current_position} at {profile.current_company}
          </p>
        )}
      </div>
      <div className="border-t border-gray-200">
        <dl>
          <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt className="text-sm font-medium text-gray-500">Education</dt>
            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
              {profile.degree} in {profile.major} ({profile.graduation_year})
            </dd>
          </div>
          {profile.location && (
            <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Location</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {profile.location}
              </dd>
            </div>
          )}
          {profile.bio && (
            <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Bio</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {profile.bio}
              </dd>
            </div>
          )}
          <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt className="text-sm font-medium text-gray-500">Social Links</dt>
            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
              <ul className="space-y-2">
                {profile.linkedin_url && (
                  <li>
                    <a
                      href={profile.linkedin_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-indigo-600 hover:text-indigo-900"
                    >
                      LinkedIn Profile
                    </a>
                  </li>
                )}
                {profile.twitter_url && (
                  <li>
                    <a
                      href={profile.twitter_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-indigo-600 hover:text-indigo-900"
                    >
                      Twitter Profile
                    </a>
                  </li>
                )}
                {profile.website_url && (
                  <li>
                    <a
                      href={profile.website_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-indigo-600 hover:text-indigo-900"
                    >
                      Personal Website
                    </a>
                  </li>
                )}
              </ul>
            </dd>
          </div>
        </dl>
      </div>
      {/* Achievements Section */}
      <div className="border-t border-gray-200">
        <AchievementsList
          profileId={profile.id}
          achievements={achievements}
          isOwnProfile={isOwnProfile}
          onAchievementAdded={() => {
            // Reload achievements after adding a new one
            supabase
              .from('achievements')
              .select('*')
              .eq('profile_id', profile.id)
              .order('year', { ascending: false })
              .then(({ data }) => {
                if (data) setAchievements(data);
              });
          }}
          onAchievementDeleted={(id) => {
            // Update local state after deleting an achievement
            setAchievements(prev => prev.filter(a => a.id !== id));
          }}
        />
      </div>
      
      {isOwnProfile && (
        <div className="px-4 py-3 bg-gray-50 text-right sm:px-6">
          <Button
            type="button"
            onClick={() => router.push('/profile/edit')}
          >
            Edit Profile
          </Button>
        </div>
      )}
    </div>
  );
}