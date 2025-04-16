'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';
import AchievementForm from './AchievementForm';

type Achievement = {
  id: string;
  title: string;
  description?: string;
  year?: number;
  url?: string;
  achievement_type?: 'professional' | 'academic' | 'personal' | 'other';
  created_at?: string;
};

type AchievementsListProps = {
  profileId: string;
  achievements: Achievement[];
  isOwnProfile: boolean;
  onAchievementAdded: () => void;
  onAchievementDeleted: (id: string) => void;
};

export default function AchievementsList({
  profileId,
  achievements,
  isOwnProfile,
  onAchievementAdded,
  onAchievementDeleted,
}: AchievementsListProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingAchievement, setEditingAchievement] = useState<Achievement | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleFormSuccess = () => {
    setShowAddForm(false);
    setEditingAchievement(null);
    onAchievementAdded();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this achievement?')) return;

    try {
      setDeletingId(id);
      const { error } = await supabase
        .from('achievements')
        .delete()
        .eq('id', id);

      if (error) throw error;

      onAchievementDeleted(id);
    } catch (err: any) {
      console.error('Error deleting achievement:', err);
      alert('Failed to delete achievement');
    } finally {
      setDeletingId(null);
    }
  };

  const getAchievementTypeColor = (type: string) => {
    switch (type) {
      case 'professional':
        return 'bg-blue-100 text-blue-800';
      case 'academic':
        return 'bg-green-100 text-green-800';
      case 'personal':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getAchievementTypeLabel = (type: string) => {
    return type.charAt(0).toUpperCase() + type.slice(1);
  };

  if (loading) {
    return (
      <div className="py-4">
        <div className="animate-pulse flex space-x-4">
          <div className="flex-1 space-y-4 py-1">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-4">
        <div className="flex">
          <div className="ml-3">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-900">Achievements</h2>
        {isOwnProfile && !showAddForm && !editingAchievement && (
          <Button 
            onClick={() => setShowAddForm(true)}
            className="text-sm"
          >
            Add Achievement
          </Button>
        )}
      </div>

      {showAddForm && (
        <AchievementForm
          profileId={profileId}
          onSuccess={handleFormSuccess}
          onCancel={() => setShowAddForm(false)}
        />
      )}

      {editingAchievement && (
        <AchievementForm
          profileId={profileId}
          achievement={editingAchievement}
          onSuccess={handleFormSuccess}
          onCancel={() => setEditingAchievement(null)}
        />
      )}

      {achievements.length === 0 && !showAddForm && !editingAchievement ? (
        <div className="text-center py-6 bg-gray-50 rounded-lg">
          <p className="text-gray-500">
            {isOwnProfile 
              ? 'You haven\'t added any achievements yet. Add your accomplishments to showcase your success.'
              : 'This user hasn\'t added any achievements yet.'}
          </p>
          {isOwnProfile && (
            <Button 
              onClick={() => setShowAddForm(true)}
              className="mt-4 text-sm"
            >
              Add Your First Achievement
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {achievements.map((achievement) => (
            <div key={achievement.id} className="bg-white p-4 border rounded-md shadow-sm">
              <div className="flex justify-between">
                <h3 className="text-lg font-medium text-gray-900">{achievement.title}</h3>
                {isOwnProfile && (
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setEditingAchievement(achievement)}
                      className="text-sm text-blue-600 hover:text-blue-800"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(achievement.id)}
                      disabled={deletingId === achievement.id}
                      className="text-sm text-red-600 hover:text-red-800"
                    >
                      {deletingId === achievement.id ? 'Deleting...' : 'Delete'}
                    </button>
                  </div>
                )}
              </div>
              {achievement.achievement_type && (
                <span className={`inline-block px-2 py-1 text-xs rounded mt-2 ${getAchievementTypeColor(achievement.achievement_type)}`}>
                  {getAchievementTypeLabel(achievement.achievement_type)}
                </span>
              )}
              {achievement.year && (
                <p className="text-sm text-gray-500 mt-2">{achievement.year}</p>
              )}
              {achievement.description && (
                <p className="text-sm text-gray-700 mt-2">{achievement.description}</p>
              )}
              {achievement.url && (
                <a 
                  href={achievement.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-sm text-blue-600 hover:underline mt-2 inline-block"
                >
                  View more
                </a>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}