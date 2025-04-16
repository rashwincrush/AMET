"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { CalendarIcon, LinkIcon, ImageIcon, Loader2 } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface Achievement {
  id?: string;
  title: string;
  description: string;
  date: string | null;
  url: string | null;
  image_url: string | null;
  is_approved?: boolean;
}

interface AchievementFormProps {
  achievement?: Achievement;
  onSuccess?: (achievement: Achievement) => void;
  onCancel?: () => void;
}

export default function AchievementForm({ achievement, onSuccess, onCancel }: AchievementFormProps) {
  const router = useRouter();
  const isEditing = !!achievement?.id;
  
  const [formData, setFormData] = useState<Achievement>({
    title: '',
    description: '',
    date: null,
    url: null,
    image_url: null
  });
  
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // Initialize form with achievement data if editing
  useEffect(() => {
    if (achievement) {
      setFormData({
        ...achievement,
        date: achievement.date || null,
        url: achievement.url || null,
        image_url: achievement.image_url || null
      });
    }
  }, [achievement]);
  
  // Handle form input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };
  
  // Validate form
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }
    
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }
    
    if (formData.url && !/^https?:\/\/.+/.test(formData.url)) {
      newErrors.url = 'URL must start with http:// or https://';
    }
    
    if (formData.image_url && !/^https?:\/\/.+/.test(formData.image_url)) {
      newErrors.image_url = 'Image URL must start with http:// or https://';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    
    try {
      let response;
      
      if (isEditing) {
        // Update existing achievement
        response = await fetch(`/api/achievements/${achievement.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(formData)
        });
      } else {
        // Create new achievement
        response = await fetch('/api/achievements', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(formData)
        });
      }
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save achievement');
      }
      
      const data = await response.json();
      
      toast.success(
        isEditing ? 'Achievement updated successfully' : 'Achievement created successfully'
      );
      
      // Call onSuccess callback if provided
      if (onSuccess) {
        onSuccess(data.achievement);
      } else {
        // Otherwise, redirect to achievements page
        router.push('/profile/achievements');
        router.refresh();
      }
    } catch (error: any) {
      console.error('Error saving achievement:', error);
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>{isEditing ? 'Edit Achievement' : 'Add New Achievement'}</CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title <span className="text-red-500">*</span></Label>
            <Input
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Achievement title"
              className={errors.title ? 'border-red-500' : ''}
            />
            {errors.title && <p className="text-sm text-red-500">{errors.title}</p>}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Description <span className="text-red-500">*</span></Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe your achievement"
              rows={4}
              className={errors.description ? 'border-red-500' : ''}
            />
            {errors.description && <p className="text-sm text-red-500">{errors.description}</p>}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="date" className="flex items-center">
              <CalendarIcon className="w-4 h-4 mr-2" />
              Date
            </Label>
            <Input
              id="date"
              name="date"
              type="date"
              value={formData.date || ''}
              onChange={handleChange}
              placeholder="Date of achievement"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="url" className="flex items-center">
              <LinkIcon className="w-4 h-4 mr-2" />
              Related URL
            </Label>
            <Input
              id="url"
              name="url"
              type="url"
              value={formData.url || ''}
              onChange={handleChange}
              placeholder="https://example.com"
              className={errors.url ? 'border-red-500' : ''}
            />
            {errors.url && <p className="text-sm text-red-500">{errors.url}</p>}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="image_url" className="flex items-center">
              <ImageIcon className="w-4 h-4 mr-2" />
              Image URL
            </Label>
            <Input
              id="image_url"
              name="image_url"
              type="url"
              value={formData.image_url || ''}
              onChange={handleChange}
              placeholder="https://example.com/image.jpg"
              className={errors.image_url ? 'border-red-500' : ''}
            />
            {errors.image_url && <p className="text-sm text-red-500">{errors.image_url}</p>}
          </div>
          
          {!isEditing && (
            <div className="bg-blue-50 p-4 rounded-md">
              <p className="text-sm text-blue-700">
                Your achievement will be reviewed by an administrator before it appears on your public profile.
              </p>
            </div>
          )}
        </CardContent>
        
        <CardFooter className="flex justify-end space-x-2">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel || (() => router.back())}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {isEditing ? 'Update' : 'Save'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
