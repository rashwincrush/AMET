'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/auth';
import ProtectedRoute from '@/components/auth/ProtectedRoute';

export default function MentorshipProgramPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <ProtectedRoute>
      <div className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <Link href="/mentorship" className="text-blue-600 hover:text-blue-800">
            &larr; Back to Mentorship
          </Link>
          <h2 className="mt-2 text-3xl font-extrabold text-gray-900">
            How Our Mentorship Program Works
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Learn about our mentorship program and how you can participate.
          </p>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('overview')}
              className={`${activeTab === 'overview' 
                ? 'border-blue-500 text-blue-600' 
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} 
                whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('mentors')}
              className={`${activeTab === 'mentors' 
                ? 'border-blue-500 text-blue-600' 
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} 
                whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              For Mentors
            </button>
            <button
              onClick={() => setActiveTab('mentees')}
              className={`${activeTab === 'mentees' 
                ? 'border-blue-500 text-blue-600' 
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} 
                whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              For Mentees
            </button>
            <button
              onClick={() => setActiveTab('faq')}
              className={`${activeTab === 'faq' 
                ? 'border-blue-500 text-blue-600' 
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} 
                whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              FAQ
            </button>
          </nav>
        </div>

        {/* Content */}
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            {activeTab === 'overview' && (
              <div>
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                  Mentorship Program Overview
                </h3>
                
                <div className="prose max-w-none">
                  <p>
                    Our mentorship program connects experienced alumni (mentors) with those seeking guidance (mentees) 
                    to foster professional growth, career development, and networking opportunities.
                  </p>
                  
                  <h4 className="mt-6 mb-2">How It Works</h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4 mb-6">
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <div className="flex items-center justify-center h-12 w-12 rounded-md bg-blue-500 text-white mb-4">
                        <span className="text-xl font-bold">1</span>
                      </div>
                      <h5 className="text-lg font-medium mb-2">Registration</h5>
                      <p className="text-sm">Alumni can register as mentors by completing a profile that highlights their expertise and experience.</p>
                    </div>
                    
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <div className="flex items-center justify-center h-12 w-12 rounded-md bg-blue-500 text-white mb-4">
                        <span className="text-xl font-bold">2</span>
                      </div>
                      <h5 className="text-lg font-medium mb-2">Matching</h5>
                      <p className="text-sm">Mentees browse mentor profiles and send connection requests to those whose expertise aligns with their goals.</p>
                    </div>
                    
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <div className="flex items-center justify-center h-12 w-12 rounded-md bg-blue-500 text-white mb-4">
                        <span className="text-xl font-bold">3</span>
                      </div>
                      <h5 className="text-lg font-medium mb-2">Mentorship</h5>
                      <p className="text-sm">Once connected, mentors and mentees establish goals, meeting frequency, and communication methods.</p>
                    </div>
                  </div>
                  
                  <h4 className="mt-6 mb-2">Program Benefits</h4>
                  
                  <ul className="list-disc pl-5 space-y-2">
                    <li><strong>For Mentees:</strong> Career guidance, industry insights, skill development, and networking opportunities.</li>
                    <li><strong>For Mentors:</strong> Leadership development, giving back to the community, and expanding professional networks.</li>
                    <li><strong>For the Community:</strong> Strengthened alumni connections, knowledge sharing, and professional development.</li>
                  </ul>
                  
                  <div className="mt-8 flex space-x-4">
                    <Link href="/mentorship/become-mentor">
                      <Button className="bg-blue-600 hover:bg-blue-700">
                        Become a Mentor
                      </Button>
                    </Link>
                    <Link href="/mentorship">
                      <Button variant="outline">
                        Find a Mentor
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            )}
            
            {activeTab === 'mentors' && (
              <div>
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                  Information for Mentors
                </h3>
                
                <div className="prose max-w-none">
                  <p>
                    As a mentor, you'll have the opportunity to share your knowledge and experience with fellow alumni 
                    who are seeking guidance in their professional journeys.
                  </p>
                  
                  <h4 className="mt-6 mb-2">Mentor Responsibilities</h4>
                  
                  <ul className="list-disc pl-5 space-y-2">
                    <li>Commit to regular communication with your mentee(s)</li>
                    <li>Provide guidance, advice, and feedback based on your experience</li>
                    <li>Help mentees set realistic goals and develop action plans</li>
                    <li>Share industry insights and professional connections when appropriate</li>
                    <li>Maintain confidentiality and professional boundaries</li>
                  </ul>
                  
                  <h4 className="mt-6 mb-2">Time Commitment</h4>
                  
                  <p>
                    The time commitment is flexible and can be determined between you and your mentee. 
                    Typically, mentors spend 1-2 hours per month with each mentee through video calls, 
                    emails, or in-person meetings.
                  </p>
                  
                  <h4 className="mt-6 mb-2">How to Become a Mentor</h4>
                  
                  <ol className="list-decimal pl-5 space-y-2">
                    <li>Complete your alumni profile with current professional information</li>
                    <li>Visit the "Become a Mentor" page and fill out the mentor application</li>
                    <li>Specify your areas of expertise, availability, and mentorship style</li>
                    <li>Once approved, your profile will be visible to potential mentees</li>
                    <li>Review and respond to mentorship requests from interested mentees</li>
                  </ol>
                  
                  <div className="mt-8">
                    <Link href="/mentorship/become-mentor">
                      <Button className="bg-blue-600 hover:bg-blue-700">
                        Become a Mentor
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            )}
            
            {activeTab === 'mentees' && (
              <div>
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                  Information for Mentees
                </h3>
                
                <div className="prose max-w-none">
                  <p>
                    As a mentee, you'll have access to guidance from experienced alumni who can help you 
                    navigate your career path, develop new skills, and expand your professional network.
                  </p>
                  
                  <h4 className="mt-6 mb-2">Mentee Responsibilities</h4>
                  
                  <ul className="list-disc pl-5 space-y-2">
                    <li>Take initiative in scheduling meetings and maintaining communication</li>
                    <li>Come prepared to meetings with specific questions or topics to discuss</li>
                    <li>Be receptive to feedback and willing to act on suggestions</li>
                    <li>Respect your mentor's time and expertise</li>
                    <li>Set clear goals for what you hope to achieve through mentorship</li>
                  </ul>
                  
                  <h4 className="mt-6 mb-2">Finding the Right Mentor</h4>
                  
                  <p>
                    When searching for a mentor, consider the following:
                  </p>
                  
                  <ul className="list-disc pl-5 space-y-2">
                    <li><strong>Expertise:</strong> Look for mentors with experience in your field of interest</li>
                    <li><strong>Career Stage:</strong> Consider whether you need guidance from someone early in their career or with decades of experience</li>
                    <li><strong>Industry:</strong> Filter mentors by industry to find relevant connections</li>
                    <li><strong>Mentorship Topics:</strong> Review the specific areas where mentors offer guidance</li>
                  </ul>
                  
                  <h4 className="mt-6 mb-2">How to Request Mentorship</h4>
                  
                  <ol className="list-decimal pl-5 space-y-2">
                    <li>Browse mentor profiles on the mentorship page</li>
                    <li>Review mentor backgrounds, expertise, and mentorship topics</li>
                    <li>Click on a mentor's profile to view more details</li>
                    <li>Send a mentorship request with a personalized message explaining your goals</li>
                    <li>Once accepted, establish communication and set up your first meeting</li>
                  </ol>
                  
                  <div className="mt-8">
                    <Link href="/mentorship">
                      <Button className="bg-blue-600 hover:bg-blue-700">
                        Find a Mentor
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            )}
            
            {activeTab === 'faq' && (
              <div>
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                  Frequently Asked Questions
                </h3>
                
                <div className="space-y-6">
                  <div>
                    <h4 className="text-base font-medium text-gray-900">How long does a mentorship relationship typically last?</h4>
                    <p className="mt-2 text-sm text-gray-500">
                      Mentorship relationships can vary in length depending on the goals and preferences of both parties. 
                      Some may last for a few months to address specific goals, while others may continue for years. 
                      We recommend an initial commitment of at least 3-6 months.
                    </p>
                  </div>
                  
                  <div>
                    <h4 className="text-base font-medium text-gray-900">How many mentees can a mentor take on?</h4>
                    <p className="mt-2 text-sm text-gray-500">
                      Mentors can specify their capacity in their profile. We recommend starting with 1-2 mentees 
                      to ensure you can provide quality guidance. As you become more comfortable with mentoring, 
                      you may choose to increase your capacity.
                    </p>
                  </div>
                  
                  <div>
                    <h4 className="text-base font-medium text-gray-900">Can I change mentors if it's not a good fit?</h4>
                    <p className="mt-2 text-sm text-gray-500">
                      Yes, if you find that your mentorship relationship isn't meeting your needs, you can end the 
                      relationship respectfully and seek a new mentor. We encourage open communication to address 
                      any concerns before ending the relationship.
                    </p>
                  </div>
                  
                  <div>
                    <h4 className="text-base font-medium text-gray-900">Is there a cost to participate in the mentorship program?</h4>
                    <p className="mt-2 text-sm text-gray-500">
                      No, our mentorship program is a free benefit for all alumni. Mentors volunteer their time 
                      to give back to the community.
                    </p>
                  </div>
                  
                  <div>
                    <h4 className="text-base font-medium text-gray-900">How are mentors vetted?</h4>
                    <p className="mt-2 text-sm text-gray-500">
                      All mentor applications are reviewed by our alumni team to ensure mentors have the appropriate 
                      experience and commitment to provide valuable guidance. We also collect feedback from mentees 
                      to maintain the quality of our mentor pool.
                    </p>
                  </div>
                  
                  <div>
                    <h4 className="text-base font-medium text-gray-900">What if I have a conflict with my mentor/mentee?</h4>
                    <p className="mt-2 text-sm text-gray-500">
                      If conflicts arise, we encourage direct communication to resolve issues. If that doesn't work, 
                      you can contact the alumni office for mediation or assistance in finding a new mentor/mentee match.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}