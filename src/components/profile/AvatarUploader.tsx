'use client';

import { useState } from 'react';
import { AvatarEditor } from 'react-avatar-editor';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { toast } from 'react-hot-toast';

export default function AvatarUploader() {
  const { user } = useAuth();
  const [image, setImage] = useState<File | null>(null);
  const [showEditor, setShowEditor] = useState(false);
  const [editor, setEditor] = useState<AvatarEditor | null>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
      setShowEditor(true);
    }
  };

  const handleSave = async () => {
    if (!editor || !user) return;

    try {
      // Get the cropped image as a blob
      const canvas = editor.getImageScaledToCanvas();
      const croppedBlob = await new Promise<Blob>((resolve) => {
        canvas.toBlob((blob) => {
          if (blob) resolve(blob);
        }, 'image/jpeg', 0.9);
      });

      // Generate a unique filename
      const filename = `avatars/${user.id}/${Date.now()}.jpg`;

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filename, croppedBlob, {
          cacheControl: '3600',
          upsert: true,
        });

      if (uploadError) throw uploadError;

      // Get the public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filename);

      // Update the profile with the new avatar URL
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          avatar_url: publicUrl,
          avatar_bucket: 'avatars',
          avatar_path: filename,
          avatar_version: Date.now().toString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (updateError) throw updateError;

      toast.success('Profile picture updated successfully!');
      setShowEditor(false);
      setImage(null);
    } catch (error) {
      toast.error('Failed to update profile picture');
      console.error('Error updating profile picture:', error);
    }
  };

  return (
    <div className="space-y-4">
      <input
        type="file"
        accept="image/*"
        onChange={handleImageChange}
        className="hidden"
        id="avatar-upload-trigger"
      />
      <div className="flex items-center space-x-4">
        <label
          htmlFor="avatar-upload-trigger"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 cursor-pointer"
        >
          Upload Photo
        </label>
      </div>

      {showEditor && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">Crop Profile Picture</h3>
              <button
                onClick={() => {
                  setShowEditor(false);
                  setImage(null);
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                Close
              </button>
            </div>

            <div className="relative w-full h-96">
              <AvatarEditor
                ref={(ref) => setEditor(ref)}
                image={image}
                width={400}
                height={400}
                border={50}
                color={[255, 255, 255, 0.6]}
                scale={1.2}
                rotate={0}
              />
            </div>

            <div className="mt-4 flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowEditor(false);
                  setImage(null);
                }}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-blue-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-blue-700"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
