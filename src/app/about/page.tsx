'use client';

import { useState, useEffect } from 'react';
import { FaInfoCircle, FaUniversity, FaHistory, FaUsers, FaGlobe, FaGraduationCap, FaHandshake, FaChartLine, FaUserCircle, FaCalendarAlt, FaBriefcase, FaLightbulb } from 'react-icons/fa';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function AboutPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userData, setUserData] = useState<any>(null);
  const [networkStats, setNetworkStats] = useState({
    totalAlumni: 0,
    totalEvents: 0,
    totalJobs: 0,
    totalMentors: 0,
    userJoinDate: null as Date | null,
    userContributions: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkAuth() {
      try {
        const { data } = await supabase.auth.getSession();
        if (data.session) {
          setIsLoggedIn(true);
          
          // Fetch user profile data
          const { data: profileData } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', data.session.user.id)
            .single();
          
          setUserData(profileData);
          
          // Get network stats
          const { count: alumniCount } = await supabase
            .from('profiles')
            .select('*', { count: 'exact', head: true });
            
          const { count: eventsCount } = await supabase
            .from('events')
            .select('*', { count: 'exact', head: true });
            
          const { count: jobsCount } = await supabase
            .from('jobs')
            .select('*', { count: 'exact', head: true });
            
          const { count: mentorsCount } = await supabase
            .from('profiles')
            .select('*', { count: 'exact', head: true })
            .eq('is_mentor', true);
            
          // Get user's contributions (posts, events created, etc.)
          const { count: userEvents } = await supabase
            .from('events')
            .select('*', { count: 'exact', head: true })
            .eq('created_by', data.session.user.id);
            
          const { count: userJobs } = await supabase
            .from('jobs')
            .select('*', { count: 'exact', head: true })
            .eq('posted_by', data.session.user.id);
            
          setNetworkStats({
            totalAlumni: alumniCount || 0,
            totalEvents: eventsCount || 0,
            totalJobs: jobsCount || 0,
            totalMentors: mentorsCount || 0,
            userJoinDate: profileData?.created_at ? new Date(profileData.created_at) : null,
            userContributions: (userEvents || 0) + (userJobs || 0)
          });
        }
      } catch (error) {
        console.error('Error checking auth:', error);
      } finally {
        setLoading(false);
      }
    }
    
    checkAuth();
  }, []);
  return (
    <div className="min-h-screen bg-white text-gray-800">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-extrabold mb-6 leading-tight">
              About Our Alumni Network
            </h1>
            <p className="text-xl md:text-2xl font-light max-w-3xl mx-auto">
              Connecting graduates and building a stronger community through shared experiences and opportunities.
            </p>
          </div>
        </div>
      </div>

      {/* Mission & History Section */}
      <div className="py-16 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="bg-white rounded-xl p-8 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-300">
              <div className="flex items-center mb-6">
                <div className="bg-blue-100 p-3 rounded-full mr-4">
                  <FaHistory className="text-blue-600 text-2xl" />
                </div>
                <h2 className="text-2xl font-bold text-gray-800">Our History</h2>
              </div>
              <p className="text-gray-600 mb-4">
                Founded in 2010, our alumni network began as a small initiative to keep graduates connected. Over the years, we've grown into a comprehensive platform serving thousands of alumni across the globe.
              </p>
              <p className="text-gray-600">
                What started as simple reunions has evolved into a dynamic ecosystem of professional development, mentorship, and lifelong learning opportunities.
              </p>
            </div>

            <div className="bg-white rounded-xl p-8 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-300">
              <div className="flex items-center mb-6">
                <div className="bg-blue-100 p-3 rounded-full mr-4">
                  <FaUniversity className="text-blue-600 text-2xl" />
                </div>
                <h2 className="text-2xl font-bold text-gray-800">Our Mission</h2>
              </div>
              <p className="text-gray-600 mb-4">
                We strive to create a vibrant, supportive community that empowers alumni to maintain meaningful connections with their alma mater and fellow graduates.
              </p>
              <p className="text-gray-600">
                Our mission is to facilitate networking, professional growth, and continued engagement with the educational institution that shaped our members' futures.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Community Impact Section */}
      <div className="py-16 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900">Our Impact</h2>
            <div className="w-20 h-1 bg-blue-600 mx-auto mt-4 mb-6"></div>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Together, we're making a difference in our communities and around the world.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-blue-50 rounded-xl p-8 text-center hover:bg-blue-100 transition-colors duration-300">
              <div className="bg-white w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-md">
                <FaUsers className="text-blue-600 text-3xl" />
              </div>
              <div className="text-5xl font-bold text-blue-700 mb-2">5,000+</div>
              <p className="text-gray-700 font-medium">Active Alumni</p>
            </div>
            
            <div className="bg-indigo-50 rounded-xl p-8 text-center hover:bg-indigo-100 transition-colors duration-300">
              <div className="bg-white w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-md">
                <FaGlobe className="text-indigo-600 text-3xl" />
              </div>
              <div className="text-5xl font-bold text-indigo-700 mb-2">120+</div>
              <p className="text-gray-700 font-medium">Countries Represented</p>
            </div>
            
            <div className="bg-purple-50 rounded-xl p-8 text-center hover:bg-purple-100 transition-colors duration-300">
              <div className="bg-white w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-md">
                <FaHandshake className="text-purple-600 text-3xl" />
              </div>
              <div className="text-5xl font-bold text-purple-700 mb-2">$2M+</div>
              <p className="text-gray-700 font-medium">Scholarship Funds Raised</p>
            </div>
          </div>
        </div>
      </div>

      {/* Personalized Section for Logged-in Users */}
      {isLoggedIn && userData && (
        <div className="py-16 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/10 dark:to-indigo-900/10">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Your Alumni Journey</h2>
              <div className="w-20 h-1 bg-blue-600 mx-auto mt-4 mb-6"></div>
              <p className="mt-4 text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
                Here's how you're connected to the Jay Mahal Alumni Network
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
              {/* User Profile Card */}
              <Card className="shadow-lg hover:shadow-xl transition-all duration-300">
                <CardHeader className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white">
                  <div className="flex items-center">
                    <div className="mr-4 p-3 bg-white/20 rounded-full">
                      <FaUserCircle className="text-3xl" />
                    </div>
                    <div>
                      <CardTitle>Your Profile</CardTitle>
                      <CardDescription className="text-white/80">Member since {networkStats.userJoinDate?.toLocaleDateString('en-US', { year: 'numeric', month: 'long' })}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-center">
                      <div className="bg-blue-100 p-2 rounded-full mr-3">
                        <FaGraduationCap className="text-blue-600" />
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-700 dark:text-gray-200">Graduation Year</h4>
                        <p className="text-gray-600 dark:text-gray-300">{userData.graduation_year || 'Not specified'}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center">
                      <div className="bg-indigo-100 p-2 rounded-full mr-3">
                        <FaBriefcase className="text-indigo-600" />
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-700 dark:text-gray-200">Current Role</h4>
                        <p className="text-gray-600 dark:text-gray-300">{userData.current_position || 'Not specified'}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center">
                      <div className="bg-purple-100 p-2 rounded-full mr-3">
                        <FaLightbulb className="text-purple-600" />
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-700 dark:text-gray-200">Expertise</h4>
                        <p className="text-gray-600 dark:text-gray-300">{userData.expertise || 'Not specified'}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="bg-gray-50 dark:bg-gray-800/50 border-t">
                  <Link href="/profile/edit" className="w-full">
                    <Button className="w-full">Update Your Profile</Button>
                  </Link>
                </CardFooter>
              </Card>
              
              {/* Network Impact Card */}
              <Card className="shadow-lg hover:shadow-xl transition-all duration-300">
                <CardHeader className="bg-gradient-to-r from-purple-500 to-pink-600 text-white">
                  <div className="flex items-center">
                    <div className="mr-4 p-3 bg-white/20 rounded-full">
                      <FaChartLine className="text-3xl" />
                    </div>
                    <div>
                      <CardTitle>Your Network Impact</CardTitle>
                      <CardDescription className="text-white/80">How you're contributing to our community</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-6">
                    <div>
                      <h4 className="font-medium text-gray-700 dark:text-gray-200 mb-2">Your Contributions</h4>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Events & Jobs Posted</span>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">{networkStats.userContributions}</span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                        <div 
                          className="bg-purple-600 h-2.5 rounded-full" 
                          style={{ width: `${Math.min(100, (networkStats.userContributions / 10) * 100)}%` }}
                        ></div>
                      </div>
                      <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                        {networkStats.userContributions > 0 
                          ? 'Thank you for your contributions to our community!' 
                          : 'Start contributing by posting events or job opportunities.'}
                      </p>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 text-center">
                        <h5 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Network Size</h5>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">{networkStats.totalAlumni}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Alumni Members</p>
                      </div>
                      
                      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 text-center">
                        <h5 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Available Mentors</h5>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">{networkStats.totalMentors}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Ready to Help</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="bg-gray-50 dark:bg-gray-800/50 border-t">
                  <div className="grid grid-cols-2 gap-4 w-full">
                    <Link href="/events/create" className="w-full">
                      <Button variant="outline" className="w-full">Create Event</Button>
                    </Link>
                    <Link href="/jobs/post" className="w-full">
                      <Button className="w-full">Post Job</Button>
                    </Link>
                  </div>
                </CardFooter>
              </Card>
            </div>
            
            {/* Personalized Recommendations */}
            <div className="mt-12">
              <h3 className="text-2xl font-bold text-center text-gray-900 dark:text-white mb-8">Recommended for You</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="shadow-md hover:shadow-lg transition-all duration-300">
                  <CardHeader className="bg-blue-50 dark:bg-blue-900/20">
                    <div className="flex items-center">
                      <div className="mr-3 p-2 bg-blue-100 dark:bg-blue-800/30 rounded-full">
                        <FaUsers className="text-blue-600 dark:text-blue-400" />
                      </div>
                      <CardTitle className="text-lg">Connect with Alumni</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 dark:text-gray-300">Find alumni in your field or location to expand your professional network.</p>
                  </CardContent>
                  <CardFooter>
                    <Link href="/directory" className="w-full">
                      <Button variant="outline" className="w-full">Search Directory</Button>
                    </Link>
                  </CardFooter>
                </Card>
                
                <Card className="shadow-md hover:shadow-lg transition-all duration-300">
                  <CardHeader className="bg-green-50 dark:bg-green-900/20">
                    <div className="flex items-center">
                      <div className="mr-3 p-2 bg-green-100 dark:bg-green-800/30 rounded-full">
                        <FaHandshake className="text-green-600 dark:text-green-400" />
                      </div>
                      <CardTitle className="text-lg">Find a Mentor</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 dark:text-gray-300">Get guidance from experienced professionals in your industry or field of interest.</p>
                  </CardContent>
                  <CardFooter>
                    <Link href="/mentorship" className="w-full">
                      <Button variant="outline" className="w-full">Explore Mentors</Button>
                    </Link>
                  </CardFooter>
                </Card>
                
                <Card className="shadow-md hover:shadow-lg transition-all duration-300">
                  <CardHeader className="bg-amber-50 dark:bg-amber-900/20">
                    <div className="flex items-center">
                      <div className="mr-3 p-2 bg-amber-100 dark:bg-amber-800/30 rounded-full">
                        <FaCalendarAlt className="text-amber-600 dark:text-amber-400" />
                      </div>
                      <CardTitle className="text-lg">Upcoming Events</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 dark:text-gray-300">Discover networking events, webinars, and reunions tailored to your interests.</p>
                  </CardContent>
                  <CardFooter>
                    <Link href="/events" className="w-full">
                      <Button variant="outline" className="w-full">View Events</Button>
                    </Link>
                  </CardFooter>
                </Card>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Global Network Section */}
      <div className="py-16 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900">Global Network</h2>
              <div className="w-20 h-1 bg-blue-600 mx-auto mt-4 mb-6"></div>
              <p className="text-xl text-gray-600">
                Our alumni are making an impact worldwide, representing our institution in various industries and sectors.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
              <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 border-l-4 border-blue-500">
                <h3 className="font-bold text-xl text-gray-800 mb-3">North America</h3>
                <p className="text-gray-600">2,100+ alumni across the United States and Canada leading in technology, finance, healthcare, and education sectors.</p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 border-l-4 border-green-500">
                <h3 className="font-bold text-xl text-gray-800 mb-3">Europe</h3>
                <p className="text-gray-600">1,400+ alumni across 28 European countries contributing to innovation, research, and cultural exchange.</p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 border-l-4 border-yellow-500">
                <h3 className="font-bold text-xl text-gray-800 mb-3">Asia Pacific</h3>
                <p className="text-gray-600">1,200+ alumni throughout the Asia-Pacific region driving economic growth and technological advancement.</p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 border-l-4 border-red-500">
                <h3 className="font-bold text-xl text-gray-800 mb-3">Africa & Middle East</h3>
                <p className="text-gray-600">300+ alumni contributing to development, sustainability initiatives, and educational reform.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Values Section */}
      <div className="py-16 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900">Our Values</h2>
            <div className="w-20 h-1 bg-blue-600 mx-auto mt-4 mb-6"></div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaGraduationCap className="text-blue-600 text-2xl" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Lifelong Learning</h3>
              <p className="text-gray-600">We believe education continues beyond graduation, fostering curiosity and growth throughout life.</p>
            </div>
            
            <div className="text-center p-6">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaHandshake className="text-blue-600 text-2xl" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Community Support</h3>
              <p className="text-gray-600">We support each other through mentorship, networking, and collaborative opportunities.</p>
            </div>
            
            <div className="text-center p-6">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaChartLine className="text-blue-600 text-2xl" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Innovation</h3>
              <p className="text-gray-600">We embrace change and continuously seek new ways to serve our alumni community better.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Call to Action */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Join Our Community Today</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">Connect with fellow alumni, access exclusive resources, and stay updated on the latest events and opportunities.</p>
          <button className="bg-white text-blue-700 font-bold py-3 px-8 rounded-full hover:bg-blue-50 transition-colors duration-300 shadow-lg">
            Sign Up Now
          </button>
        </div>
      </div>
    </div>
  );
}