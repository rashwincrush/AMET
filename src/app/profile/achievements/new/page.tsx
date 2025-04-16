"use client";

import { useRouter } from 'next/navigation';
import AchievementForm from '@/components/achievements/AchievementForm';

export default function NewAchievementPage() {
  const router = useRouter();
  
  const handleSuccess = () => {
    router.push('/profile/achievements');
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Add New Achievement</h1>
      <AchievementForm onSuccess={handleSuccess} />
    </div>
  );
}
