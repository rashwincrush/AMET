'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Eye } from 'lucide-react';
import ProfileDetailModal from './ProfileDetailModal';
import { AlumniProfile } from '@/mock/alumni';

type ProfileCardProps = {
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
    industry?: string;
    is_verified?: boolean;
    is_mentor?: boolean;
  };
  isPreview?: boolean;
  fullProfile?: AlumniProfile; // Optional full profile data for the modal
};

export default function ProfileCard({ profile, isPreview = false, fullProfile }: ProfileCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  return (
    <div className="bg-white shadow-md hover:shadow-xl rounded-lg overflow-hidden transition-all duration-300 border border-gray-100 flex flex-col h-full transform hover:-translate-y-1">
      <div className="bg-gradient-to-r from-primary-600 to-secondary-700 h-3"></div>
      <div className="p-6">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center">
              <h3 className="text-lg font-semibold text-gray-900">
                {isPreview ? (
                  // If preview, don't make it a link and anonymize last name
                  <span>
                    {profile.first_name} {profile.last_name ? profile.last_name.charAt(0) + '.' : ''}
                  </span>
                ) : (
                  <Link href={`/profile/${profile.id}`} className="hover:text-primary-600 transition-colors">
                    {profile.first_name} {profile.last_name}
                  </Link>
                )}
              </h3>
              {profile.is_verified && (
                <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  <svg className="-ml-0.5 mr-1.5 h-2 w-2 text-green-400" fill="currentColor" viewBox="0 0 8 8">
                    <circle cx="4" cy="4" r="3" />
                  </svg>
                  Verified
                </span>
              )}
              {profile.is_mentor && (
                <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                  <svg className="-ml-0.5 mr-1.5 h-2 w-2 text-primary-400" fill="currentColor" viewBox="0 0 8 8">
                    <circle cx="4" cy="4" r="3" />
                  </svg>
                  Mentor
                </span>
              )}
            </div>
            {profile.current_position && profile.current_company && (
              <p className="mt-1 text-sm text-gray-600">
                {profile.current_position} at {profile.current_company}
              </p>
            )}
          </div>
        </div>
      
        <div className="mt-4 border-t border-gray-100 pt-4">
          <div className="text-sm text-gray-500">
            {profile.degree} in {profile.major} ({profile.graduation_year})
          </div>
          {profile.location && (
            <div className="mt-2 text-sm text-gray-500">
              📍 {isPreview ? profile.location.split(',')[0] : profile.location}
            </div>
          )}
          {profile.industry && (
            <div className="mt-2 text-sm text-gray-500">
              🏢 {profile.industry}
            </div>
          )}
        </div>
      
        <div className="mt-4 flex justify-between items-center">
          {isPreview ? (
            <div className="text-sm text-gray-400">
              Sign in to view full profile
            </div>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              className="text-sm text-indigo-600 hover:text-indigo-900 p-0"
              onClick={() => setIsModalOpen(true)}
            >
              <Eye className="h-4 w-4 mr-1" />
              View Full Profile
            </Button>
          )}
          
          {profile.is_mentor && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
              Mentor
            </span>
          )}
        </div>
      </div>

      {/* Profile Detail Modal */}
      {!isPreview && fullProfile && (
        <ProfileDetailModal 
          profile={fullProfile}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </div>
  );
}