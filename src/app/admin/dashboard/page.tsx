'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { 
  FaUsers, FaUserGraduate, FaBriefcase, FaCalendarAlt, 
  FaHandshake, FaChartBar, FaBell, FaCog 
} from 'react-icons/fa';

export default function AdminDashboardPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalAlumni: 0,
    verifiedAlumni: 0,
    totalJobs: 0,
    totalEvents: 0,
    pendingVerifications: 0,
    mentorshipRelationships: 0
  });
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    async function checkAdminStatus() {
      if (!user) return;

      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('is_admin')
          .eq('id', user.id)
          .single();

        if (error) throw error;
        setIsAdmin(data?.is_admin || false);

        if (!data?.is_admin) {
          router.push('/unauthorized');
        } else {
          fetchDashboardStats();
        }
      } catch (error) {
        console.error('Error checking admin status:', error);
        router.push('/unauthorized');
      }
    }

    async function fetchDashboardStats() {
      try {
        // These would be real DB queries in a production environment
        // For demo purposes, we're using mock data
        
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // Mock stats data
        setStats({
          totalAlumni: 5287,
          verifiedAlumni: 4192,
          totalJobs: 342,
          totalEvents: 124,
          pendingVerifications: 47,
          mentorshipRelationships: 312
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    }

    checkAdminStatus();
  }, [user, router]);

  return (
    <ProtectedRoute adminOnly>
      <div className="container mx-auto py-8 px-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="mt-1 text-lg text-gray-600">
              Overview and management of the AMET Alumni platform
            </p>
          </div>
          <div className="mt-4 md:mt-0 flex gap-2">
            <Button 
              variant="outline" 
              className="flex items-center gap-1"
              onClick={() => router.push('/admin/notifications')}
            >
              <FaBell className="h-4 w-4" />
              <span>Notifications</span>
            </Button>
            <Button 
              className="flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white"
              onClick={() => router.push('/admin/settings')}
            >
              <FaCog className="h-4 w-4" />
              <span>Settings</span>
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <>
            {/* Key Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
              <StatCard 
                title="Total Alumni" 
                value={stats.totalAlumni.toLocaleString()} 
                description={`${stats.verifiedAlumni.toLocaleString()} verified`}
                icon={<FaUserGraduate className="h-8 w-8 text-blue-500" />}
                color="blue"
              />
              <StatCard 
                title="Jobs Posted" 
                value={stats.totalJobs.toLocaleString()} 
                description="Active job listings"
                icon={<FaBriefcase className="h-8 w-8 text-green-500" />}
                color="green"
              />
              <StatCard 
                title="Upcoming Events" 
                value={stats.totalEvents.toLocaleString()} 
                description="Scheduled events"
                icon={<FaCalendarAlt className="h-8 w-8 text-purple-500" />}
                color="purple"
              />
            </div>

            {/* Quick Actions */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4 text-gray-900">Actions Required</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <ActionCard 
                  title="Pending Verifications" 
                  value={stats.pendingVerifications} 
                  href="/admin/verifications"
                  color="orange"
                />
                <ActionCard 
                  title="Unread Reports" 
                  value={12} 
                  href="/admin/reports"
                  color="red"
                />
                <ActionCard 
                  title="Content for Review" 
                  value={8} 
                  href="/admin/content/review"
                  color="blue"
                />
              </div>
            </div>

            {/* Admin Sections */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FaUsers className="h-5 w-5 text-blue-600" />
                    User Management
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <Button variant="outline" className="justify-start" onClick={() => router.push('/admin/users')}>
                      User Accounts
                    </Button>
                    <Button variant="outline" className="justify-start" onClick={() => router.push('/admin/roles')}>
                      Roles & Permissions
                    </Button>
                    <Button variant="outline" className="justify-start" onClick={() => router.push('/admin/verify-profiles')}>
                      Verify Alumni
                    </Button>
                    <Button variant="outline" className="justify-start" onClick={() => router.push('/admin/users/analytics')}>
                      User Analytics
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FaHandshake className="h-5 w-5 text-green-600" />
                    Mentorship Management
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <Button variant="outline" className="justify-start" onClick={() => router.push('/admin/mentorship/programs')}>
                      Programs
                    </Button>
                    <Button variant="outline" className="justify-start" onClick={() => router.push('/admin/mentorship/mentors')}>
                      Mentors
                    </Button>
                    <Button variant="outline" className="justify-start" onClick={() => router.push('/admin/mentorship/matching')}>
                      Matching
                    </Button>
                    <Button variant="outline" className="justify-start" onClick={() => router.push('/admin/mentorship/analytics')}>
                      Performance
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FaBriefcase className="h-5 w-5 text-purple-600" />
                    Jobs & Careers
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <Button variant="outline" className="justify-start" onClick={() => router.push('/admin/jobs')}>
                      Job Listings
                    </Button>
                    <Button variant="outline" className="justify-start" onClick={() => router.push('/admin/jobs/employers')}>
                      Employers
                    </Button>
                    <Button variant="outline" className="justify-start" onClick={() => router.push('/admin/jobs/applications')}>
                      Applications
                    </Button>
                    <Button variant="outline" className="justify-start" onClick={() => router.push('/admin/jobs/analytics')}>
                      Job Analytics
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FaChartBar className="h-5 w-5 text-indigo-600" />
                    System Management
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <Button variant="outline" className="justify-start" onClick={() => router.push('/admin/settings')}>
                      System Settings
                    </Button>
                    <Button variant="outline" className="justify-start" onClick={() => router.push('/admin/analytics')}>
                      Platform Analytics
                    </Button>
                    <Button variant="outline" className="justify-start" onClick={() => router.push('/admin/logs')}>
                      Activity Logs
                    </Button>
                    <Button variant="outline" className="justify-start" onClick={() => router.push('/admin/import-export')}>
                      Import/Export
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </>
        )}
      </div>
    </ProtectedRoute>
  );
}

function StatCard({ title, value, description, icon, color }: { 
  title: string; 
  value: string; 
  description: string; 
  icon: React.ReactNode;
  color: 'blue' | 'green' | 'purple' | 'orange' | 'red';
}) {
  const colorClasses = {
    blue: 'bg-blue-50 border-blue-200',
    green: 'bg-green-50 border-green-200',
    purple: 'bg-purple-50 border-purple-200',
    orange: 'bg-orange-50 border-orange-200',
    red: 'bg-red-50 border-red-200',
  };

  return (
    <div className={`${colorClasses[color]} rounded-lg border p-4 flex items-center`}>
      <div className="mr-4">{icon}</div>
      <div>
        <p className="text-sm font-medium text-gray-500">{title}</p>
        <h3 className="text-2xl font-bold text-gray-900">{value}</h3>
        <p className="text-xs text-gray-500">{description}</p>
      </div>
    </div>
  );
}

function ActionCard({ title, value, href, color }: { 
  title: string; 
  value: number;
  href: string;
  color: 'blue' | 'green' | 'purple' | 'orange' | 'red';
}) {
  const colorClasses = {
    blue: 'bg-blue-50 hover:bg-blue-100 border-blue-200',
    green: 'bg-green-50 hover:bg-green-100 border-green-200',
    purple: 'bg-purple-50 hover:bg-purple-100 border-purple-200',
    orange: 'bg-orange-50 hover:bg-orange-100 border-orange-200',
    red: 'bg-red-50 hover:bg-red-100 border-red-200',
  };

  const textClasses = {
    blue: 'text-blue-600',
    green: 'text-green-600',
    purple: 'text-purple-600',
    orange: 'text-orange-600',
    red: 'text-red-600',
  };

  return (
    <Link href={href}>
      <div className={`${colorClasses[color]} rounded-lg border p-4 flex justify-between items-center hover:shadow-md transition-shadow cursor-pointer`}>
        <h3 className="font-medium">{title}</h3>
        <div className={`${textClasses[color]} font-bold text-lg rounded-full bg-white h-8 w-8 flex items-center justify-center shadow-sm`}>
          {value}
        </div>
      </div>
    </Link>
  );
} 