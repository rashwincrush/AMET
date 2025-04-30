// Static home page that redirects to the dynamic home page
import { redirect } from 'next/navigation';

// This page can be statically generated without issues
export default function Home() {
  // Server component that redirects to the dynamic home page
  redirect('/home');

  // This part won't actually be rendered due to the redirect
  return null;
}
                        <div className="mt-3 sm:mt-0 flex items-center">
                          <div className="text-sm text-gray-500 mr-4">
                            <span className="font-medium text-gray-700">{event.attendees}</span> attending
                          </div>
                          <Button className="text-sm bg-green-600 hover:bg-green-700 text-white">
                            RSVP
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="p-4 border-t border-gray-200 text-center">
                  <Link href="/events" className="text-green-600 hover:text-green-800 font-medium">
                    View all events →
                  </Link>
                </div>
              </div>
            </div>
            <div>
              <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-200 h-full">
                <div className="p-4 border-b border-gray-200 bg-gray-50">
                  <h3 className="font-semibold text-gray-700">Event Categories</h3>
                </div>
                <div className="p-4">
                  <ul className="space-y-2">
                    <li className="p-2 hover:bg-gray-50 rounded flex justify-between">
                      <span className="flex items-center">
                        <span className="w-3 h-3 rounded-full bg-blue-500 mr-2"></span>
                        Networking Events
                      </span>
                      <span className="text-gray-500 text-sm">12</span>
                    </li>
                    <li className="p-2 hover:bg-gray-50 rounded flex justify-between">
                      <span className="flex items-center">
                        <span className="w-3 h-3 rounded-full bg-green-500 mr-2"></span>
                        Webinars & Workshops
                      </span>
                      <span className="text-gray-500 text-sm">8</span>
                    </li>
                    <li className="p-2 hover:bg-gray-50 rounded flex justify-between">
                      <span className="flex items-center">
                        <span className="w-3 h-3 rounded-full bg-purple-500 mr-2"></span>
                        Annual Reunions
                      </span>
                      <span className="text-gray-500 text-sm">3</span>
                    </li>
                    <li className="p-2 hover:bg-gray-50 rounded flex justify-between">
                      <span className="flex items-center">
                        <span className="w-3 h-3 rounded-full bg-yellow-500 mr-2"></span>
                        Career Fairs
                      </span>
                      <span className="text-gray-500 text-sm">5</span>
                    </li>
                    <li className="p-2 hover:bg-gray-50 rounded flex justify-between">
                      <span className="flex items-center">
                        <span className="w-3 h-3 rounded-full bg-red-500 mr-2"></span>
                        Social Gatherings
                      </span>
                      <span className="text-gray-500 text-sm">9</span>
                    </li>
                  </ul>
                </div>
                <div className="p-4 bg-gray-50 mt-4">
                  <h4 className="font-medium text-gray-700 mb-2">Create Your Own Event</h4>
                  <p className="text-sm text-gray-600 mb-3">
                    Alumni can organize and promote events for the community
                  </p>
                  <Button className="w-full bg-gray-700 hover:bg-gray-800 text-white text-sm">
                    Submit Event Proposal
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Job Portal */}
      <section className="py-16 bg-gray-50 border-t border-gray-100">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between mb-12">
            <div>
              <h2 className="text-3xl font-bold text-gray-800 mb-4">
                Job Portal
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl">
                Explore career opportunities posted by fellow alumni and industry partners.
              </p>
            </div>
            <Button className="mt-4 md:mt-0 bg-purple-600 hover:bg-purple-700 text-white rounded-md">
              Browse All Jobs
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-200">
                <div className="p-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
                  <h3 className="font-semibold text-gray-700">Featured Opportunities</h3>
                  <div className="flex space-x-2">
                    <Button variant="outline" className="text-sm py-1 border-gray-300 text-gray-600">
                      Filter
                    </Button>
                    <Button variant="outline" className="text-sm py-1 border-gray-300 text-gray-600">
                      Search
                    </Button>
                  </div>
                </div>
                <div className="divide-y divide-gray-100">
                  {featuredJobs.map((job) => (
                    <div key={job.id} className="p-4 hover:bg-gray-50 transition-colors duration-150">
                      <div className="flex flex-col sm:flex-row justify-between">
                        <div>
                          <h4 className="font-semibold text-gray-800 hover:text-purple-600 mb-1">
                            <Link href={`/jobs/${job.id}`}>{job.title}</Link>
                          </h4>
                          <div className="text-sm text-gray-600 mb-2">
                            <span className="font-medium">{job.company}</span> • {job.location}
                          </div>
                          <div className="flex items-center text-sm">
                            <span className="text-gray-500">{job.type}</span>
                            <span className="mx-2 text-gray-300">•</span>
                            <span className="text-gray-500">Posted {job.posted}</span>
                          </div>
                        </div>
                        <div className="mt-3 sm:mt-0">
                          <Button className="text-sm bg-purple-600 hover:bg-purple-700 text-white">
                            Apply Now
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="p-4 border-t border-gray-200 text-center">
                  <Link href="/jobs" className="text-purple-600 hover:text-purple-800 font-medium">
                    View all job listings →
                  </Link>
                </div>
              </div>
            </div>
            <div>
              <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-200 h-full">
                <div className="p-4 border-b border-gray-200 bg-gray-50">
                  <h3 className="font-semibold text-gray-700">Job Resources</h3>
                </div>
                <div className="p-4">
                  <div className="mb-6">
                    <h4 className="font-medium text-gray-800 mb-2">Resume Repository</h4>
                    <p className="text-sm text-gray-600 mb-3">
                      Upload your resume to be discovered by employers seeking AMET talent
                    </p>
                    <Button variant="outline" className="text-sm w-full border-purple-300 text-purple-700 hover:bg-purple-50">
                      <FaFileAlt className="mr-2" /> Upload Resume
                    </Button>
                  </div>
                  <div className="mb-6">
                    <h4 className="font-medium text-gray-800 mb-2">Job Alerts</h4>
                    <p className="text-sm text-gray-600 mb-3">
                      Get notified when new positions match your skills and interests
                    </p>
                    <Button variant="outline" className="text-sm w-full border-purple-300 text-purple-700 hover:bg-purple-50">
                      <FaBell className="mr-2" /> Set Up Alerts
                    </Button>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-800 mb-2">For Employers</h4>
                    <p className="text-sm text-gray-600 mb-3">
                      Looking to hire AMET talent for your organization?
                    </p>
                    <Button variant="outline" className="text-sm w-full border-purple-300 text-purple-700 hover:bg-purple-50">
                      <FaBuilding className="mr-2" /> Post a Job
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mentorship Program */}
      <section className="py-16 bg-white border-t border-gray-100">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-start justify-between mb-12">
            <div>
              <h2 className="text-3xl font-bold text-gray-800 mb-4">
                Mentorship Program
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl">
                Connect with experienced professionals or guide the next generation of AMET alumni.
              </p>
            </div>
            <Button className="mt-4 md:mt-0 bg-orange-600 hover:bg-orange-700 text-white rounded-md">
              Join Program
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-6 border border-orange-200">
              <div className="flex items-center mb-4">
                <div className="bg-orange-500 text-white p-3 rounded-md mr-4">
                  <FaGraduationCap className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-semibold text-orange-800">Become a Mentee</h3>
              </div>
              <p className="text-gray-700 mb-4">
                Get guidance from experienced alumni who've navigated the career path you're interested in. Our matching algorithm connects you with the right mentor.
              </p>
              <ul className="space-y-2 mb-6">
                <li className="flex items-start">
                  <span className="text-orange-500 mr-2">✓</span>
                  <span className="text-gray-600">Career guidance and advice</span>
                </li>
                <li className="flex items-start">
                  <span className="text-orange-500 mr-2">✓</span>
                  <span className="text-gray-600">Industry-specific insights</span>
                </li>
                <li className="flex items-start">
                  <span className="text-orange-500 mr-2">✓</span>
                  <span className="text-gray-600">Professional development support</span>
                </li>
                <li className="flex items-start">
                  <span className="text-orange-500 mr-2">✓</span>
                  <span className="text-gray-600">Network expansion opportunities</span>
                </li>
              </ul>
              <Button className="bg-orange-600 hover:bg-orange-700 text-white w-full">
                Apply as a Mentee
              </Button>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200">
              <div className="flex items-center mb-4">
                <div className="bg-blue-500 text-white p-3 rounded-md mr-4">
                  <FaHandshake className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-semibold text-blue-800">Become a Mentor</h3>
              </div>
              <p className="text-gray-700 mb-4">
              Share your expertise and experience with emerging professionals. Give back to the AMET community while strengthening your leadership skills.
              </p>
              <ul className="space-y-2 mb-6">
                <li className="flex items-start">
                  <span className="text-blue-500 mr-2">✓</span>
                  <span className="text-gray-600">Develop leadership capabilities</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-500 mr-2">✓</span>
                  <span className="text-gray-600">Expand your professional network</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-500 mr-2">✓</span>
                  <span className="text-gray-600">Give back to the AMET community</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-500 mr-2">✓</span>
                  <span className="text-gray-600">Flexible time commitment options</span>
                </li>
              </ul>
              <Button className="bg-blue-600 hover:bg-blue-700 text-white w-full">
                Register as a Mentor
              </Button>
            </div>
          </div>
          
          <div className="mt-10 bg-white rounded-xl shadow-md overflow-hidden border border-gray-200">
            <div className="p-4 border-b border-gray-200 bg-gray-50">
              <h3 className="font-semibold text-gray-700">How Our Mentorship Program Works</h3>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="text-center p-4">
                  <div className="bg-gray-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                    <div className="text-blue-600 font-bold">1</div>
                  </div>
                  <h4 className="font-medium text-gray-800 mb-2">Register</h4>
                  <p className="text-sm text-gray-600">
                    Sign up as a mentor or mentee with your preferences
                  </p>
                </div>
                <div className="text-center p-4">
                  <div className="bg-gray-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                    <div className="text-blue-600 font-bold">2</div>
                  </div>
                  <h4 className="font-medium text-gray-800 mb-2">Get Matched</h4>
                  <p className="text-sm text-gray-600">
                    Our algorithm suggests optimal mentor-mentee pairings
                  </p>
                </div>
                <div className="text-center p-4">
                  <div className="bg-gray-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                    <div className="text-blue-600 font-bold">3</div>
                  </div>
                  <h4 className="font-medium text-gray-800 mb-2">Connect</h4>
                  <p className="text-sm text-gray-600">
                    Establish goals and regular meeting schedules
                  </p>
                </div>
                <div className="text-center p-4">
                  <div className="bg-gray-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                    <div className="text-blue-600 font-bold">4</div>
                  </div>
                  <h4 className="font-medium text-gray-800 mb-2">Grow Together</h4>
                  <p className="text-sm text-gray-600">
                    Develop professionally through guided mentorship
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 bg-gray-50 border-t border-gray-100">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-6">Alumni Success Stories</h2>
            <p className="text-lg mb-8 max-w-2xl mx-auto opacity-90">
              Hear from members who've benefited from our alumni network
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200">
              <div className="flex items-center mb-4">
                <div className="bg-gray-200 w-12 h-12 rounded-full mr-4"></div>
                <div>
                  <h4 className="font-semibold text-gray-800">James Wilson</h4>
                  <p className="text-sm text-gray-500">Class of 2018, Maritime Operations</p>
                </div>
              </div>
              <p className="text-gray-600 italic">
                "Through the AMET alumni network, I found my current position at a leading shipping company. The job portal had exclusive opportunities not listed elsewhere."
              </p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200">
              <div className="flex items-center mb-4">
                <div className="bg-gray-200 w-12 h-12 rounded-full mr-4"></div>
                <div>
                  <h4 className="font-semibold text-gray-800">Elena Rodriguez</h4>
                  <p className="text-sm text-gray-500">Class of 2015, Marine Engineering</p>
                </div>
              </div>
              <p className="text-gray-600 italic">
                "The mentorship program connected me with a senior engineer who helped me navigate the challenges of my early career. Now I'm mentoring others!"
              </p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200">
              <div className="flex items-center mb-4">
                <div className="bg-gray-200 w-12 h-12 rounded-full mr-4"></div>
                <div>
                  <h4 className="font-semibold text-gray-800">David Kim</h4>
                  <p className="text-sm text-gray-500">Class of 2020, Naval Architecture</p>
                </div>
              </div>
              <p className="text-gray-600 italic">
                "The networking events organized through the platform helped me connect with industry leaders and secure partnerships for my maritime startup."
              </p>
            </div>
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