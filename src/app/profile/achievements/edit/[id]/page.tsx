"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import AchievementForm from '@/components/achievements/AchievementForm';

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

export default function EditAchievementPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { id } = params;
  
  const [achievement, setAchievement] = useState<Achievement | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Load achievement data
  useEffect(() => {
    async function loadAchievement() {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch(`/api/achievements/${id}`);
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to load achievement');
        }
        
        const data = await response.json();
        setAchievement(data.achievement);
      } catch (error: any) {
        console.error('Error loading achievement:', error);
        setError(error.message);
        toast.error(error.message);
      } finally {
        setLoading(false);
      }
    }
    
    loadAchievement();
  }, [id]);
  
  const handleSuccess = () => {
    router.push('/profile/achievements');
  };
  
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto" />
        <p className="mt-2">Loading achievement...</p>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
        <button
          onClick={() => router.push('/profile/achievements')}
          className="text-blue-600 hover:underline"
        >
          Back to Achievements
        </button>
      </div>
    );
  }
  
  if (!achievement) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-4">
          Achievement not found
        </div>
        <button
          onClick={() => router.push('/profile/achievements')}
          className="text-blue-600 hover:underline"
        >
          Back to Achievements
        </button>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Edit Achievement</h1>
      <AchievementForm 
        achievement={achievement} 
        onSuccess={handleSuccess} 
      />
    </div>
  );
}
