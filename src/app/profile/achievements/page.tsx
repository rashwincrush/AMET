"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Plus, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import AchievementCard from '@/components/achievements/AchievementCard';
import { useAuth } from '@/lib/auth';

interface Achievement {
  id: string;
  title: string;
  description: string;
  date: string | null;
  url: string | null;
  image_url: string | null;
  is_approved: boolean;
  user_id: string;
  created_at: string;
}

export default function AchievementsPage() {
  const router = useRouter();
  const { user } = useAuth();
  
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load user's achievements
  useEffect(() => {
    async function loadAchievements() {
      if (!user) return;
      
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch('/api/achievements');
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to load achievements');
        }
        
        const data = await response.json();
        setAchievements(data.achievements);
      } catch (error: any) {
        console.error('Error loading achievements:', error);
        setError(error.message);
        toast.error(error.message);
      } finally {
        setLoading(false);
      }
    }
    
    loadAchievements();
  }, [user]);

  // Handle achievement deletion
  const handleDelete = (id: string) => {
    setAchievements(prev => prev.filter(achievement => achievement.id !== id));
  };

  // Navigate to add new achievement page
  const handleAddNew = () => {
    router.push('/profile/achievements/new');
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <button
          onClick={() => router.back()}
          className="flex items-center text-sm text-gray-600 hover:text-gray-900 mb-2"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back
        </button>
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">My Achievements</h1>
          <Button onClick={handleAddNew} className="flex items-center">
            <Plus className="h-4 w-4 mr-2" />
            Add Achievement
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p>Loading achievements...</p>
        </div>
      ) : error ? (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      ) : achievements.length === 0 ? (
        <Card className="p-8 text-center">
          <h3 className="text-lg font-medium text-gray-900 mb-2">No achievements yet</h3>
          <p className="text-gray-500 mb-6">
            Showcase your accomplishments by adding your first achievement.
          </p>
          <Button onClick={handleAddNew} className="mx-auto">
            <Plus className="h-4 w-4 mr-2" />
            Add Your First Achievement
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {achievements.map(achievement => (
            <AchievementCard
              key={achievement.id}
              achievement={achievement}
              onDelete={handleDelete}
              showControls={true}
            />
          ))}
        </div>
      )}
      
      <div className="mt-8 bg-blue-50 p-6 rounded-lg">
        <h3 className="text-lg font-medium text-blue-900 mb-2">About Achievements</h3>
        <p className="text-blue-700 mb-4">
          Achievements are a great way to showcase your accomplishments to other alumni and potential employers.
          They appear on your public profile after approval by an administrator.
        </p>
        <div className="text-sm text-blue-600">
          <p className="mb-1">✓ Professional certifications and awards</p>
          <p className="mb-1">✓ Academic honors and publications</p>
          <p className="mb-1">✓ Community recognition and volunteer work</p>
          <p>✓ Career milestones and promotions</p>
        </div>
      </div>
    </div>
  );
}