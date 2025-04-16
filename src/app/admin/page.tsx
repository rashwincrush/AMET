'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from '@/components/ui/card';
import { AlertCircle, BarChart, Calendar, FileText, MessageSquare, User, Users } from 'lucide-react';

interface DashboardStats {
  totalUsers: number;
  newUsersThisMonth: number;
  totalEvents: number;
  upcomingEvents: number;
  totalJobs: number;
  activeJobs: number;
  totalForumTopics: number;
  totalForumPosts: number;
}

interface RecentActivity {
  id: string;
  type: 'user_join' | 'event_created' | 'job_posted' | 'forum_post';
  title: string;
  description: string;
  timestamp: string;
  userId?: string;
  userEmail?: string;
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    newUsersThisMonth: 0,
    totalEvents: 0,
    upcomingEvents: 0,
    totalJobs: 0,
    activeJobs: 0,
    totalForumTopics: 0,
    totalForumPosts: 0
  });
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [visibleSections, setVisibleSections] = useState({
    users: false,
    events: false,
    jobs: false,
    forum: false,
    quickActions: false,
    pendingItems: false
  });

  useEffect(() => {
    const checkUserRole = async () => {
      if (!user) return;
      
      try {
        const { data, error } = await supabase
          .from('user_roles')
          .select('role_id, roles(name)')
          .eq('user_id', user.id);
          
        if (error) throw error;
        
        const adminRole = data?.find(role => role.roles && typeof role.roles === 'object' && 'name' in role.roles && role.roles.name === 'admin');
        setIsAdmin(!!adminRole);
        
        if (data && data.length > 0 && data[0].roles && typeof data[0].roles === 'object' && 'name' in data[0].roles) {
          const roleName = String(data[0].roles.name);
          setUserRole(roleName);
        }
        
        if (adminRole) {
          await Promise.all([
            fetchStats(),
            fetchRecentActivity()
          ]);
        }
      } catch (error) {
        console.error('Error checking user role:', error);
        setError('Failed to verify your admin privileges');
      } finally {
        setLoading(false);
      }
    };

    checkUserRole();
  }, [user]);

  const fetchStats = async () => {
    try {
      const now = new Date();
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

      const [usersRes, eventsRes, jobsRes, topicsRes, postsRes] = await Promise.all([
        supabase.from('profiles').select('created_at'),
        supabase.from('events').select('start_date'),
        supabase.from('jobs').select('status'),
        supabase.from('forum_topics').select('id'),
        supabase.from('forum_posts').select('id')
      ]);

      const newUsers = (usersRes.data || []).filter(user => 
        new Date(user.created_at) >= monthStart
      );

      const upcomingEvents = (eventsRes.data || []).filter(event => 
        new Date(event.start_date) >= now
      );

      const activeJobs = (jobsRes.data || []).filter(job => 
        job.status === 'active'
      );

      setStats({
        totalUsers: usersRes.data?.length || 0,
        newUsersThisMonth: newUsers.length,
        totalEvents: eventsRes.data?.length || 0,
        upcomingEvents: upcomingEvents.length,
        totalJobs: jobsRes.data?.length || 0,
        activeJobs: activeJobs.length,
        totalForumTopics: topicsRes.data?.length || 0,
        totalForumPosts: postsRes.data?.length || 0
      });

      setVisibleSections({
        users: true,
        events: true,
        jobs: true,
        forum: true,
        quickActions: true,
        pendingItems: true
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
      setError('Failed to load dashboard statistics');
    }
  };

  const fetchRecentActivity = async () => {
    try {
      const [usersRes, eventsRes, jobsRes, postsRes] = await Promise.all([
        supabase.from('profiles')
          .select('id, email, created_at')
          .order('created_at', { ascending: false })
          .limit(5),
        
        supabase.from('events')
          .select('id, title, description, created_at, created_by')
          .order('created_at', { ascending: false })
          .limit(5),
        
        supabase.from('jobs')
          .select('id, title, created_at, posted_by')
          .order('created_at', { ascending: false })
          .limit(5),
        
        supabase.from('forum_posts')
          .select('id, content, created_at, user_id')
          .order('created_at', { ascending: false })
          .limit(5)
      ]);

      const activity: RecentActivity[] = [
        ...(usersRes.data?.map(user => ({
          id: `user-${user.id}`,
          type: 'user_join' as const,
          title: 'New User Registration',
          description: user.email,
          timestamp: user.created_at,
          userId: user.id,
          userEmail: user.email
        })) || []),
        
        ...(eventsRes.data?.map(event => ({
          id: `event-${event.id}`,
          type: 'event_created' as const,
          title: 'New Event Created',
          description: event.title,
          timestamp: event.created_at,
          userId: event.created_by
        })) || []),
        
        ...(jobsRes.data?.map(job => ({
          id: `job-${job.id}`,
          type: 'job_posted' as const,
          title: 'New Job Posted',
          description: job.title,
          timestamp: job.created_at,
          userId: job.posted_by
        })) || []),
        
        ...(postsRes.data?.map(post => ({
          id: `post-${post.id}`,
          type: 'forum_post' as const,
          title: 'New Forum Post',
          description: post.content.substring(0, 50) + (post.content.length > 50 ? '...' : ''),
          timestamp: post.created_at,
          userId: post.user_id
        })) || [])
      ];

      activity.sort((a, b) => 
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );

      setRecentActivity(activity.slice(0, 10));
    } catch (error) {
      console.error('Error fetching recent activity:', error);
      setError('Failed to load recent activity');
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'user_join':
        return <User className="h-5 w-5 text-blue-500" />;
      case 'event_created':
        return <Calendar className="h-5 w-5 text-green-500" />;
      case 'job_posted':
        return <FileText className="h-5 w-5 text-purple-500" />;
      case 'forum_post':
        return <MessageSquare className="h-5 w-5 text-amber-500" />;
      default:
        return <AlertCircle className="h-5 w-5 text-gray-500" />;
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6 flex justify-center items-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-lg font-medium">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="container mx-auto p-6">
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="text-red-800">Access Denied</CardTitle>
            <CardDescription className="text-red-600">
              You do not have permission to access the admin dashboard.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={() => router.push('/')} 
              variant="outline" 
              className="mt-2"
            >
              Return to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="text-red-800">Error</CardTitle>
            <CardDescription className="text-red-600">
              {error}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={() => {
                setLoading(true);
                setError(null);
                Promise.all([fetchStats(), fetchRecentActivity()])
                  .finally(() => setLoading(false));
              }} 
              variant="outline" 
              className="mt-2"
            >
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-gray-600">Welcome back! Here's an overview of your system.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => router.push('/admin/roles-dashboard')}>
            Roles Dashboard
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {visibleSections.users && (
          <Card className="bg-blue-50 border-blue-100">
            <CardHeader className="pb-2">
              <CardTitle className="text-blue-800 flex items-center">
                <Users className="mr-2 h-5 w-5" />
                Users
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalUsers}</div>
              <p className="text-sm text-blue-600">
                {stats.newUsersThisMonth} new this month
              </p>
            </CardContent>
          </Card>
        )}

        {visibleSections.events && (
          <Card className="bg-green-50 border-green-100">
            <CardHeader className="pb-2">
              <CardTitle className="text-green-800 flex items-center">
                <Calendar className="mr-2 h-5 w-5" />
                Events
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalEvents}</div>
              <p className="text-sm text-green-600">
                {stats.upcomingEvents} upcoming
              </p>
            </CardContent>
          </Card>
        )}

        {visibleSections.jobs && (
          <Card className="bg-purple-50 border-purple-100">
            <CardHeader className="pb-2">
              <CardTitle className="text-purple-800 flex items-center">
                <FileText className="mr-2 h-5 w-5" />
                Jobs
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalJobs}</div>
              <p className="text-sm text-purple-600">
                {stats.activeJobs} active listings
              </p>
            </CardContent>
          </Card>
        )}

        {visibleSections.forum && (
          <Card className="bg-amber-50 border-amber-100">
            <CardHeader className="pb-2">
              <CardTitle className="text-amber-800 flex items-center">
                <MessageSquare className="mr-2 h-5 w-5" />
                Forum
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalForumPosts}</div>
              <p className="text-sm text-amber-600">
                {stats.totalForumTopics} topics
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>
                The latest actions across the platform
              </CardDescription>
            </CardHeader>
            <CardContent>
              {recentActivity.length > 0 ? (
                <ul className="space-y-4">
                  {recentActivity.map((activity) => (
                    <li key={activity.id} className="flex items-start gap-3 pb-3 border-b last:border-0">
                      <div className="mt-1">
                        {getActivityIcon(activity.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium">{activity.title}</p>
                        <p className="text-sm text-gray-600 truncate">
                          {activity.description}
                        </p>
                        <p className="text-xs text-gray-400">
                          {new Date(activity.timestamp).toLocaleString()}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500 text-center py-4">
                  No recent activity to display
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>Admin Actions</CardTitle>
              <CardDescription>
                Quick access to common administrative tasks
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <Link href="/admin/users" className="block">
                <Button className="w-full justify-start">
                  <Users className="mr-2 h-4 w-4" />
                  Manage Users
                </Button>
              </Link>
              <Link href="/admin/roles" className="block">
                <Button className="w-full justify-start" variant="outline">
                  <Users className="mr-2 h-4 w-4" />
                  Manage Roles
                </Button>
              </Link>
              <Link href="/admin/users/roles" className="block">
                <Button className="w-full justify-start" variant="outline">
                  <Users className="mr-2 h-4 w-4" />
                  Assign User Roles
                </Button>
              </Link>
              <Link href="/admin/events" className="block">
                <Button className="w-full justify-start" variant="outline">
                  <Calendar className="mr-2 h-4 w-4" />
                  Manage Events
                </Button>
              </Link>
              <Link href="/admin/jobs" className="block">
                <Button className="w-full justify-start" variant="outline">
                  <FileText className="mr-2 h-4 w-4" />
                  Manage Jobs
                </Button>
              </Link>
              <Link href="/admin/analytics" className="block">
                <Button className="w-full justify-start" variant="outline">
                  <BarChart className="mr-2 h-4 w-4" />
                  View Analytics
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}