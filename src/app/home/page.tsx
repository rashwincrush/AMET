export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// Import all the components and icons from the original home page
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { FaHome, FaUsers, FaCalendar, FaBriefcase, FaHandshake, FaInfoCircle, FaGraduationCap, 
         FaBook, FaChartLine, FaUserFriends, FaEnvelope, FaBullhorn, FaFacebook, 
         FaTwitter, FaLinkedin, FaInstagram, FaSearch, FaLock, FaUserCircle, 
         FaBuilding, FaShieldAlt, FaBell, FaFileAlt, FaPhone, FaMapMarkerAlt } from 'react-icons/fa';

export default function HomePage() {
  const upcomingEvents = [
    {
      id: 1,
      title: "Annual Alumni Reunion",
      date: "May 15, 2025",
      time: "6:00 PM - 9:00 PM",
      location: "Grand Marina Hotel",
      attendees: 87,
    },
    {
      id: 2,
      title: "Career Networking Mixer",
      date: "June 2, 2025",
      time: "5:30 PM - 7:30 PM",
      location: "Virtual (Zoom)",
      attendees: 42,
    },
    {
      id: 3,
      title: "Industry Expert Panel",
      date: "June 18, 2025",
      time: "11:00 AM - 1:00 PM",
      location: "AMET Auditorium",
      attendees: 65,
    },
  ];

  const featuredJobs = [
    {
      id: 1,
      title: "Marine Engineer",
      company: "Ocean Shipping Co.",
      location: "Singapore",
      type: "Full-time",
      posted: "3 days ago",
    },
    {
      id: 2,
      title: "Deck Officer",
      company: "Global Maritime",
      location: "Dubai, UAE",
      type: "Contract",
      posted: "1 week ago",
    },
    {
      id: 3,
      title: "Naval Architect",
      company: "Marine Design Solutions",
      location: "Remote",
      type: "Full-time",
      posted: "2 days ago",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Hero Section - Enhanced */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-20 md:py-28 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4xMCI+PHBhdGggZD0iTTM2IDM0vjZoNnYtNmgtNnptNiA2djZoLTZ2LTZoNnptLTYtMTJ2Nmg2di02aC02em0xMiA2djZoLTZ2LTZoNnptLTI0IDEydjZoNnYtNmgtNnptNiA2djZoLTZ2LTZoNnptLTYtMTJ2Nmg2di02aC02em0xMiA2djZoLTZ2LTZoNnptLTI0IDEydjZoNnYtNmgtNnptNiA2djZoLTZ2LTZoNnptLTYtMTJ2Nmg2di02aC02em0xMiA2djZoLTZ2LTZoNnptLTI0IDEydjZoNnYtNmgtNnptNiA2djZoLTZ2LTZoNnptLTYtMTJ2Nmg2di02aC02em0xMiA2djZoLTZ2LTZoNnoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-30"></div>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col md:flex-row items-center">
            <div className="md:w-1/2 mb-8 md:mb-0">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
                Connect With Your<br />
                <span className="text-yellow-300">AMET Alumni</span> Network
              </h1>
              <p className="text-lg md:text-xl mb-8 max-w-2xl opacity-90">
                A comprehensive platform for connecting with fellow alumni, exploring events, finding job opportunities, and building mentorship relationships.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-3 rounded-md text-lg font-medium transition-all duration-300 shadow-md">
                  <Link href="/auth/signup" className="inline-block w-full">
                    Register Now
                  </Link>
                </Button>
                <Button variant="outline" className="border-2 border-white text-white hover:bg-white/10 px-8 py-3 rounded-md text-lg font-medium transition-all duration-300">
                  Learn More
                </Button>
              </div>
            </div>
            <div className="md:w-1/2 flex justify-center">
              <div className="bg-white/10 backdrop-blur-sm p-6 rounded-lg shadow-2xl border border-white/20 max-w-md w-full">
                <h2 className="text-xl font-bold mb-6 text-center">Upcoming Events</h2>
                <div className="space-y-4">
                  {upcomingEvents.map((event) => (
                    <div key={event.id} className="p-4 rounded-lg bg-white/5 backdrop-blur-sm hover:bg-white/10 transition duration-200 border border-white/10">
                      <h3 className="font-semibold text-lg">{event.title}</h3>
                      <div className="flex items-center mt-2 text-sm opacity-80">
                        <span className="mr-2"><FaCalendar className="inline mr-1" /> {event.date}</span>
                        <span><FaMapMarkerAlt className="inline mr-1" /> {event.location}</span>
                      </div>
                      <div className="mt-2 text-xs">
                        <span className="bg-blue-700 rounded-full px-2 py-1">
                          {event.attendees} Attending
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 text-center">
                  <Link href="/events">
                    <Button variant="outline" className="border border-white text-white hover:bg-white/10 w-full">
                      View All Events
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Grid */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">Everything You Need to Stay Connected</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Our platform provides tools and resources to help alumni connect, collaborate, and grow together.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <FeaturedResourceCard 
              title="Alumni Directory" 
              icon={<FaUsers size={42} />} 
              description="Connect with fellow alumni across industries, locations, and graduation years." 
              buttonText="Explore Directory"
              buttonLink="/alumni-directory"
              color="blue"
            />
            
            <FeaturedResourceCard 
              title="Events Calendar" 
              icon={<FaCalendar size={42} />} 
              description="Stay updated with reunions, webinars, and networking opportunities." 
              buttonText="Browse Events"
              buttonLink="/events"
              color="green"
            />
            
            <FeaturedResourceCard 
              title="Job Board" 
              icon={<FaBriefcase size={42} />} 
              description="Explore career opportunities shared by alumni and industry partners." 
              buttonText="View Jobs"
              buttonLink="/jobs"
              color="purple"
            />
            
            <FeaturedResourceCard 
              title="Mentorship Program" 
              icon={<FaHandshake size={42} />} 
              description="Participate in our structured mentorship program for growth and guidance." 
              buttonText="Join Program"
              buttonLink="/mentorship"
              color="orange"
            />
          </div>
        </div>
      </section>

      {/* Job Opportunities */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">Latest Job Opportunities</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Explore exclusive career opportunities shared by our alumni network and industry partners.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredJobs.map((job) => (
              <div key={job.id} className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300">
                <div className="p-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-800 mb-1">{job.title}</h3>
                      <p className="text-gray-600 mb-4">{job.company}</p>
                    </div>
                    <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full font-medium">
                      {job.type}
                    </span>
                  </div>
                  
                  <div className="flex items-center text-gray-500 text-sm mb-4">
                    <FaMapMarkerAlt className="mr-2" />
                    <span>{job.location}</span>
                  </div>
                  
                  <div className="border-t pt-4 mt-2 flex justify-between items-center">
                    <span className="text-sm text-gray-500">Posted {job.posted}</span>
                    <Button variant="outline" className="border-blue-300 text-blue-600 hover:bg-blue-50">
                      View Details
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-12 text-center">
            <Link href="/jobs">
              <Button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3">
                Browse All Jobs
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Alumni Spotlight */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">Alumni Spotlight</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Meet some of our outstanding alumni making an impact across industries.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <AlumniCard 
              name="Capt. Priya Sharma"
              year="Class of 2015"
              role="Chief Navigation Officer"
              company="International Maritime Group"
              location="Singapore"
            />
            
            <AlumniCard 
              name="Rahul Mehra"
              year="Class of 2012"
              role="Marine Engineering Director"
              company="Oceanic Solutions"
              location="Dubai, UAE"
            />
            
            <AlumniCard 
              name="Sarah Patel"
              year="Class of 2017"
              role="Naval Architecture Lead"
              company="Global Shipyards"
              location="Chennai, India"
            />
          </div>
          
          <div className="mt-12 text-center">
            <Link href="/alumni-spotlights">
              <Button variant="outline" className="border-2 border-blue-600 text-blue-600 hover:bg-blue-50 px-8 py-3">
                Meet More Alumni
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Call To Action */}
      <section className="py-16 bg-gradient-to-r from-blue-600 to-blue-800 text-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-6">Join Our AMET Alumni Network Today</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto opacity-90">
            Connect with fellow graduates, access exclusive resources, and advance your career.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Button className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-3 rounded-md text-lg font-medium transition-all duration-300 shadow-md">
              <Link href="/auth/signup" className="inline-block w-full">
                Register Now
              </Link>
            </Button>
            <Button variant="outline" className="border-2 border-white text-white hover:bg-white/10 px-8 py-3 rounded-md text-lg font-medium transition-all duration-300">
              Learn More
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}

// Types for FeaturedResourceCard
interface FeaturedResourceCardProps {
  title: string;
  icon: React.ReactNode;
  description: string;
  buttonText: string;
  buttonLink: string;
  color: 'blue' | 'green' | 'purple' | 'orange';
}

// Component for featured resource cards on homepage
function FeaturedResourceCard({ title, icon, description, buttonText, buttonLink, color }: FeaturedResourceCardProps) {
  const colorClasses = {
    blue: "bg-blue-50 border-blue-200 hover:bg-blue-100",
    green: "bg-green-50 border-green-200 hover:bg-green-100",
    purple: "bg-purple-50 border-purple-200 hover:bg-purple-100",
    orange: "bg-orange-50 border-orange-200 hover:bg-orange-100",
  };

  const iconColors = {
    blue: "text-blue-600",
    green: "text-green-600",
    purple: "text-purple-600",
    orange: "text-orange-600",
  };

  const buttonColors = {
    blue: "bg-blue-600 hover:bg-blue-700",
    green: "bg-green-600 hover:bg-green-700",
    purple: "bg-purple-600 hover:bg-purple-700",
    orange: "bg-orange-600 hover:bg-orange-700",
  };

  return (
    <div className={`p-6 rounded-xl border ${colorClasses[color]} transition-all duration-200 transform hover:-translate-y-1 hover:shadow-md`}>
      <div className={`${iconColors[color]} mb-4 flex justify-center`}>
        {icon}
      </div>
      <h3 className="text-xl font-semibold mb-2 text-gray-800 text-center">{title}</h3>
      <p className="text-gray-600 text-center mb-4">{description}</p>
      <Link href={buttonLink}>
        <Button className={`w-full ${buttonColors[color]} text-white`}>
          {buttonText}
        </Button>
      </Link>
    </div>
  );
}

// Types for AlumniCard
interface AlumniCardProps {
  name: string;
  year: string;
  role: string;
  company: string;
  location: string;
}

// Component for alumni cards
function AlumniCard({ name, year, role, company, location }: AlumniCardProps) {
  return (
    <div className="p-4 border border-gray-100 rounded-lg hover:shadow-md transition-all duration-200">
      <div className="flex items-start">
        <div className="bg-gray-200 w-12 h-12 rounded-full mr-4"></div>
        <div>
          <h4 className="font-semibold text-gray-800">{name}</h4>
          <p className="text-sm text-gray-500">{year}</p>
          <p className="text-sm text-gray-700 mt-2">{role}</p>
          <p className="text-sm text-gray-600">{company}</p>
          <p className="text-sm text-gray-500">{location}</p>
          <div className="mt-3 flex space-x-2">
            <Button variant="outline" className="text-xs py-1 px-2 border-blue-300 text-blue-700">
              Connect
            </Button>
            <Button variant="outline" className="text-xs py-1 px-2 border-gray-300 text-gray-600">
              View Profile
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
