'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';
import PublicPageWrapper from '@/components/auth/PublicPageWrapper';
import EnhancedPageHeader from '@/components/ui/EnhancedPageHeader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { FaBriefcase, FaBuilding, FaMapMarkerAlt, FaRegClock, FaFilter, FaChevronLeft, FaChevronRight, FaBell, FaPlus, FaSearch, FaGraduationCap } from 'react-icons/fa';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

type Job = {
  id: string;
  title: string;
  company: string;
  location: string;
  description: string;
  requirements: string;
  salary_range?: string;
  job_type: 'full-time' | 'part-time' | 'contract' | 'internship' | 'remote';
  experience_level: 'entry' | 'mid' | 'senior' | 'executive';
  application_url?: string;
  contact_email?: string;
  posted_by: string;
  created_at: string;
  expires_at: string;
  is_active: boolean;
};

// Simple JobsContent component
function JobsContent() {
  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <EnhancedPageHeader
        title="Alumni Job Board"
        description="Find career opportunities shared by fellow alumni and industry partners"
        icon={<FaBriefcase className="h-6 w-6 text-blue-500" />}
        background="light"
        actions={
          <div className="flex gap-3">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Link href="/jobs/alerts">
                    <Button variant="outline" className="border-blue-600 text-blue-600">
                      <FaBell className="mr-2 h-4 w-4" />
                      Job Alerts
                    </Button>
                  </Link>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Get notified about new job postings</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Link href="/jobs/create">
                    <Button className="bg-blue-600 hover:bg-blue-700 text-white font-bold">
                      <FaPlus className="mr-2 h-4 w-4" />
                      Post a Job
                    </Button>
                  </Link>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Share a job opportunity with the alumni community</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        }
      />
      <div className="mt-8">
        <p className="text-center text-gray-500">
          Job listings will appear here when available.
        </p>
      </div>
    </div>
  );
}

// Simple JobsPreview component
function JobsPreview() {
    
    return (
      <div className="space-y-6">
        <h3 className="text-xl font-semibold">Featured Job Opportunities</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="overflow-hidden hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-xl">Software Engineer</CardTitle>
                  <CardDescription className="flex items-center mt-1">
                    <FaBuilding className="mr-1" /> AMET Tech
                  </CardDescription>
                </div>
                <Badge className="bg-green-100 text-green-800 hover:bg-green-200">
                  Full Time
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="pb-2">
              <div className="flex items-center text-sm text-gray-500 mb-2">
                <FaMapMarkerAlt className="mr-1" /> Chennai • Posted Today
              </div>
              <p className="text-sm line-clamp-2">Join our team as a software engineer working on cutting-edge technologies...</p>
            </CardContent>
            <CardFooter className="pt-0">
              <Button variant="outline" className="w-full" disabled>
                Sign in to view details
              </Button>
            </CardFooter>
          </Card>
          <Card className="overflow-hidden hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-xl">Product Manager</CardTitle>
                  <CardDescription className="flex items-center mt-1">
                    <FaBuilding className="mr-1" /> AMET Innovations
                  </CardDescription>
                </div>
                <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200">
                  Remote
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="pb-2">
              <div className="flex items-center text-sm text-gray-500 mb-2">
                <FaMapMarkerAlt className="mr-1" /> Remote • Posted Yesterday
              </div>
              <p className="text-sm line-clamp-2">Looking for an experienced product manager to lead our new initiative...</p>
            </CardContent>
            <CardFooter className="pt-0">
              <Button variant="outline" className="w-full" disabled>
                Sign in to view details
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    );
}

export default function JobsPage() {
  // Simple stats for the page
  const stats = [
    { label: 'Active Jobs', value: '24' },
    { label: 'Companies Hiring', value: '12' },
    { label: 'Success Rate', value: '78%' }
  ];

  return (
    <PublicPageWrapper
      title="AMET Alumni Job Board"
      description="Connect with job opportunities specifically for our AMET alumni community. Find positions posted by fellow alumni and industry partners."
      ctaText="Sign in to access all job opportunities, post jobs, and set up job alerts."
      stats={stats}
      previewComponent={<JobsPreview />}
    >
      <JobsContent />
    </PublicPageWrapper>
  );
}