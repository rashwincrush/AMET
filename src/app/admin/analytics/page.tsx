'use client';

import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import UserMetricsCard from '@/components/analytics/UserMetricsCard';
import EventMetricsCard from '@/components/analytics/EventMetricsCard';
import JobMetricsCard from '@/components/analytics/JobMetricsCard';
import MentorshipMetricsCard from '@/components/analytics/MentorshipMetricsCard';
import SystemMetricsCard from '@/components/analytics/SystemMetricsCard';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';

// Sample data for charts
const monthlyUserData = [
  { name: 'Jan', users: 65 },
  { name: 'Feb', users: 78 },
  { name: 'Mar', users: 92 },
  { name: 'Apr', users: 105 },
  { name: 'May', users: 120 },
  { name: 'Jun', users: 135 },
];

const eventAttendanceData = [
  { name: 'Alumni Mixer', attendance: 45, capacity: 50 },
  { name: 'Career Fair', attendance: 120, capacity: 150 },
  { name: 'Tech Workshop', attendance: 35, capacity: 40 },
  { name: 'Networking', attendance: 68, capacity: 75 },
  { name: 'Mentorship', attendance: 28, capacity: 30 },
];

const jobCategoryData = [
  { name: 'Technology', value: 35 },
  { name: 'Finance', value: 25 },
  { name: 'Healthcare', value: 18 },
  { name: 'Education', value: 12 },
  { name: 'Other', value: 10 },
];

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

export default function AnalyticsPage() {
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [dateRange, setDateRange] = useState<string>('month'); 
  const [metrics, setMetrics] = useState({
    emailsSent: {
      total: 1248,
      lastWeek: 156
    },
    jobAlerts: {
      total: 876,
      matchRate: 76
    },
    systemErrors: {
      total: 42,
      lastWeek: 8
    }
  }); 
  
  const supabase = createClientComponentClient();
  
  useEffect(() => {
    // Simulate loading delay
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Analytics Dashboard</h1>
        <div className="flex space-x-2">
          <Button 
            variant={dateRange === 'week' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setDateRange('week')}
          >
            Week
          </Button>
          <Button 
            variant={dateRange === 'month' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setDateRange('month')}
          >
            Month
          </Button>
          <Button 
            variant={dateRange === 'year' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setDateRange('year')}
          >
            Year
          </Button>
        </div>
      </div>
      
      <Tabs defaultValue="overview" className="w-full" onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5 mb-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="users">User Analytics</TabsTrigger>
          <TabsTrigger value="events">Event Analytics</TabsTrigger>
          <TabsTrigger value="jobs">Job Portal</TabsTrigger>
          <TabsTrigger value="system">System</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <UserMetricsCard />
            <EventMetricsCard />
            <JobMetricsCard />
            <MentorshipMetricsCard />
          </div>
          
          <SystemMetricsCard />
          
          <Card>
            <CardHeader>
              <CardTitle>User Growth Trend</CardTitle>
              <CardDescription>Monthly user registrations</CardDescription>
            </CardHeader>
            <CardContent className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={monthlyUserData}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="users" stroke="#8884d8" activeDot={{ r: 8 }} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Event Attendance</CardTitle>
                <CardDescription>Attendance vs capacity for recent events</CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={eventAttendanceData}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="attendance" fill="#8884d8" />
                    <Bar dataKey="capacity" fill="#82ca9d" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Job Categories</CardTitle>
                <CardDescription>Distribution of job listings by category</CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={jobCategoryData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {jobCategoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="users" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>User Analytics</CardTitle>
              <CardDescription>Detailed user engagement metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                This section provides detailed analytics about user engagement, profile completeness, and activity patterns.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Profile Completion</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">78%</div>
                    <p className="text-xs text-muted-foreground">Average profile completeness</p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Active Users</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">65%</div>
                    <p className="text-xs text-muted-foreground">Monthly active users</p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Verified Profiles</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">92%</div>
                    <p className="text-xs text-muted-foreground">Verification rate</p>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="events" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Event Analytics</CardTitle>
              <CardDescription>Event participation and feedback metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                This section provides detailed analytics about event attendance, satisfaction ratings, and engagement patterns.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Attendance Rate</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">87%</div>
                    <p className="text-xs text-muted-foreground">Average attendance vs. RSVP</p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Satisfaction</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">4.7/5</div>
                    <p className="text-xs text-muted-foreground">Average event rating</p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Feedback Rate</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">62%</div>
                    <p className="text-xs text-muted-foreground">Attendees providing feedback</p>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="jobs" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Job Portal Analytics</CardTitle>
              <CardDescription>Job posting and application metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                This section provides detailed analytics about job postings, applications, and placement rates.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Application Rate</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">3.8</div>
                    <p className="text-xs text-muted-foreground">Applications per job</p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Placement Rate</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">42%</div>
                    <p className="text-xs text-muted-foreground">Successful placements</p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Alert Matches</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">76%</div>
                    <p className="text-xs text-muted-foreground">Job alert match rate</p>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="system" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>System Health</CardTitle>
              <CardDescription>System performance and monitoring</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                This section provides detailed analytics about system performance, email delivery, and error tracking.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Email Delivery</CardTitle>
                    <CardDescription>Email sending statistics</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">Total Emails Sent</span>
                          <span className="text-sm">{metrics.emailsSent?.total || 0}</span>
                        </div>
                        <div className="mt-2 h-2 w-full bg-secondary overflow-hidden rounded-full">
                          <div className="bg-primary h-2 rounded-full" style={{ width: '100%' }}></div>
                        </div>
                      </div>
                      
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">Last Week</span>
                          <span className="text-sm">{metrics.emailsSent?.lastWeek || 0}</span>
                        </div>
                        <div className="mt-2 h-2 w-full bg-secondary overflow-hidden rounded-full">
                          <div 
                            className="bg-primary h-2 rounded-full" 
                            style={{ width: `${metrics.emailsSent?.total ? Math.min(100, (metrics.emailsSent.lastWeek / metrics.emailsSent.total) * 100) : 0}%` }}
                          ></div>
                        </div>
                      </div>
                      
                      <div className="pt-4 border-t">
                        <h4 className="text-sm font-medium mb-2">Email Types</h4>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Job Alerts</span>
                            <span>42%</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Event Confirmations</span>
                            <span>28%</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Mentorship</span>
                            <span>18%</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Other</span>
                            <span>12%</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>System Errors</CardTitle>
                    <CardDescription>Error tracking and monitoring</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">Total Errors</span>
                          <span className="text-sm">{metrics.systemErrors?.total || 0}</span>
                        </div>
                        <div className="mt-2 h-2 w-full bg-secondary overflow-hidden rounded-full">
                          <div className="bg-destructive h-2 rounded-full" style={{ width: '100%' }}></div>
                        </div>
                      </div>
                      
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">Last Week</span>
                          <span className="text-sm">{metrics.systemErrors?.lastWeek || 0}</span>
                        </div>
                        <div className="mt-2 h-2 w-full bg-secondary overflow-hidden rounded-full">
                          <div 
                            className="bg-destructive h-2 rounded-full" 
                            style={{ width: `${metrics.systemErrors?.total ? Math.min(100, (metrics.systemErrors.lastWeek / metrics.systemErrors.total) * 100) : 0}%` }}
                          ></div>
                        </div>
                      </div>
                      
                      <div className="pt-4 border-t">
                        <h4 className="text-sm font-medium mb-2">Error Types</h4>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">API Errors</span>
                            <span>45%</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Database</span>
                            <span>30%</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Authentication</span>
                            <span>15%</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Other</span>
                            <span>10%</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              <div className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Job Alert Performance</CardTitle>
                    <CardDescription>Job alert matching and delivery metrics</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <div className="text-2xl font-bold">{metrics.jobAlerts?.total || 0}</div>
                          <p className="text-xs text-muted-foreground">Total alerts sent</p>
                        </div>
                        
                        <div>
                          <div className="text-2xl font-bold">{metrics.jobAlerts?.matchRate || 0}%</div>
                          <p className="text-xs text-muted-foreground">Match rate</p>
                        </div>
                        
                        <div>
                          <div className="text-2xl font-bold">94%</div>
                          <p className="text-xs text-muted-foreground">Delivery rate</p>
                        </div>
                      </div>
                      
                      <div className="pt-4">
                        <h4 className="text-sm font-medium mb-2">Alert Frequency</h4>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                          <div>
                            <div className="text-xl font-bold">42%</div>
                            <p className="text-xs text-muted-foreground">Daily alerts</p>
                          </div>
                          <div>
                            <div className="text-xl font-bold">58%</div>
                            <p className="text-xs text-muted-foreground">Weekly alerts</p>
                          </div>
                          <div>
                            <div className="text-xl font-bold">3.2</div>
                            <p className="text-xs text-muted-foreground">Avg. jobs per alert</p>
                          </div>
                          <div>
                            <div className="text-xl font-bold">24%</div>
                            <p className="text-xs text-muted-foreground">Click-through rate</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}