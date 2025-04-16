"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Calendar } from '@/components/ui/calendar';

export default function MentorshipAnalyticsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // Check if user is admin
  useEffect(() => {
    async function checkAdminStatus() {
      if (!user) {
        router.push('/login');
        return;
      }

      try {
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('is_admin')
          .eq('id', user.id)
          .single();

        if (error) throw error;

        if (!profile || !profile.is_admin) {
          toast.error('You do not have permission to access this page');
          router.push('/mentorship');
          return;
        }

        setIsAdmin(true);
      } catch (error: any) {
        console.error('Error checking admin status:', error.message);
        toast.error('An error occurred while checking permissions');
      } finally {
        setLoading(false);
      }
    }

    checkAdminStatus();
  }, [user, router]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-200px)]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900" />
      </div>
    );
  }

  if (!isAdmin) {
    return null; // Already redirecting
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Mentorship Analytics</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Total Mentors</CardTitle>
            <CardDescription>Active mentors in the system</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">--</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Total Mentees</CardTitle>
            <CardDescription>Active mentees seeking guidance</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">--</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Active Relationships</CardTitle>
            <CardDescription>Current mentorship connections</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">--</p>
          </CardContent>
        </Card>
      </div>
      
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Meeting Activity</CardTitle>
          <CardDescription>Overview of mentorship meetings</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80 flex items-center justify-center border rounded">
            <p className="text-muted-foreground">Activity chart will be displayed here</p>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Mentorship Program Performance</CardTitle>
          <CardDescription>Metrics by program</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80 flex items-center justify-center border rounded">
            <p className="text-muted-foreground">Program performance metrics will be displayed here</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 