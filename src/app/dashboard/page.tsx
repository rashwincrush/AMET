'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ROLES, hasRole, getUserPermissions } from '@/lib/roles';
import { useAuthWithRoles } from '@/lib/useAuthWithRoles';
import { Loader2, Bell, Calendar, Settings, MessageSquare, Users, Briefcase, BookOpen, Star, Check, Clock } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

// Import dashboard components
import { UpcomingEventsCard } from '@/components/dashboard/UpcomingEventsCard';
import { JobOpeningsCard } from '@/components/dashboard/JobOpeningsCard';
import { MentorsCard } from '@/components/dashboard/MentorsCard';
import { AlumniStatsCard } from '@/components/dashboard/AlumniStatsCard';

// Define types for our state
interface ProfileData {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  full_name?: string;
  avatar_url?: string;
  graduation_year?: number;
  degree?: string;
  major?: string;
  current_company?: string;
  current_position?: string;
  location?: string;
  bio?: string;
  linkedin_url?: string;
  twitter_url?: string;
  website_url?: string;
  phone_number?: string;
  is_mentor?: boolean;
  industry?: string;
  [key: string]: any; // Allow other properties
}

interface Notification {
  id: string;
  profile_id: string;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
  [key: string]: any;
}

interface MentorshipRelationship {
  id: string;
  mentor_id: string;
  mentee_id: string;
  status: string;
  profiles?: ProfileData;
  [key: string]: any;
}

interface Appointment {
  id: string;
  topic: string;
  mentor_availability: {
    date: string;
    start_time: string;
    end_time: string;
  };
  [key: string]: any;
}

// Custom ROLES type that includes MENTEE role for this component
const CUSTOM_ROLES = {
  ...ROLES,
  MENTEE: "mentee"
};

export default function DashboardPage() {
  const router = useRouter();
  const { user, roles, permissions, isLoading: authLoading } = useAuthWithRoles();
  const [dashboardContent, setDashboardContent] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [completionPercentage, setCompletionPercentage] = useState(0);
  const [myMentors, setMyMentors] = useState<MentorshipRelationship[]>([]);
  const [myMentees, setMyMentees] = useState<MentorshipRelationship[]>([]);
  const [upcomingAppointments, setUpcomingAppointments] = useState<Appointment[]>([]);

  useEffect(() => {
    async function loadDashboardContent() {
      try {
        if (!user || !roles || authLoading) return;

        // Fetch profile data
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (profileError) throw profileError;
        
        setProfileData(profile);
        
        // Calculate profile completion percentage
        calculateProfileCompletion(profile);

        // Fetch notifications
        const { data: notifs, error: notifsError } = await supabase
          .from('notifications')
          .select('*')
          .eq('profile_id', user.id)
          .eq('is_read', false)
          .order('created_at', { ascending: false })
          .limit(5);
        
        if (!notifsError) {
          setNotifications(notifs as Notification[] || []);
        }

        // Fetch mentorship data if user is a mentor or mentee
        if (profile.is_mentor) {
          const { data: mentees } = await supabase
            .from('mentorship_relationships')
            .select('*, profiles!mentorship_relationships_mentee_id_fkey(*)')
            .eq('mentor_id', user.id)
            .eq('status', 'active')
            .limit(3);
          
          setMyMentees(mentees as MentorshipRelationship[] || []);
        }

        // For now, show for all users
        const { data: mentors } = await supabase
          .from('mentorship_relationships')
          .select('*, profiles!mentorship_relationships_mentor_id_fkey(*)')
          .eq('mentee_id', user.id)
          .eq('status', 'active')
          .limit(3);
        
        setMyMentors(mentors as MentorshipRelationship[] || []);

        // Fetch upcoming appointments
        const today = new Date();
        const { data: appointments } = await supabase
          .from('mentorship_appointments')
          .select(`
            *,
            mentor_availability(*),
            mentors!mentor_availability_mentor_id_fkey(*)
          `)
          .or(`mentee_id.eq.${user.id},mentor_id.eq.${user.id}`)
          .gte('date', today.toISOString().split('T')[0])
          .eq('status', 'scheduled')
          .order('date', { ascending: true })
          .limit(3);
        
        setUpcomingAppointments(appointments as Appointment[] || []);

        // Determine which dashboard components to show based on user's roles
        const componentsToShow = new Set<string>();

        // Common components for all users
        componentsToShow.add('profile_summary');
        componentsToShow.add('job_openings');
        componentsToShow.add('upcoming_events');
        componentsToShow.add('mentors');

        // Super Admin and Admin have access to all components
        if (roles.includes(ROLES.SUPER_ADMIN) || roles.includes(ROLES.ADMIN)) {
          componentsToShow.add('admin_stats');
          componentsToShow.add('user_management');
          componentsToShow.add('role_management');
        }

        // Moderators can manage content
        if (roles.includes(ROLES.MODERATOR)) {
          componentsToShow.add('content_management');
          componentsToShow.add('event_management');
          componentsToShow.add('job_management');
        }

        // Event Managers can manage events
        if (roles.includes(ROLES.EVENT_MANAGER)) {
          componentsToShow.add('event_management');
        }

        // Mentors can manage mentorships
        if (roles.includes(ROLES.MENTOR) || profile.is_mentor) {
          componentsToShow.add('mentor_stats');
          componentsToShow.add('my_mentees');
        }

        // Mentees can view mentorship related content
        if (roles.includes(CUSTOM_ROLES.MENTEE) || myMentors.length > 0) {
          componentsToShow.add('my_mentors');
        }

        // If user has any mentorship relationships (as mentor or mentee)
        if (myMentors.length > 0 || myMentees.length > 0) {
          componentsToShow.add('upcoming_appointments');
        }

        setDashboardContent(Array.from(componentsToShow));
        setLoading(false);
      } catch (error) {
        console.error('Error loading dashboard content:', error);
        setLoading(false);
      }
    }

    loadDashboardContent();
  }, [user, roles, authLoading]);

  const calculateProfileCompletion = (profile: ProfileData) => {
    const requiredFields = [
      'first_name',
      'last_name',
      'graduation_year',
      'degree',
      'major',
      'avatar_url',
      'bio',
      'current_position',
      'current_company',
      'industry',
      'location'
    ];
    
    const optionalFields = [
      'linkedin_url',
      'twitter_url',
      'website_url',
      'phone_number'
    ];
    
    let completedRequiredFields = 0;
    let completedOptionalFields = 0;
    
    requiredFields.forEach(field => {
      if (profile[field]) completedRequiredFields++;
    });
    
    optionalFields.forEach(field => {
      if (profile[field]) completedOptionalFields++;
    });
    
    const requiredWeight = 0.8;
    const optionalWeight = 0.2;
    
    const requiredPercentage = (completedRequiredFields / requiredFields.length) * requiredWeight * 100;
    const optionalPercentage = (completedOptionalFields / optionalFields.length) * optionalWeight * 100;
    
    setCompletionPercentage(Math.round(requiredPercentage + optionalPercentage));
  };

  const getInitials = (name: string | undefined): string => {
    if (!name) return 'AU';
    return name.split(' ').map((n: string) => n[0]).join('').toUpperCase();
  };

  if (loading || authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    router.push('/');
    return null;
  }

  return (
    <div className="container mx-auto py-6 px-4 md:px-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold">Welcome, {profileData?.first_name || user.email?.split('@')[0] || 'Alumni'}</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Your alumni dashboard</p>
        </div>
        
        <div className="flex items-center space-x-4">
          <Link href="/notifications">
            <Button variant="outline" size="icon" className="relative">
              <Bell className="h-[1.2rem] w-[1.2rem]" />
              {notifications.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {notifications.length}
                </span>
              )}
            </Button>
          </Link>
          <Link href="/settings">
            <Button variant="outline" size="icon">
              <Settings className="h-[1.2rem] w-[1.2rem]" />
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Profile and Quick Actions */}
        <div className="space-y-6">
          {dashboardContent.includes('profile_summary') && (
            <Card className="overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-primary/10 to-primary/5 pb-8 pt-6">
                <div className="flex justify-center">
                  <Avatar className="h-24 w-24 border-4 border-white dark:border-gray-800 shadow-lg">
                    {profileData?.avatar_url ? (
                      <AvatarImage src={profileData.avatar_url} />
                    ) : (
                      <AvatarFallback className="text-xl bg-primary text-white">
                        {getInitials(profileData?.full_name || profileData?.first_name)}
                      </AvatarFallback>
                    )}
                  </Avatar>
                </div>
              </CardHeader>
              <CardContent className="-mt-8 text-center pb-2">
                <h2 className="text-xl font-bold">{profileData?.full_name || `${profileData?.first_name || ''} ${profileData?.last_name || ''}`}</h2>
                <p className="text-gray-600 dark:text-gray-400 mt-1">{profileData?.current_position}</p>
                {profileData?.current_company && (
                  <p className="text-gray-600 dark:text-gray-400">at {profileData.current_company}</p>
                )}
                
                <div className="mt-4 flex flex-wrap justify-center gap-2">
                  {profileData?.graduation_year && (
                    <Badge variant="outline" className="bg-primary/5">
                      Class of {profileData.graduation_year}
                    </Badge>
                  )}
                  {profileData?.major && (
                    <Badge variant="outline" className="bg-primary/5">
                      {profileData.major}
                    </Badge>
                  )}
                </div>
                
                <div className="mt-6">
                  <div className="flex justify-between mb-1 text-sm">
                    <span>Profile Completion</span>
                    <span>{completionPercentage}%</span>
                  </div>
                  <Progress value={completionPercentage} className="h-2" />
                  
                  {completionPercentage < 100 && (
                    <Link href="/profile">
                      <Button variant="link" size="sm" className="mt-2 p-0 h-auto text-sm">
                        Complete your profile
                      </Button>
                    </Link>
                  )}
                </div>
              </CardContent>
              <CardFooter className="flex justify-center gap-3 pt-0 pb-6">
                <Link href="/profile">
                  <Button variant="outline" size="sm">View Profile</Button>
                </Link>
                <Link href="/profile/edit">
                  <Button size="sm">Edit Profile</Button>
                </Link>
              </CardFooter>
            </Card>
          )}
          
          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-3">
              <Link href="/events/create">
                <Button variant="outline" className="w-full justify-start" size="sm">
                  <Calendar className="mr-2 h-4 w-4" />
                  Create Event
                </Button>
              </Link>
              <Link href="/jobs/create">
                <Button variant="outline" className="w-full justify-start" size="sm">
                  <Briefcase className="mr-2 h-4 w-4" />
                  Post Job
                </Button>
              </Link>
              <Link href="/mentorship/become-mentor">
                <Button variant="outline" className="w-full justify-start" size="sm">
                  <Users className="mr-2 h-4 w-4" />
                  Become Mentor
                </Button>
              </Link>
              <Link href="/mentorship/find-mentor">
                <Button variant="outline" className="w-full justify-start" size="sm">
                  <MessageSquare className="mr-2 h-4 w-4" />
                  Find Mentor
                </Button>
              </Link>
            </CardContent>
          </Card>
          
          {/* Upcoming Appointments */}
          {dashboardContent.includes('upcoming_appointments') && upcomingAppointments.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Upcoming Appointments</CardTitle>
                <CardDescription>Your scheduled mentorship meetings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {upcomingAppointments.map((appointment) => (
                  <div key={appointment.id} className="flex items-start space-x-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                    <div className="flex-shrink-0 w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center text-primary">
                      <Clock className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium">{appointment.topic}</h4>
                      <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        {new Date(appointment.mentor_availability.date).toLocaleDateString('en-US', { 
                          weekday: 'short', 
                          month: 'short', 
                          day: 'numeric'
                        })}
                        {' · '}
                        {appointment.mentor_availability.start_time.slice(0, 5)} - {appointment.mentor_availability.end_time.slice(0, 5)}
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
              <CardFooter>
                <Link href="/mentorship/appointments" className="w-full">
                  <Button variant="outline" className="w-full">View All Appointments</Button>
                </Link>
              </CardFooter>
            </Card>
          )}
          
          {/* My Mentors */}
          {dashboardContent.includes('my_mentors') && myMentors.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>My Mentors</CardTitle>
                <CardDescription>People guiding your journey</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {myMentors.map((mentorship) => (
                  <div key={mentorship.id} className="flex items-center space-x-3">
                    <Avatar className="h-10 w-10">
                      {mentorship.profiles?.avatar_url ? (
                        <AvatarImage src={mentorship.profiles.avatar_url} />
                      ) : (
                        <AvatarFallback className="bg-primary/10 text-primary">
                          {getInitials(mentorship.profiles?.full_name)}
                        </AvatarFallback>
                      )}
                    </Avatar>
                    <div>
                      <h4 className="font-medium">{mentorship.profiles?.full_name}</h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {mentorship.profiles?.current_position} at {mentorship.profiles?.current_company}
                      </p>
                    </div>
                  </div>
                ))}
              </CardContent>
              <CardFooter>
                <Link href="/mentorship/my-mentors" className="w-full">
                  <Button variant="outline" className="w-full">View All Mentors</Button>
                </Link>
              </CardFooter>
            </Card>
          )}
          
          {/* My Mentees */}
          {dashboardContent.includes('my_mentees') && myMentees.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>My Mentees</CardTitle>
                <CardDescription>People you're guiding</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {myMentees.map((mentorship) => (
                  <div key={mentorship.id} className="flex items-center space-x-3">
                    <Avatar className="h-10 w-10">
                      {mentorship.profiles?.avatar_url ? (
                        <AvatarImage src={mentorship.profiles.avatar_url} />
                      ) : (
                        <AvatarFallback className="bg-primary/10 text-primary">
                          {getInitials(mentorship.profiles?.full_name)}
                        </AvatarFallback>
                      )}
                    </Avatar>
                    <div>
                      <h4 className="font-medium">{mentorship.profiles?.full_name}</h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {mentorship.profiles?.current_position || 'Student'} 
                        {mentorship.profiles?.current_company && ` at ${mentorship.profiles.current_company}`}
                      </p>
                    </div>
                  </div>
                ))}
              </CardContent>
              <CardFooter>
                <Link href="/mentorship/my-mentees" className="w-full">
                  <Button variant="outline" className="w-full">View All Mentees</Button>
                </Link>
              </CardFooter>
            </Card>
          )}
        </div>

        {/* Main Content - 2 columns on larger screens */}
        <div className="lg:col-span-2 space-y-6">
          {/* Important Notifications */}
          {notifications.length > 0 && (
            <Card className="border-l-4 border-blue-500 dark:border-blue-400">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center">
                  <Bell className="h-5 w-5 mr-2 text-blue-500 dark:text-blue-400" />
                  Important Notifications
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {notifications.slice(0, 3).map((notification) => (
                    <div key={notification.id} className="flex items-start space-x-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                      <div className="flex-shrink-0 w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center text-blue-500 dark:text-blue-400">
                        <Bell className="h-4 w-4" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium">{notification.title}</h4>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                          {notification.message}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
              {notifications.length > 3 && (
                <CardFooter>
                  <Link href="/notifications" className="w-full">
                    <Button variant="ghost" className="w-full text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300">
                      View All Notifications
                    </Button>
                  </Link>
                </CardFooter>
              )}
            </Card>
          )}
          
          {/* Stats Overview */}
          {dashboardContent.includes('alumni_stats') && (
            <AlumniStatsCard />
          )}
          
          {/* Two Column Layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Events Card */}
            {dashboardContent.includes('upcoming_events') && (
              <UpcomingEventsCard />
            )}
            
            {/* Jobs Card */}
            {dashboardContent.includes('job_openings') && (
              <JobOpeningsCard />
            )}
          </div>
          
          {/* Mentors Card */}
          {dashboardContent.includes('mentors') && (
            <MentorsCard />
          )}
          
          {/* Admin Components */}
          {dashboardContent.includes('admin_stats') && (
            <Card>
              <CardHeader>
                <CardTitle>Admin Overview</CardTitle>
                <CardDescription>System metrics and management tools</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="flex flex-col items-center p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                    <Users className="h-6 w-6 text-primary mb-2" />
                    <span className="text-xl font-bold">1,234</span>
                    <span className="text-sm text-muted-foreground">Total Users</span>
                  </div>
                  <div className="flex flex-col items-center p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                    <Calendar className="h-6 w-6 text-primary mb-2" />
                    <span className="text-xl font-bold">25</span>
                    <span className="text-sm text-muted-foreground">Active Events</span>
                  </div>
                  <div className="flex flex-col items-center p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                    <Briefcase className="h-6 w-6 text-primary mb-2" />
                    <span className="text-xl font-bold">42</span>
                    <span className="text-sm text-muted-foreground">Job Listings</span>
                  </div>
                  <div className="flex flex-col items-center p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                    <MessageSquare className="h-6 w-6 text-primary mb-2" />
                    <span className="text-xl font-bold">89</span>
                    <span className="text-sm text-muted-foreground">Mentorships</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex flex-wrap gap-3">
                <Link href="/admin/users">
                  <Button variant="outline" size="sm">Manage Users</Button>
                </Link>
                <Link href="/admin/roles">
                  <Button variant="outline" size="sm">Manage Roles</Button>
                </Link>
                <Link href="/admin/events">
                  <Button variant="outline" size="sm">Manage Events</Button>
                </Link>
                <Link href="/admin/jobs">
                  <Button variant="outline" size="sm">Manage Jobs</Button>
                </Link>
              </CardFooter>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
