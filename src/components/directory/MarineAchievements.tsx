'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Badge } from '@/components/ui/badge';

type MarineAchievement = {
  id: string;
  profile_id: string;
  title: string;
  rank: 'marine' | 'captain' | 'commodore' | 'admiral' | 'fleet_admiral' | 'navigator';
  description: string;
  awarded_date: string;
};

interface MarineAchievementsProps {
  profileId: string;
}

const rankColors = {
  marine: 'bg-green-100 text-green-800',
  captain: 'bg-blue-100 text-blue-800',
  commodore: 'bg-purple-100 text-purple-800',
  admiral: 'bg-red-100 text-red-800',
  fleet_admiral: 'bg-yellow-100 text-yellow-800',
  navigator: 'bg-indigo-100 text-indigo-800'
};

const rankIcons: { [key: string]: string } = {
  marine: '🌊',
  captain: '⚓',
  commodore: '🚢',
  admiral: '⛵',
  fleet_admiral: '🎖️',
  navigator: '🧭'
};

export default function MarineAchievements({ profileId }: MarineAchievementsProps) {
  const [achievements, setAchievements] = useState<MarineAchievement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchAchievements() {
      try {
        setLoading(true);
        
        const { data, error } = await supabase
          .from('marine_achievements')
          .select('*')
          .eq('profile_id', profileId)
          .order('awarded_date', { ascending: false });
          
        if (error) throw error;
        
        setAchievements(data || []);
      } catch (err: any) {
        console.error('Error fetching marine achievements:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    
    fetchAchievements();
  }, [profileId]);
  
  if (loading) {
    return (
      <div className="animate-pulse mt-4">
        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="text-sm text-red-500 mt-4">
        Failed to load marine achievements
      </div>
    );
  }
  
  if (achievements.length === 0) {
    return null;
  }
  
  return (
    <div className="mt-4">
      <h3 className="text-sm font-medium text-gray-900">Naval Accolades</h3>
      <div className="mt-2 flex flex-wrap gap-2">
        {achievements.map((achievement) => (
          <Badge 
            key={achievement.id}
            variant="outline"
            className={`flex items-center gap-1 px-2 py-1 ${rankColors[achievement.rank] || 'bg-gray-100'}`}
          >
            <span>{rankIcons[achievement.rank] || '🏆'}</span>
            <span>{achievement.title}</span>
          </Badge>
        ))}
      </div>
    </div>
  );
} 