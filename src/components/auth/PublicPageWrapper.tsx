'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/auth';

type StatItem = {
  value: string;
  label: string;
};

type PublicPageWrapperProps = {
  title: string;
  description: string;
  ctaText: string;
  stats?: StatItem[];
  previewComponent: React.ReactNode;
  children: React.ReactNode;
};

export default function PublicPageWrapper({
  title,
  description,
  ctaText,
  stats = [],
  previewComponent,
  children
}: PublicPageWrapperProps) {
  const router = useRouter();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  // If user is authenticated, show the main content
  if (user) {
    return <>{children}</>;
  }
  
  // If user is not authenticated, show the public preview
  return (
    <div className="bg-white">
      <div className="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl sm:tracking-tight lg:text-6xl">
            {title}
          </h1>
          <p className="mt-5 max-w-xl mx-auto text-xl text-gray-500">
            {description}
          </p>
        </div>
        
        {/* Preview component */}
        <div className="mt-12">
          {previewComponent}
        </div>
        
        {/* Stats - Only show if stats array has items */}
        {stats.length > 0 && (
          <div className="mt-16">
            <div className="max-w-7xl mx-auto py-12">
              <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
                {stats.map((stat, index) => (
                  <div key={index} className="text-center">
                    <p className="text-4xl font-extrabold text-blue-600">{stat.value}</p>
                    <p className="mt-2 text-lg font-medium text-gray-500">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
        
        {/* CTA */}
        <div className="mt-10 text-center">
          <p className="text-xl font-medium text-gray-900 mb-6">
            {ctaText}
          </p>
          <div className="space-x-4">
            <Link href="/auth/login">
              <Button size="lg" className="px-8">
                Sign In
              </Button>
            </Link>
            <Link href="/auth/signup">
              <Button variant="outline" size="lg" className="px-8">
                Create Account
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
} 