'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Pie, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { toast } from '@/components/ui/use-toast';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

interface MentorshipStats {
  total_mentors: number;
  total_mentees: number;
  total_meetings: number;
  total_scheduled_meetings: number;
  total_completed_meetings: number;
  total_cancelled_meetings: number;
  avg_meeting_rating: number;
  top_topics: Array<{ topic: string; count: number }>;
  industry_breakdown: Array<{ industry: string; count: number }>;
  monthly_meetings: Array<{ month: string; count: number }>;
  mentor_satisfaction: number;
  mentee_satisfaction: number;
}

export default function MentorshipInsightsPage() {
  const router = useRouter();
  const { user } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<MentorshipStats | null>(null);
  const [timeFrame, setTimeFrame] = useState('all');
  const [isAdmin, setIsAdmin] = useState(false);
  
  useEffect(() => {
    if (user) {
      checkAdminStatus();
      fetchMentorshipStats();
    }
  }, [user, timeFrame]);
  
  const checkAdminStatus = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('id', user!.id)
        .single();
        
      if (!error && data && data.is_admin) {
        setIsAdmin(true);
      }
    } catch (error) {
      console.error('Error checking admin status:', error);
    }
  };
  
  const fetchMentorshipStats = async () => {
    try {
      setLoading(true);
      
      // This would normally be a backend API call that aggregates this data
      // For demonstration purposes, we'll fetch and calculate some basic stats
      
      // Get date filter based on timeFrame
      let dateFilter = '';
      const now = new Date();
      if (timeFrame === 'month') {
        const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
        dateFilter = `gte.${lastMonth.toISOString().split('T')[0]}`;
      } else if (timeFrame === 'quarter') {
        const lastQuarter = new Date(now.getFullYear(), now.getMonth() - 3, now.getDate());
        dateFilter = `gte.${lastQuarter.toISOString().split('T')[0]}`;
      } else if (timeFrame === 'year') {
        const lastYear = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
        dateFilter = `gte.${lastYear.toISOString().split('T')[0]}`;
      }
      
      // Fetch mentors count
      const { count: mentorsCount, error: mentorsError } = await supabase
        .from('mentors')
        .select('*', { count: 'exact' });
      
      // Fetch mentees count
      const { count: menteesCount, error: menteesError } = await supabase
        .from('mentees')
        .select('*', { count: 'exact' });
      
      // Fetch meetings data
      let meetingsQuery = supabase
        .from('mentorship_meetings')
        .select('*');
        
      if (dateFilter) {
        meetingsQuery = meetingsQuery.filter('date', 'gte', dateFilter.split('.')[1]);
      }
      
      const { data: meetingsData, error: meetingsError } = await meetingsQuery;
      
      if (mentorsError || menteesError || meetingsError) {
        throw new Error('Error fetching mentorship data');
      }
      
      // Calculate meeting statistics
      const totalMeetings = meetingsData?.length || 0;
      const scheduledMeetings = meetingsData?.filter(m => m.status === 'scheduled').length || 0;
      const completedMeetings = meetingsData?.filter(m => m.status === 'completed').length || 0;
      const cancelledMeetings = meetingsData?.filter(m => m.status === 'cancelled').length || 0;
      
      // Get meeting topics
      const topicCounts: Record<string, number> = {};
      meetingsData?.forEach(meeting => {
        if (meeting.topic) {
          const topic = meeting.topic.split(' ')[0]; // Simplified for demo
          topicCounts[topic] = (topicCounts[topic] || 0) + 1;
        }
      });
      
      const topTopics = Object.entries(topicCounts)
        .map(([topic, count]) => ({ topic, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);
      
      // Fetch industries
      const { data: mentorData, error: mentorDataError } = await supabase
        .from('mentors')
        .select('industry');
        
      if (mentorDataError) {
        throw mentorDataError;
      }
      
      // Calculate industry breakdown
      const industryCounts: Record<string, number> = {};
      mentorData?.forEach(mentor => {
        if (mentor.industry) {
          industryCounts[mentor.industry] = (industryCounts[mentor.industry] || 0) + 1;
        }
      });
      
      const industryBreakdown = Object.entries(industryCounts)
        .map(([industry, count]) => ({ industry, count }))
        .sort((a, b) => b.count - a.count);
      
      // Monthly meetings
      const monthlyCounts: Record<string, number> = {};
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      
      meetingsData?.forEach(meeting => {
        const date = new Date(meeting.date);
        const monthYear = `${months[date.getMonth()]} ${date.getFullYear()}`;
        monthlyCounts[monthYear] = (monthlyCounts[monthYear] || 0) + 1;
      });
      
      // Sort by date
      const monthlyMeetings = Object.entries(monthlyCounts)
        .map(([month, count]) => ({ month, count }))
        .sort((a, b) => {
          const [aMonth, aYear] = a.month.split(' ');
          const [bMonth, bYear] = b.month.split(' ');
          if (aYear !== bYear) return parseInt(aYear) - parseInt(bYear);
          return months.indexOf(aMonth) - months.indexOf(bMonth);
        })
        .slice(-6); // Last 6 months
      
      // Fetch feedback data
      let feedbackQuery = supabase
        .from('mentorship_feedback')
        .select('*');
        
      if (dateFilter) {
        feedbackQuery = feedbackQuery.filter('created_at', 'gte', dateFilter.split('.')[1]);
      }
      
      const { data: feedbackData, error: feedbackError } = await feedbackQuery;
      
      if (feedbackError) {
        throw feedbackError;
      }
      
      // Calculate average ratings
      const allRatings = feedbackData?.map(f => f.overall_rating) || [];
      const avgRating = allRatings.length > 0
        ? allRatings.reduce((sum, rating) => sum + rating, 0) / allRatings.length
        : 0;
      
      const mentorFeedback = feedbackData?.filter(f => !f.is_from_mentor) || [];
      const menteeFeedback = feedbackData?.filter(f => f.is_from_mentor) || [];
      
      const mentorSatisfaction = mentorFeedback.length > 0
        ? mentorFeedback.filter(f => f.would_recommend).length / mentorFeedback.length * 100
        : 0;
        
      const menteeSatisfaction = menteeFeedback.length > 0
        ? menteeFeedback.filter(f => f.would_recommend).length / menteeFeedback.length * 100
        : 0;
      
      // Set the calculated stats
      setStats({
        total_mentors: mentorsCount || 0,
        total_mentees: menteesCount || 0,
        total_meetings: totalMeetings,
        total_scheduled_meetings: scheduledMeetings,
        total_completed_meetings: completedMeetings,
        total_cancelled_meetings: cancelledMeetings,
        avg_meeting_rating: parseFloat(avgRating.toFixed(1)),
        top_topics: topTopics,
        industry_breakdown: industryBreakdown,
        monthly_meetings: monthlyMeetings,
        mentor_satisfaction: parseFloat(mentorSatisfaction.toFixed(1)),
        mentee_satisfaction: parseFloat(menteeSatisfaction.toFixed(1))
      });
      
    } catch (error) {
      console.error('Error fetching mentorship stats:', error);
      toast({
        title: "Error loading insights",
        description: "There was a problem fetching the mentorship program data.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  
  // Prepare chart data for topics
  const topicsChartData = {
    labels: stats?.top_topics.map(t => t.topic) || [],
    datasets: [
      {
        label: 'Number of Meetings',
        data: stats?.top_topics.map(t => t.count) || [],
        backgroundColor: [
          'rgba(255, 99, 132, 0.6)',
          'rgba(54, 162, 235, 0.6)',
          'rgba(255, 206, 86, 0.6)',
          'rgba(75, 192, 192, 0.6)',
          'rgba(153, 102, 255, 0.6)',
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(153, 102, 255, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };
  
  // Prepare chart data for industries
  const industriesChartData = {
    labels: stats?.industry_breakdown.slice(0, 5).map(i => i.industry) || [],
    datasets: [
      {
        label: 'Number of Mentors',
        data: stats?.industry_breakdown.slice(0, 5).map(i => i.count) || [],
        backgroundColor: [
          'rgba(75, 192, 192, 0.6)',
          'rgba(153, 102, 255, 0.6)',
          'rgba(255, 159, 64, 0.6)',
          'rgba(54, 162, 235, 0.6)',
          'rgba(255, 99, 132, 0.6)',
        ],
        borderColor: [
          'rgba(75, 192, 192, 1)',
          'rgba(153, 102, 255, 1)',
          'rgba(255, 159, 64, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 99, 132, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };
  
  // Prepare chart data for monthly meetings
  const monthlyChartData = {
    labels: stats?.monthly_meetings.map(m => m.month) || [],
    datasets: [
      {
        label: 'Number of Meetings',
        data: stats?.monthly_meetings.map(m => m.count) || [],
        backgroundColor: 'rgba(54, 162, 235, 0.6)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1,
      },
    ],
  };
  
  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
    },
  };
  
  return (
    <ProtectedRoute>
      <div className="container mx-auto p-6">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold">Mentorship Insights</h1>
            <p className="text-muted-foreground">Statistics and analytics for the mentorship program</p>
          </div>
          
          <div className="flex items-center gap-2">
            <Select value={timeFrame} onValueChange={setTimeFrame}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Time period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Time</SelectItem>
                <SelectItem value="year">Past Year</SelectItem>
                <SelectItem value="quarter">Past Quarter</SelectItem>
                <SelectItem value="month">Past Month</SelectItem>
              </SelectContent>
            </Select>
            
            <Link href="/mentorship">
              <Button variant="outline">Back to Mentorship</Button>
            </Link>
          </div>
        </div>
        
        {loading ? (
          <div className="flex justify-center p-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
          </div>
        ) : !stats ? (
          <Card>
            <CardHeader>
              <CardTitle>No Data Available</CardTitle>
              <CardDescription>
                There is no mentorship data available for the selected time period.
              </CardDescription>
            </CardHeader>
          </Card>
        ) : (
          <>
            {/* Overview Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>Total Mentors</CardDescription>
                  <CardTitle className="text-4xl">{stats.total_mentors}</CardTitle>
                </CardHeader>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>Total Mentees</CardDescription>
                  <CardTitle className="text-4xl">{stats.total_mentees}</CardTitle>
                </CardHeader>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>Total Meetings</CardDescription>
                  <CardTitle className="text-4xl">{stats.total_meetings}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-xs text-muted-foreground">
                    {stats.total_completed_meetings} completed, {stats.total_scheduled_meetings} scheduled
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>Average Meeting Rating</CardDescription>
                  <CardTitle className="text-4xl">{stats.avg_meeting_rating || 'N/A'}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <svg
                        key={star}
                        className={`w-5 h-5 ${
                          star <= Math.round(stats.avg_meeting_rating)
                            ? 'text-yellow-400'
                            : 'text-gray-300'
                        }`}
                        fill="currentColor"
                        viewBox="0 0 20 20"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <Card>
                <CardHeader>
                  <CardTitle>Satisfaction Rates</CardTitle>
                  <CardDescription>
                    Percentage of participants who would recommend the program
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">Mentor Satisfaction</span>
                      <span className="text-sm font-medium">{stats.mentor_satisfaction}%</span>
                    </div>
                    <Progress value={stats.mentor_satisfaction} className="h-3" />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">Mentee Satisfaction</span>
                      <span className="text-sm font-medium">{stats.mentee_satisfaction}%</span>
                    </div>
                    <Progress value={stats.mentee_satisfaction} className="h-3" />
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Meeting Status</CardTitle>
                  <CardDescription>
                    Breakdown of meeting statuses
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[250px] flex items-center justify-center">
                    <Pie 
                      data={{
                        labels: ['Scheduled', 'Completed', 'Cancelled'],
                        datasets: [
                          {
                            data: [
                              stats.total_scheduled_meetings,
                              stats.total_completed_meetings,
                              stats.total_cancelled_meetings
                            ],
                            backgroundColor: [
                              'rgba(54, 162, 235, 0.6)',
                              'rgba(75, 192, 192, 0.6)',
                              'rgba(255, 99, 132, 0.6)'
                            ],
                            borderColor: [
                              'rgba(54, 162, 235, 1)',
                              'rgba(75, 192, 192, 1)',
                              'rgba(255, 99, 132, 1)'
                            ],
                            borderWidth: 1
                          }
                        ]
                      }}
                      options={chartOptions}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <Tabs defaultValue="topics" className="mb-8">
              <TabsList className="grid w-full max-w-md grid-cols-3">
                <TabsTrigger value="topics">Popular Topics</TabsTrigger>
                <TabsTrigger value="industries">Industries</TabsTrigger>
                <TabsTrigger value="trends">Monthly Trends</TabsTrigger>
              </TabsList>
              
              <TabsContent value="topics" className="pt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Most Popular Meeting Topics</CardTitle>
                    <CardDescription>
                      The most common topics discussed in mentorship meetings
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[350px] flex items-center justify-center">
                      {stats.top_topics.length > 0 ? (
                        <Pie data={topicsChartData} options={chartOptions} />
                      ) : (
                        <div className="text-center text-muted-foreground">
                          No topic data available
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="industries" className="pt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Mentor Industries</CardTitle>
                    <CardDescription>
                      Distribution of mentors across different industries
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[350px] flex items-center justify-center">
                      {stats.industry_breakdown.length > 0 ? (
                        <Pie data={industriesChartData} options={chartOptions} />
                      ) : (
                        <div className="text-center text-muted-foreground">
                          No industry data available
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="trends" className="pt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Meeting Trends</CardTitle>
                    <CardDescription>
                      Number of mentorship meetings over time
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[350px] flex items-center justify-center">
                      {stats.monthly_meetings.length > 0 ? (
                        <Bar 
                          data={monthlyChartData} 
                          options={{
                            ...chartOptions,
                            scales: {
                              y: {
                                beginAtZero: true
                              }
                            }
                          }} 
                        />
                      ) : (
                        <div className="text-center text-muted-foreground">
                          No trend data available
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
            
            {isAdmin && (
              <Card>
                <CardHeader>
                  <CardTitle>Administration</CardTitle>
                  <CardDescription>
                    Tools for program administrators
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col sm:flex-row gap-4">
                  <Button variant="outline">
                    Export Data
                  </Button>
                  <Button variant="outline">
                    Generate Reports
                  </Button>
                  <Button variant="outline">
                    Program Settings
                  </Button>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </div>
    </ProtectedRoute>
  );
} 