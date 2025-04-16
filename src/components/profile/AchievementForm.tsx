'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';

type Achievement = {
  id?: string;
  title: string;
  description: string;
  year: number | null;
  url?: string;
  achievement_type?: 'professional' | 'academic' | 'personal' | 'other';
};

type AchievementFormProps = {
  profileId: string;
  achievement?: Achievement;
  onSuccess: () => void;
  onCancel: () => void;
};

export default function AchievementForm({
  profileId,
  achievement,
  onSuccess,
  onCancel,
}: AchievementFormProps) {
  const isEditing = !!achievement?.id;
  
  const [title, setTitle] = useState(achievement?.title || '');
  const [description, setDescription] = useState(achievement?.description || '');
  const [year, setYear] = useState<string>(achievement?.year?.toString() || '');
  const [url, setUrl] = useState(achievement?.url || '');
  const [achievementType, setAchievementType] = useState<'professional' | 'academic' | 'personal' | 'other'>(achievement?.achievement_type || 'professional');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 50 }, (_, i) => currentYear - i);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const achievementData = {
        profile_id: profileId,
        title,
        description,
        year: year ? parseInt(year) : null,
        url: url || null,
        achievement_type: achievementType,
      };

      if (isEditing && achievement?.id) {
        // Update existing achievement
        const { error } = await supabase
          .from('achievements')
          .update(achievementData)
          .eq('id', achievement.id);

        if (error) throw error;
      } else {
        // Create new achievement
        const { error } = await supabase
          .from('achievements')
          .insert(achievementData);

        if (error) throw error;
      }

      onSuccess();
    } catch (err: any) {
      console.error('Error saving achievement:', err);
      setError(err.message || 'Failed to save achievement. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white p-4 border rounded-md shadow-sm">
      <h3 className="text-lg font-medium text-gray-900 mb-4">
        {isEditing ? 'Edit Achievement' : 'Add New Achievement'}
      </h3>
      
      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-4">
          <div className="flex">
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
            Title *
          </label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            required
          />
        </div>
        
        <div className="mb-4">
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
            Description *
          </label>
          <textarea
            id="description"
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            required
          />
        </div>
        
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 mb-4">
          <div>
            <label htmlFor="year" className="block text-sm font-medium text-gray-700 mb-1">
              Year
            </label>
            <select
              id="year"
              value={year}
              onChange={(e) => setYear(e.target.value)}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            >
              <option value="">Select Year</option>
              {yearOptions.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label htmlFor="achievementType" className="block text-sm font-medium text-gray-700 mb-1">
              Type *
            </label>
            <select
              id="achievementType"
              value={achievementType}
              onChange={(e) => setAchievementType(e.target.value as 'professional' | 'academic' | 'personal' | 'other')}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              required
            >
              <option value="professional">Professional</option>
              <option value="academic">Academic</option>
              <option value="personal">Personal</option>
              <option value="other">Other</option>
            </select>
          </div>
        </div>
        
        <div className="mb-4">
          <label htmlFor="url" className="block text-sm font-medium text-gray-700 mb-1">
            URL (Optional)
          </label>
          <input
            type="url"
            id="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://example.com"
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
          <p className="mt-1 text-xs text-gray-500">
            Link to more information about this achievement (e.g., project page, award announcement)
          </p>
        </div>
        
        <div className="flex justify-end space-x-3">
          <Button
            type="button"
            onClick={onCancel}
            variant="outline"
            className="text-sm"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting || !title || !description}
            className="text-sm"
          >
            {isSubmitting ? 'Saving...' : isEditing ? 'Update Achievement' : 'Add Achievement'}
          </Button>
        </div>
      </form>
    </div>
  );
}