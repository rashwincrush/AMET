'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, CalendarDays, Users, Clock, Award, ChevronRight, Calendar } from 'lucide-react';

export default function MentorDashboardPage() {
  const router = useRouter();
  const { user } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mentorStatus, setMentorStatus] = useState<'pending' | 'approved' | 'not_registered'>('not_registered');
  
  const [stats, setStats] = useState({
    totalSessions: 0,
    completedSessions: 0,
    upcomingSessions: 0,
    totalMentees: 0,
    totalHours: 0,
    averageRating: 0
  });
  
  const [upcomingSessions, setUpcomingSessions] = useState<any[]>([]);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;
    
    const checkMentorStatus = async () => {
      try {
        setLoading(true);
        
        const { data: mentorData, error: mentorError } = await supabase
          .from('mentors')
          .select('*')
          .eq('user_id', user.id)
          .single();
        
        if (mentorError && mentorError.code !== 'PGRST116') {
          throw mentorError;
        }
        
        if (mentorData) {
          setMentorStatus(mentorData.status);
          if (mentorData.status === 'approved') {
            fetchDashboardData();
          } else {
            setLoading(false);
          }
        } else {
          setMentorStatus('not_registered');
          setLoading(false);
        }
      } catch (error: any) {
        console.error('Error checking mentor status:', error.message);
        setError('Failed to check mentor status');
        setLoading(false);
      }
    };
    
    checkMentorStatus();
  }, [user]);
  
  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Get today's date at midnight
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayISOString = today.toISOString();
      
      // Fetch total sessions
      const { data: totalSessionsData, error: totalSessionsError } = await supabase
        .from('mentorship_sessions')
        .select('count')
        .eq('mentor_id', user?.id);
        
      if (totalSessionsError) throw totalSessionsError;
      
      // Fetch completed sessions
      const { data: completedSessionsData, error: completedSessionsError } = await supabase
        .from('mentorship_sessions')
        .select('count')
        .eq('mentor_id', user?.id)
        .eq('status', 'completed');
        
      if (completedSessionsError) throw completedSessionsError;
      
      // Fetch upcoming sessions
      const { data: upcomingSessionsData, error: upcomingSessionsError } = await supabase
        .from('mentorship_sessions')
        .select('count')
        .eq('mentor_id', user?.id)
        .eq('status', 'scheduled')
        .gte('session_date', todayISOString);
        
      if (upcomingSessionsError) throw upcomingSessionsError;
      
      // Fetch unique mentees
      const { data: totalMenteesData, error: totalMenteesError } = await supabase
        .from('mentorship_sessions')
        .select('mentee_id')
        .eq('mentor_id', user?.id)
        .is('cancelled_at', null);
        
      if (totalMenteesError) throw totalMenteesError;
      
      const uniqueMentees = new Set(totalMenteesData.map(session => session.mentee_id));
      
      // Calculate total mentoring hours
      const { data: hoursData, error: hoursError } = await supabase
        .from('mentorship_sessions')
        .select('start_time, end_time')
        .eq('mentor_id', user?.id)
        .eq('status', 'completed');
        
      if (hoursError) throw hoursError;
      
      let totalMinutes = 0;
      hoursData.forEach(session => {
        const startParts = session.start_time.split(':').map(Number);
        const endParts = session.end_time.split(':').map(Number);
        
        const startMinutes = startParts[0] * 60 + startParts[1];
        const endMinutes = endParts[0] * 60 + endParts[1];
        
        totalMinutes += endMinutes - startMinutes;
      });
      
      const totalHours = Math.round(totalMinutes / 60);
      
      // Fetch upcoming sessions details with mentee information
      const { data: detailedUpcomingSessions, error: detailedUpcomingSessionsError } = await supabase
        .from('mentorship_sessions')
        .select(`
          id,
          session_date,
          start_time,
          end_time,
          status,
          mentee_id,
          profiles(first_name, last_name, avatar_url)
        `)
        .eq('mentor_id', user?.id)
        .eq('status', 'scheduled')
        .gte('session_date', todayISOString)
        .order('session_date', { ascending: true })
        .order('start_time', { ascending: true })
        .limit(5);
        
      if (detailedUpcomingSessionsError) throw detailedUpcomingSessionsError;
      
      // Fetch recent activity (session status changes, new sessions, etc.)
      const { data: recentActivityData, error: recentActivityError } = await supabase
        .from('mentorship_sessions')
        .select(`
          id,
          session_date,
          status,
          created_at,
          updated_at,
          mentee_id,
          profiles(first_name, last_name, avatar_url)
        `)
        .eq('mentor_id', user?.id)
        .order('updated_at', { ascending: false })
        .limit(10);
        
      if (recentActivityError) throw recentActivityError;
      
      // Update state with all fetched data
      setStats({
        totalSessions: totalSessionsData[0].count,
        completedSessions: completedSessionsData[0].count,
        upcomingSessions: upcomingSessionsData[0].count,
        totalMentees: uniqueMentees.size,
        totalHours,
        averageRating: 4.5 // Placeholder for now
      });
      
      setUpcomingSessions(detailedUpcomingSessions);
      setRecentActivity(recentActivityData);
      
    } catch (error: any) {
      console.error('Error fetching dashboard data:', error.message);
      setError('Failed to fetch dashboard data');
    } finally {
      setLoading(false);
    }
  };
  
  // Format date for display
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { weekday: 'short', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };
  
  // Format time for display
  const formatTime = (timeString: string) => {
    return timeString.substring(0, 5);
  };
  
  // Get activity description based on status and timestamps
  const getActivityDescription = (session: any) => {
    const sessionDate = new Date(session.updated_at);
    const timeAgo = getTimeAgo(sessionDate);
    
    if (session.status === 'completed') {
      return `Session completed ${timeAgo}`;
    } else if (session.status === 'scheduled') {
      // If created_at and updated_at are close, this is a new session
      const createdAt = new Date(session.created_at);
      const updatedAt = new Date(session.updated_at);
      const timeDiff = Math.abs(updatedAt.getTime() - createdAt.getTime());
      
      if (timeDiff < 60000) { // less than a minute difference
        return `New session scheduled ${timeAgo}`;
      } else {
        return `Session updated ${timeAgo}`;
      }
    } else if (session.status === 'cancelled') {
      return `Session cancelled ${timeAgo}`;
    }
    
    return `Session status changed to ${session.status} ${timeAgo}`;
  };
  
  // Calculate time ago string
  const getTimeAgo = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSecs = Math.floor(diffMs / 1000);
    const diffMins = Math.floor(diffSecs / 60);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffDays > 0) {
      return diffDays === 1 ? 'yesterday' : `${diffDays} days ago`;
    } else if (diffHours > 0) {
      return diffHours === 1 ? '1 hour ago' : `${diffHours} hours ago`;
    } else if (diffMins > 0) {
      return diffMins === 1 ? '1 minute ago' : `${diffMins} minutes ago`;
    } else {
      return 'just now';
    }
  };
  
  // Render not registered state
  const renderNotRegistered = () => (
    <div className="bg-white rounded-lg shadow-sm p-8 text-center">
      <h2 className="text-2xl font-semibold mb-4">Become a Mentor</h2>
      <p className="text-gray-600 mb-6">
        You are not registered as a mentor yet. Join our mentorship program to help guide fellow alumni.
      </p>
      <Link href="/mentorship/become-mentor">
        <Button size="lg">Register as a Mentor</Button>
      </Link>
    </div>
  );
  
  // Render pending approval state
  const renderPendingApproval = () => (
    <div className="bg-white rounded-lg shadow-sm p-8 text-center">
      <h2 className="text-2xl font-semibold mb-4">Application Under Review</h2>
      <p className="text-gray-600 mb-6">
        Your mentor application is currently being reviewed. We'll notify you once it's approved.
      </p>
      <Button variant="outline" disabled>
        Application Pending
      </Button>
    </div>
  );
  
  // Render dashboard content
  const renderDashboard = () => (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Total Sessions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <CalendarDays className="h-5 w-5 text-gray-400 mr-2" />
              <span className="text-3xl font-bold">{stats.totalSessions}</span>
            </div>
            <p className="text-sm text-gray-500 mt-1">
              {stats.completedSessions} completed, {stats.upcomingSessions} upcoming
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Total Mentees</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <Users className="h-5 w-5 text-gray-400 mr-2" />
              <span className="text-3xl font-bold">{stats.totalMentees}</span>
            </div>
            <p className="text-sm text-gray-500 mt-1">
              Unique students mentored
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Mentoring Hours</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <Clock className="h-5 w-5 text-gray-400 mr-2" />
              <span className="text-3xl font-bold">{stats.totalHours}</span>
            </div>
            <p className="text-sm text-gray-500 mt-1">
              Total hours of mentoring
            </p>
          </CardContent>
        </Card>
      </div>
      
      {/* Main Content Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Upcoming Sessions */}
        <div className="md:col-span-2">
          <Card className="h-full">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div>
                <CardTitle>Upcoming Sessions</CardTitle>
                <CardDescription>Your next mentoring sessions</CardDescription>
              </div>
              <Link href="/mentorship/schedule">
                <Button variant="ghost" size="sm" className="gap-1">
                  View all <ChevronRight className="h-4 w-4" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              {upcomingSessions.length > 0 ? (
                <div className="space-y-4">
                  {upcomingSessions.map(session => (
                    <div key={session.id} className="flex items-center gap-4 p-3 rounded-lg hover:bg-gray-50">
                      <div className="flex-shrink-0">
                        {session.profiles?.avatar_url ? (
                          <img 
                            src={session.profiles.avatar_url} 
                            alt={`${session.profiles.first_name} ${session.profiles.last_name}`} 
                            className="h-10 w-10 rounded-full object-cover"
                          />
                        ) : (
                          <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                            <span className="text-sm font-medium text-gray-600">
                              {session.profiles?.first_name?.charAt(0)}{session.profiles?.last_name?.charAt(0)}
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium">
                          {session.profiles?.first_name} {session.profiles?.last_name}
                        </p>
                        <p className="text-sm text-gray-500">
                          {formatDate(session.session_date)} • {formatTime(session.start_time)} - {formatTime(session.end_time)}
                        </p>
                      </div>
                      <div className="flex-shrink-0">
                        <Link href={`/mentorship/sessions/${session.id}`}>
                          <Button variant="outline" size="sm">
                            View
                          </Button>
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Calendar className="h-12 w-12 mx-auto text-gray-400" />
                  <p className="mt-2">No upcoming sessions</p>
                  <Link href="/mentorship/schedule">
                    <Button variant="outline" className="mt-4">
                      Manage Availability
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        
        {/* Recent Activity */}
        <div className="md:col-span-1">
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Latest updates from your mentoring</CardDescription>
            </CardHeader>
            <CardContent>
              {recentActivity.length > 0 ? (
                <div className="space-y-4">
                  {recentActivity.map(activity => (
                    <div key={activity.id} className="flex gap-3 text-sm">
                      <div className="flex-shrink-0 mt-0.5">
                        {activity.profiles?.avatar_url ? (
                          <img 
                            src={activity.profiles.avatar_url} 
                            alt={`${activity.profiles.first_name}`}
                            className="h-8 w-8 rounded-full object-cover"
                          />
                        ) : (
                          <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                            <span className="text-xs font-medium text-gray-600">
                              {activity.profiles?.first_name?.charAt(0)}{activity.profiles?.last_name?.charAt(0)}
                            </span>
                          </div>
                        )}
                      </div>
                      <div>
                        <p>
                          <span className="font-medium">
                            {activity.profiles?.first_name} {activity.profiles?.last_name}
                          </span>
                          {' — '}
                          {getActivityDescription(activity)}
                        </p>
                        <p className="text-gray-500 text-xs mt-0.5">
                          {formatDate(activity.session_date)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p>No recent activity</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
      
      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link href="/mentorship/schedule">
          <Card className="hover:bg-gray-50 transition-colors cursor-pointer h-full">
            <CardContent className="p-6 flex flex-col items-center text-center">
              <CalendarDays className="h-8 w-8 text-primary mb-2" />
              <h3 className="font-medium">Manage Schedule</h3>
              <p className="text-sm text-gray-500">Update availability and sessions</p>
            </CardContent>
          </Card>
        </Link>
        
        <Link href="/mentorship/mentees">
          <Card className="hover:bg-gray-50 transition-colors cursor-pointer h-full">
            <CardContent className="p-6 flex flex-col items-center text-center">
              <Users className="h-8 w-8 text-primary mb-2" />
              <h3 className="font-medium">View Mentees</h3>
              <p className="text-sm text-gray-500">Manage your current mentees</p>
            </CardContent>
          </Card>
        </Link>
        
        <Link href="/mentorship/program">
          <Card className="hover:bg-gray-50 transition-colors cursor-pointer h-full">
            <CardContent className="p-6 flex flex-col items-center text-center">
              <Award className="h-8 w-8 text-primary mb-2" />
              <h3 className="font-medium">Program Details</h3>
              <p className="text-sm text-gray-500">Review mentorship guidelines</p>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
  
  return (
    <ProtectedRoute>
      <div className="container mx-auto py-8 px-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Mentor Dashboard</h1>
          <div className="flex gap-2">
            <Link href="/mentorship">
              <Button variant="outline">Mentorship Home</Button>
            </Link>
            {mentorStatus === 'approved' && (
              <Link href="/mentorship/schedule">
                <Button>Manage Schedule</Button>
              </Link>
            )}
          </div>
        </div>
        
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded mb-6">
            {error}
          </div>
        ) : (
          <>
            {mentorStatus === 'not_registered' && renderNotRegistered()}
            {mentorStatus === 'pending' && renderPendingApproval()}
            {mentorStatus === 'approved' && renderDashboard()}
          </>
        )}
      </div>
    </ProtectedRoute>
  );
} 